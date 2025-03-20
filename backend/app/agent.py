import asyncio
import logging
import json
import uuid
from typing import Dict, Any, List, Callable, Optional, AsyncGenerator, Union
from datetime import datetime
import anthropic

from app.db import db
from app.models import Event, Chunk, Block

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Store active agent processors
active_processors = {}

class AgentProcessor:
    """
    Processor for handling agent requests and managing LLM interactions.
    """
    
    def __init__(self, chat_id: Optional[str] = None, document_id: Optional[str] = None):
        self.chat_id = chat_id
        self.document_id = document_id
        self.client = anthropic.Anthropic()
        self.is_processing = False
        self.should_stop = False
        self.should_pause = False
        self.current_blocks = {}  # block_id -> current content
    
    async def process_event(self, event: Event, send_chunk: Callable[[Dict[str, Any]], None]) -> None:
        """
        Process an event and stream the response using the provided callback.
        """
        try:
            if event.name == "stop":
                self.should_stop = True
                return
            
            if event.name == "pause":
                self.should_pause = True
                return
                
            if event.name == "chat_message" and event.message:
                # Load existing context if needed
                if self.chat_id:
                    await self._load_chat_context(self.chat_id)
                
                if self.document_id:
                    await self._load_document_context(self.document_id)
                
                # Create a new block if needed
                block_id = event.block_id
                if not block_id:
                    block_id = str(uuid.uuid4())
                
                # Determine where to create the block
                parent_id = self.chat_id
                parent_type = "chat"
                if event.mode == "document" and self.document_id:
                    parent_id = self.document_id
                    parent_type = "document"
                
                # Register the block in the database
                block = await self._create_or_update_block(
                    block_id=block_id,
                    parent_id=parent_id,
                    parent_type=parent_type,
                    content_type="md",
                    initial_content=""
                )
                
                # Start streaming the response
                self.is_processing = True
                model = event.model or "claude-3-5-sonnet-20240620"
                
                # Stream content chunks
                is_first_chunk = True
                async for chunk in self._stream_llm_response(event, model):
                    if self.should_stop:
                        break
                    
                    if self.should_pause:
                        # Save current state and exit
                        await self._save_block_content(block_id, self.current_blocks.get(block_id, ""))
                        self.should_pause = False
                        self.is_processing = False
                        return
                    
                    # Accumulate content in memory
                    current_content = self.current_blocks.get(block_id, "")
                    current_content += chunk
                    self.current_blocks[block_id] = current_content
                    
                    # Send the chunk to the client
                    response_chunk = {
                        "type": "md",
                        "block_ids": block_id,
                        "content": chunk,
                        "end": False
                    }
                    
                    if self.document_id:
                        response_chunk["document_id"] = self.document_id
                        
                    # Add new_doc flag for first chunks in document mode
                    if is_first_chunk and parent_type == "document":
                        response_chunk["new_doc"] = True
                        is_first_chunk = False
                    
                    send_chunk(response_chunk)
                    
                    # Periodically save content to database
                    if len(current_content) % 500 == 0:
                        await self._save_block_content(block_id, current_content)
                
                # Final save with end marker
                await self._save_block_content(block_id, self.current_blocks.get(block_id, ""))
                send_chunk({
                    "type": "md",
                    "block_ids": block_id,
                    "content": "",
                    "end": True,
                    "document_id": self.document_id if self.document_id else None
                })
                
                self.is_processing = False
        
        except Exception as e:
            logger.error(f"Error in process_event: {str(e)}")
            # Try to send error status if possible
            try:
                send_chunk({
                    "type": "error",
                    "block_ids": event.block_id or "",
                    "content": f"Error processing event: {str(e)}",
                    "end": True
                })
            except:
                pass
            
            self.is_processing = False
    
    async def _create_or_update_block(self, 
                                    block_id: str, 
                                    parent_id: str, 
                                    parent_type: str, 
                                    content_type: str,
                                    initial_content: str = "") -> Block:
        """Create or update a block in the database"""
        existing_block = await db.get_block(block_id)
        
        if existing_block:
            # Update existing block
            await db.update_block(block_id, {
                "newContent": initial_content
            })
            return existing_block
        else:
            # Create new block
            document_id = None
            chat_id = None
            
            if parent_type == "document":
                document_id = parent_id
            else:
                chat_id = parent_id
            
            order = await db.get_next_block_order(document_id=document_id, chat_id=chat_id)
            
            return await db.create_block(
                type=content_type,
                order=order,
                document_id=document_id,
                chat_id=chat_id,
                new_content=initial_content
            )
    
    async def _save_block_content(self, block_id: str, content: str) -> None:
        """Save block content to the database"""
        try:
            await db.update_block(block_id, {
                "newContent": content
            })
        except Exception as e:
            logger.error(f"Error saving block content: {str(e)}")
    
    async def _load_chat_context(self, chat_id: str) -> None:
        """Load the context of an existing chat"""
        try:
            chat = await db.get_chat(chat_id, include_messages=True)
            if not chat:
                logger.warning(f"Chat not found: {chat_id}")
                return
                
            # Load blocks into memory as needed
            # This is a simplified implementation
        except Exception as e:
            logger.error(f"Error loading chat context: {str(e)}")
    
    async def _load_document_context(self, document_id: str) -> None:
        """Load the context of an existing document"""
        try:
            document = await db.get_document(document_id, include_blocks=True)
            if not document:
                logger.warning(f"Document not found: {document_id}")
                return
                
            # Load blocks into memory as needed
            # This is a simplified implementation
        except Exception as e:
            logger.error(f"Error loading document context: {str(e)}")
    
    async def _stream_llm_response(self, event: Event, model: str) -> AsyncGenerator[str, None]:
        """
        Stream a response from the LLM for the given event.
        In a real implementation, this would call the actual LLM.
        """
        # For demonstration purposes, we'll use a simulated response
        # In a real implementation, you would call Anthropic's API
        if event.message and event.message.content:
            message_content = event.message.content
            
            # Example response chunks - in a real implementation, this would come from the LLM
            response_chunks = [
                "I'm processing your request about ",
                f"'{message_content}'. ",
                "Let me think about this...\n\n",
                "Based on my analysis, I can provide the following insights:\n\n",
                "1. First point about the topic\n",
                "2. Second important consideration\n",
                "3. Additional relevant information\n\n",
                "Would you like me to elaborate on any specific aspect?"
            ]
            
            for chunk in response_chunks:
                if self.should_stop or self.should_pause:
                    break
                    
                # In a real implementation, this would be the text from the LLM stream
                yield chunk
                
                # Simulate typing speed
                await asyncio.sleep(0.3)
        else:
            yield "I'm not sure what you're asking. Could you please provide more details?"

async def get_or_create_agent_processor(chat_id: Optional[str] = None, document_id: Optional[str] = None) -> AgentProcessor:
    """
    Get an existing agent processor or create a new one.
    """
    processor_key = f"{chat_id}_{document_id}"
    
    if processor_key not in active_processors or active_processors[processor_key].should_stop:
        active_processors[processor_key] = AgentProcessor(chat_id=chat_id, document_id=document_id)
    
    return active_processors[processor_key] 