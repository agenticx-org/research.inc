from prisma import Prisma
from typing import Optional, List, Dict, Any, Union
import logging
import json
from uuid import uuid4
from datetime import datetime

# Set up logging
logger = logging.getLogger(__name__)

class Database:
    """Database interface using Prisma Client"""
    
    def __init__(self):
        self.db = Prisma()
        self.connected = False
    
    async def connect(self):
        """Connect to the database"""
        if not self.connected:
            await self.db.connect()
            self.connected = True
            logger.info("Connected to database")
    
    async def disconnect(self):
        """Disconnect from the database"""
        if self.connected:
            await self.db.disconnect()
            self.connected = False
            logger.info("Disconnected from database")
    
    # User methods
    async def get_user(self, user_id: str):
        """Get a user by ID"""
        await self.connect()
        return await self.db.user.find_unique(where={"id": user_id})
    
    # Document methods
    async def create_document(self, user_id: str, title: str = "Untitled Document"):
        """Create a new document"""
        await self.connect()
        return await self.db.document.create(
            data={
                "title": title,
                "userId": user_id,
            }
        )
    
    async def get_document(self, document_id: str, include_blocks: bool = False):
        """Get a document by ID"""
        await self.connect()
        include_data = {}
        if include_blocks:
            include_data["blocks"] = {
                "orderBy": {
                    "order": "asc"
                }
            }
        
        return await self.db.document.find_unique(
            where={"id": document_id},
            include=include_data if include_data else None
        )
    
    async def update_document(self, document_id: str, data: Dict[str, Any]):
        """Update a document"""
        await self.connect()
        return await self.db.document.update(
            where={"id": document_id},
            data=data
        )
    
    # Chat methods
    async def create_chat(self, user_id: str, title: Optional[str] = None):
        """Create a new chat"""
        await self.connect()
        return await self.db.chat.create(
            data={
                "title": title,
                "userId": user_id,
            }
        )
    
    async def get_chat(self, chat_id: str, include_messages: bool = False):
        """Get a chat by ID"""
        await self.connect()
        include_data = {}
        if include_messages:
            include_data["messages"] = {
                "orderBy": {
                    "order": "asc"
                }
            }
        
        return await self.db.chat.find_unique(
            where={"id": chat_id},
            include=include_data if include_data else None
        )
    
    # Block methods
    async def create_block(self, 
                         type: str,
                         order: int,
                         document_id: Optional[str] = None,
                         chat_id: Optional[str] = None,
                         current_content: Optional[str] = None,
                         new_content: Optional[str] = None,
                         metadata: Optional[Dict[str, Any]] = None):
        """Create a new block"""
        await self.connect()
        
        if not document_id and not chat_id:
            raise ValueError("Block must be associated with either a document or chat")
        
        data = {
            "type": type,
            "order": order,
            "currentContent": current_content,
            "newContent": new_content,
            "metadata": json.dumps(metadata) if metadata else None,
        }
        
        if document_id:
            data["document"] = {"connect": {"id": document_id}}
        
        if chat_id:
            data["chat"] = {"connect": {"id": chat_id}}
        
        return await self.db.block.create(data=data)
    
    async def get_block(self, block_id: str):
        """Get a block by ID"""
        await self.connect()
        return await self.db.block.find_unique(where={"id": block_id})
    
    async def update_block(self, block_id: str, data: Dict[str, Any]):
        """Update a block"""
        await self.connect()
        
        # Convert metadata to JSON string if it exists
        if "metadata" in data and data["metadata"] is not None:
            data["metadata"] = json.dumps(data["metadata"])
            
        return await self.db.block.update(
            where={"id": block_id},
            data=data
        )
    
    async def get_next_block_order(self, document_id: Optional[str] = None, chat_id: Optional[str] = None):
        """Get the next order value for a block in a document or chat"""
        await self.connect()
        
        where = {}
        if document_id:
            where["documentId"] = document_id
        elif chat_id:
            where["chatId"] = chat_id
        else:
            raise ValueError("Either document_id or chat_id must be provided")
        
        result = await self.db.block.find_many(
            where=where,
            order={"order": "desc"},
            take=1
        )
        
        if result and len(result) > 0:
            return result[0].order + 1
        
        return 0

# Create a singleton instance
db = Database() 