import asyncio
import logging
import json
import random
import time
from typing import Dict, Any, List, Callable, AsyncGenerator, Awaitable

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fake responses to simulate different model outputs
FAKE_RESPONSES = {
    "default": [
        "I'd be happy to help with that question. ",
        "Based on my understanding, there are several key points to consider. ",
        "First, it's important to note that this topic has multiple aspects. ",
        "Let me break this down step by step for better clarity. ",
        "In conclusion, I hope this explanation helps you understand the concept better.",
    ],
    "code_example": [
        "Here's an example of how you could implement this in Python:\n\n```python\n",
        "def hello_world():\n",
        "    print('Hello, world!')\n",
        "    \n",
        "# Call the function\n",
        "hello_world()\n",
        "```\n\nThis simple function demonstrates the basic concept.",
    ],
    "web_search": [
        {"type": "text", "text": "I found some relevant information on the web. Here's what I discovered:"},
        {
            "type": "element",
            "element": {
                "type": "web_search",
                "content": {
                    "title": "Example Search Result",
                    "url": "https://example.com/result",
                    "snippet": "This is a simulated web search result that would contain relevant information about your query."
                }
            }
        },
        {"type": "text", "text": "This information should help answer your question."}
    ],
}

class StreamingLLMSimulator:
    """
    Simulates streaming responses from an LLM with different response types.
    """
    
    def __init__(self, model_id: str, is_agent: bool):
        self.model_id = model_id
        self.is_agent = is_agent
    
    async def generate_streaming_response(self, message: str) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Generate a simulated streaming response based on the input message.
        Returns chunks of content that mimic an LLM's streaming output.
        """
        # Determine response type based on content of message
        if "code" in message.lower() or "example" in message.lower() or "function" in message.lower():
            response_type = "code_example"
        elif self.is_agent and ("search" in message.lower() or "find" in message.lower()):
            response_type = "web_search"
        else:
            response_type = "default"
            
        # Get the appropriate response template
        response_chunks = FAKE_RESPONSES[response_type]
        
        # For agent mode with complex response types (like web_search)
        if isinstance(response_chunks[0], dict):
            for chunk in response_chunks:
                yield chunk
                await asyncio.sleep(0.7)  # Slower for complex elements
            return
            
        # For text-based streaming responses
        for chunk in response_chunks:
            # For code blocks, we'll stream them faster
            delay = 0.1 if response_type == "code_example" else random.uniform(0.2, 0.5)
            
            # Yield the text chunk
            yield {"type": "text", "text": chunk}
            
            # Wait to simulate typing speed
            await asyncio.sleep(delay)

async def process_message(
    event: Dict[str, Any], 
    send_chunk: Callable[[Dict[str, Any]], Awaitable[bool]]
) -> None:
    """
    Process a message and stream the response using the provided callback.
    
    Args:
        event: The event data, including message content, model, and block_ids
        send_chunk: Async function to send chunks back to the client
    """
    # Set a max time for the entire process
    MAX_PROCESS_TIME = 60  # seconds
    start_time = time.time()
    
    logger.info(f"Processing message for block_ids: {event.get('block_ids', '')}")
    logger.info(f"Event: {event}")

    try:
        # Extract event data
        model = event.get("model", "default_model")
        mode = event.get("mode", "chat")
        message_content = event.get("message", {}).get("content", "")
        block_ids = event.get("block_ids", "")
        
        logger.info(f"Processing message for block_ids: {block_ids}")
        
        # Create simulator
        simulator = StreamingLLMSimulator(model, mode == "agent")

        logger.info(f"About to send thinking status")
        
        # Send thinking state
        sent = await send_chunk({"type": "status", "status": "thinking"})
        if not sent:
            logger.warning("Failed to send thinking status, client likely disconnected")
            return
        
        # Simulate processing delay but check for cancellation
        for _ in range(8):  # 0.8 seconds in 0.1s increments
            await asyncio.sleep(0.1)
            # Regular check if we should exit (e.g., due to timeout)
            if time.time() - start_time > MAX_PROCESS_TIME:
                logger.warning(f"Processing exceeded max time ({MAX_PROCESS_TIME}s), exiting")
                return
        
        # Stream the response
        try:
            async for chunk in simulator.generate_streaming_response(message_content):
                # Check if streaming is taking too long
                if time.time() - start_time > MAX_PROCESS_TIME:
                    logger.warning(f"Streaming exceeded max time ({MAX_PROCESS_TIME}s), stopping")
                    break
                
                # Check if sending was successful, break if not
                result = await send_chunk({
                    "type": "md",
                    "content": chunk
                })
                
                if result is False:
                    logger.warning("Client disconnected during streaming, stopping response generation")
                    return
                
                # Add a small sleep to improve cancellation responsiveness
                await asyncio.sleep(0.01)
        except asyncio.CancelledError:
            # If cancelled during the streaming loop, propagate
            logger.info(f"Task cancelled during streaming for block_ids: {block_ids}")
            raise
        
        # Send completion message if we made it through
        try:
            await send_chunk({"type": "status", "status": "complete"})
        except Exception as e:
            logger.warning(f"Failed to send completion status: {e}")
        
    except asyncio.CancelledError:
        # Handle cancellation gracefully
        logger.info(f"Task cancelled for block_ids: {event.get('block_ids', '')}")
        # Don't send any more messages
        raise
        
    except Exception as e:
        logger.error(f"Error in process_message: {str(e)}")
        # Try to send error status if possible
        try:
            await send_chunk({"type": "status", "status": "error"})
        except:
            pass 