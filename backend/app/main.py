from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Dict, List, Any, Optional
import logging
import asyncio
import threading
from pydantic import BaseModel
import websockets
import signal
import os
import time
from dotenv import load_dotenv

from app.stream_handler import process_message
from app.thread_manager import ThreadManager, cancel_all_tasks, set_force_shutdown_mode

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create global thread manager
thread_manager = ThreadManager()

# Flag to indicate if shutdown has been triggered
shutdown_flag = False

def force_shutdown_on_reload():
    """Force shutdown the process after a timeout if reload is hung"""
    global shutdown_flag
    
    # Set the shutdown flag
    shutdown_flag = True
    logger.warning("Force shutdown requested due to reload signal")
    
    # Activate force shutdown mode in thread manager
    set_force_shutdown_mode()
    
    # After allowing time for normal shutdown, force exit
    def _force_exit_after_timeout():
        time.sleep(7)  # Allow 7 seconds for normal shutdown
        logger.critical("Force exit triggered - server may be hung during reload")
        os._exit(1)  # Force exit the process
        
    # Start the force exit thread
    force_thread = threading.Thread(target=_force_exit_after_timeout, daemon=True)
    force_thread.start()

@app.on_event("startup")
async def startup_event():
    """
    Run when the server starts up.
    """
    logger.info("Server starting up")
    
    # Register handler for SIGUSR1 (used by development servers during reload)
    try:
        # Used by development servers to signal reload
        signal.signal(signal.SIGUSR1, lambda sig, frame: force_shutdown_on_reload())
        logger.info("Registered SIGUSR1 handler for reload signal")
    except Exception as e:
        logger.warning(f"Could not register SIGUSR1 handler: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Run when the server is shutting down.
    """
    global shutdown_flag
    shutdown_flag = True
    logger.info("Server shutting down - cancelling all tasks")
    
    # Cancel all tasks and wait up to 2 seconds for them to complete
    try:
        # Create a task for canceling all tasks to ensure it doesn't block
        cancel_task = asyncio.create_task(cancel_all_tasks())
        
        # Set a timeout for task cancellation
        try:
            await asyncio.wait_for(cancel_task, timeout=2.0)
            logger.info("All tasks cancelled successfully")
        except asyncio.TimeoutError:
            logger.warning("Task cancellation timed out after 2 seconds")
        except Exception as e:
            logger.error(f"Error during task cancellation: {e}")
            
        # Add this - force socket closure through OS
        if hasattr(app, 'state') and hasattr(app.state, 'server'):
            app.state.server.force_exit = True
            
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")
        
    logger.info("Server shutdown complete")

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
            # Check if the server is shutting down
            if shutdown_flag:
                logger.info("Server is shutting down, closing WebSocket connection")
                break
                
            # Receive message from client with a timeout
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)  # 60 second timeout
                message_data = json.loads(data)
                
                logger.info(f"Received message: {message_data}")
                
                # Get the event name and block_id
                event_name = message_data.get("name", "chat_message")
                block_ids = message_data.get("block_ids", "default_block")
                
                # Split block_ids if it's a comma-separated string
                if isinstance(block_ids, str) and "," in block_ids:
                    block_id_list = [bid.strip() for bid in block_ids.split(",")]
                    # Use the first block_id as primary if multiple
                    primary_block_id = block_id_list[0]
                else:
                    primary_block_id = block_ids
                
                # Create a wrapper to send messages with proper block_id
                async def send_func(message: Dict[str, Any]) -> bool:
                    logger.info(f"Sending message: {message}")
                    # If no block_ids in message, add the primary one
                    if "block_ids" not in message and block_ids:
                        message["block_ids"] = block_ids
                    return await manager.send_message(message, websocket)
                
                # Handle different event types
                if event_name == "stop":
                    # Stop event just cancels the task for the block_id
                    await thread_manager.stop_task(websocket, primary_block_id)
                    await send_func({
                        "type": "status", 
                        "status": "complete", 
                        "message": "Processing stopped"
                    })
                else:
                    # Use a separate task to process the request - doesn't block the WebSocket loop
                    task = asyncio.create_task(
                        thread_manager.process_for_block(
                            websocket=websocket,
                            block_id=primary_block_id,
                            event=message_data,
                            processor=process_message,
                            send_func=send_func
                        )
                    )
                    # Don't wait for it - ThreadManager will handle its lifecycle
                
            except asyncio.TimeoutError:
                # Check if we're shutting down
                if shutdown_flag:
                    break
                    
                # Send a ping to check if client is still connected
                try:
                    ping_payload = json.dumps({"type": "ping"})
                    await websocket.send_text(ping_payload)
                except:
                    # If sending ping fails, client is disconnected
                    logger.info("Client unresponsive, closing connection")
                    break
                
    except WebSocketDisconnect:
        # Stop all tasks for this websocket
        await thread_manager.stop_all_tasks(websocket)
        manager.disconnect(websocket)
    except json.JSONDecodeError:
        logger.error("Received invalid JSON")
        await thread_manager.stop_all_tasks(websocket)
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in websocket connection: {str(e)}")
        await thread_manager.stop_all_tasks(websocket)
        manager.disconnect(websocket)
    finally:
        # Make sure connection is properly closed and removed
        if websocket in manager.active_connections:
            await thread_manager.stop_all_tasks(websocket)
            manager.disconnect(websocket)

@app.get("/")
async def root():
    """Root endpoint to check if the server is running."""
    return {"status": "running"} 