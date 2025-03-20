from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
import json

# Event models
class MessageContent(BaseModel):
    content: str
    role: str

class Event(BaseModel):
    name: str
    message: Optional[MessageContent] = None
    model: Optional[str] = None
    mode: Optional[str] = "chat"
    block_id: Optional[str] = None
    document_id: Optional[str] = None
    chat_id: Optional[str] = None
    user_id: str

# Response chunk model
class Chunk(BaseModel):
    type: str
    block_ids: str  # Comma-separated block IDs
    document_id: Optional[str] = None
    content: str
    end: bool = False
    new_doc: bool = False

# Domain models
class User(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    emailVerified: bool
    image: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

class Document(BaseModel):
    id: str
    title: str
    userId: str
    createdAt: datetime
    updatedAt: datetime
    blocks: List["Block"] = []

class Chat(BaseModel):
    id: str
    title: Optional[str] = None
    userId: str
    createdAt: datetime
    updatedAt: datetime
    messages: List["Block"] = []

class Block(BaseModel):
    id: str
    type: str
    currentContent: Optional[str] = None
    newContent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    order: int
    documentId: Optional[str] = None
    chatId: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    def to_chunk(self, content: str, end: bool = False, new_doc: bool = False) -> Chunk:
        """Convert a block to a response chunk for streaming"""
        return Chunk(
            type=self.type,
            block_ids=self.id,
            document_id=self.documentId,
            content=content,
            end=end,
            new_doc=new_doc
        )

    def update_content(self, content: str, is_new: bool = True) -> None:
        """Update the content of the block"""
        if is_new:
            self.newContent = content
        else:
            self.currentContent = content
        self.updatedAt = datetime.now()

# Update forward references for nested models
Document.update_forward_refs()
Chat.update_forward_refs() 