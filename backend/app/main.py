from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, List, Any, Optional
import logging
import asyncio
from pydantic import BaseModel
import websockets

from app.db import db
from app.models import Event, Chunk
from app.agent import get_or_create_agent_processor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Research.inc API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust based on your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_id_map = {}  # Map WebSocket to client_id

    async def connect(self, websocket: WebSocket, client_id: str = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if client_id:
            self.connection_id_map[websocket] = client_id
        logger.info(f"Client connected. Client ID: {client_id}. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            client_id = self.connection_id_map.pop(websocket, None)
            logger.info(f"Client disconnected. Client ID: {client_id}. Total connections: {len(self.active_connections)}")

    async def send_message(self, message: Dict[str, Any], websocket: WebSocket):
        try:
            if websocket in self.active_connections:
                await websocket.send_json(message)
                return True
            return False
        except Exception as e:
            logger.error(f"Error sending message: {str(e)}")
            if websocket in self.active_connections:
                self.disconnect(websocket)
            return False

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_db_client():
    await db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await db.disconnect()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client with a timeout
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)  # 60 second timeout
                event_data = json.loads(data)
                
                logger.info(f"Received event: {event_data}")
                
                # Convert to Event model
                try:
                    event = Event(**event_data)
                    
                    # Get or create appropriate agent processor
                    processor = await get_or_create_agent_processor(
                        chat_id=event.chat_id,
                        document_id=event.document_id
                    )
                    
                    # Process the event asynchronously
                    asyncio.create_task(
                        processor.process_event(
                            event=event,
                            send_chunk=lambda chunk: asyncio.create_task(manager.send_message(chunk, websocket))
                        )
                    )
                except Exception as e:
                    logger.error(f"Error processing event: {str(e)}")
                    await manager.send_message({
                        "type": "error",
                        "content": f"Error processing event: {str(e)}",
                        "end": True
                    }, websocket)
                
            except asyncio.TimeoutError:
                # Send a ping to check if client is still connected
                try:
                    ping_payload = json.dumps({"type": "ping"})
                    await websocket.send_text(ping_payload)
                except:
                    # If sending ping fails, client is disconnected
                    logger.info("Client unresponsive, closing connection")
                    break
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except json.JSONDecodeError:
        logger.error("Received invalid JSON")
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in websocket connection: {str(e)}")
        manager.disconnect(websocket)
    finally:
        # Make sure connection is properly closed and removed
        if websocket in manager.active_connections:
            manager.disconnect(websocket)

# API endpoints for documents and chats

@app.get("/api/documents/{document_id}")
async def get_document(document_id: str):
    """Get a document by ID with its blocks"""
    try:
        document = await db.get_document(document_id, include_blocks=True)
        if not document:
            return {"error": "Document not found"}
        return document
    except Exception as e:
        logger.error(f"Error getting document: {str(e)}")
        return {"error": str(e)}

@app.get("/api/chats/{chat_id}")
async def get_chat(chat_id: str):
    """Get a chat by ID with its messages"""
    try:
        chat = await db.get_chat(chat_id, include_messages=True)
        if not chat:
            return {"error": "Chat not found"}
        return chat
    except Exception as e:
        logger.error(f"Error getting chat: {str(e)}")
        return {"error": str(e)}

@app.post("/api/documents")
async def create_document(user_id: str, title: Optional[str] = "Untitled Document"):
    """Create a new document"""
    try:
        document = await db.create_document(user_id=user_id, title=title)
        return document
    except Exception as e:
        logger.error(f"Error creating document: {str(e)}")
        return {"error": str(e)}

@app.post("/api/chats")
async def create_chat(user_id: str, title: Optional[str] = None):
    """Create a new chat"""
    try:
        chat = await db.create_chat(user_id=user_id, title=title)
        return chat
    except Exception as e:
        logger.error(f"Error creating chat: {str(e)}")
        return {"error": str(e)}

@app.post("/api/blocks/{block_id}/accept")
async def accept_block_changes(block_id: str):
    """Accept new content as current content for a block"""
    try:
        block = await db.get_block(block_id)
        if not block:
            return {"error": "Block not found"}
            
        await db.update_block(block_id, {
            "currentContent": block.newContent,
            "newContent": None
        })
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error accepting block changes: {str(e)}")
        return {"error": str(e)}

@app.post("/api/blocks/{block_id}/reject")
async def reject_block_changes(block_id: str):
    """Reject new content for a block"""
    try:
        await db.update_block(block_id, {
            "newContent": None
        })
        
        return {"success": True}
    except Exception as e:
        logger.error(f"Error rejecting block changes: {str(e)}")
        return {"error": str(e)}

@app.get("/")
async def root():
    return {"message": "Research.inc API is running"} 