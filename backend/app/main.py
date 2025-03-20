from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, List, Any
import logging
import asyncio
from pydantic import BaseModel
import websockets

from app.stream_handler import process_message

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chat API")

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

# Models
class ChatMessage(BaseModel):
    message: str
    model_id: str
    is_agent: bool

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Receive message from client with a timeout
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)  # 60 second timeout
                message_data = json.loads(data)
                
                logger.info(f"Received message: {message_data}")
                
                # Process the message using the stream handler
                await process_message(
                    message=message_data.get("message", ""),
                    model_id=message_data.get("model_id", "claude3.7"),
                    is_agent=message_data.get("is_agent", True),
                    send_chunk=lambda chunk: asyncio.create_task(manager.send_message(chunk, websocket))
                )
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

@app.get("/")
async def root():
    return {"message": "Chat API is running"} 