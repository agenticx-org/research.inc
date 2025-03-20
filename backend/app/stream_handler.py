import asyncio
import logging
import json
import random
from typing import Dict, Any, List, Callable, AsyncGenerator

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
    message: str, 
    model_id: str, 
    is_agent: bool,
    send_chunk: Callable[[Dict[str, Any]], None]
) -> None:
    """
    Process a message and stream the response using the provided callback.
    """
    simulator = StreamingLLMSimulator(model_id, is_agent)
    
    # Send thinking state
    try:
        send_chunk({"type": "status", "status": "thinking"})
        
        # Simulate processing delay
        await asyncio.sleep(0.8)
        
        # Stream the response
        async for chunk in simulator.generate_streaming_response(message):
            # Check if sending was successful, break if not
            result = send_chunk({"type": "chunk", "content": chunk})
            if result is False:  # If send_chunk returns False, stop streaming
                logger.warning("Client disconnected during streaming, stopping response generation")
                return
        
        # Send completion message
        send_chunk({"type": "status", "status": "complete"})
        
    except Exception as e:
        logger.error(f"Error in process_message: {str(e)}")
        # Try to send error status if possible
        try:
            send_chunk({"type": "status", "status": "error"})
        except:
            pass 