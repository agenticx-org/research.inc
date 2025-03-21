import asyncio
import logging
import time
import threading
from typing import Dict, Any, Set, Optional, Callable, Awaitable
from fastapi import WebSocket
import weakref

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global registry of all active tasks for shutdown handling
_ALL_TASKS = set()

# Force shutdown flag
_FORCE_SHUTDOWN = False

# Emergency watchdog to force cleanup if shutdown is hung
def _start_emergency_watchdog():
    """Start a thread to force exit if shutdown is still hanging after a timeout"""
    def _watchdog():
        # Wait a few seconds to see if normal shutdown completes
        time.sleep(5)
        # If we're still running, force kill
        logger.critical("Emergency watchdog triggered! Some tasks are hung. Forcing exit.")
        import os
        os._exit(1)
    
    # Start the watchdog thread
    thread = threading.Thread(target=_watchdog, daemon=True)
    thread.start()
    logger.warning("Started emergency watchdog thread for shutdown")

def set_force_shutdown_mode():
    """Signal that a force shutdown is needed, which will skip waiting for tasks"""
    global _FORCE_SHUTDOWN
    _FORCE_SHUTDOWN = True
    logger.warning("Force shutdown mode enabled - tasks will not be awaited")
    
    # Start emergency watchdog
    _start_emergency_watchdog()

class ThreadManager:
    """
    Manages processing tasks per block_id and WebSocket connection.
    Allows canceling existing tasks when new ones for the same block_id are received.
    """
    
    def __init__(self):
        # Maps WebSocket -> Dict[block_id -> task]
        # Using weakref to avoid memory leaks if connections aren't properly cleaned up
        self.connection_tasks = weakref.WeakKeyDictionary()
        
    def get_task(self, websocket: WebSocket, block_id: str) -> Optional[asyncio.Task]:
        """Get the task for a specific block_id and websocket if it exists"""
        if websocket not in self.connection_tasks:
            return None
            
        return self.connection_tasks[websocket].get(block_id)
    
    def register_task(self, websocket: WebSocket, block_id: str, task: asyncio.Task) -> None:
        """Register a new task for a block_id and websocket"""
        # Initialize the dict for this websocket if it doesn't exist
        if websocket not in self.connection_tasks:
            self.connection_tasks[websocket] = {}
            
        # Store the task
        self.connection_tasks[websocket][block_id] = task
        
        # Add to global registry for shutdown handling
        _ALL_TASKS.add(task)
        
        # Set up automatic cleanup when task completes
        task.add_done_callback(
            lambda t: self._cleanup_task(websocket, block_id, t)
        )
    
    def _cleanup_task(self, websocket: WebSocket, block_id: str, task: asyncio.Task) -> None:
        """Remove a task from tracking when it completes"""
        # Remove from global registry
        if task in _ALL_TASKS:
            _ALL_TASKS.remove(task)
        
        # Remove from connection-specific tracking
        if websocket in self.connection_tasks and block_id in self.connection_tasks[websocket]:
            # Only remove if it's the same task (it might have been replaced)
            if self.connection_tasks[websocket][block_id] == task:
                del self.connection_tasks[websocket][block_id]
                logger.info(f"Removed completed task for block_id: {block_id}")
                
            # Clean up the websocket entry if no more tasks
            if not self.connection_tasks[websocket]:
                del self.connection_tasks[websocket]
    
    async def stop_task(self, websocket: WebSocket, block_id: str) -> bool:
        """Stop a specific task by block_id"""
        task = self.get_task(websocket, block_id)
        if task and not task.done():
            logger.info(f"Cancelling task for block_id: {block_id}")
            task.cancel()
            
            # Check if in force shutdown mode
            if _FORCE_SHUTDOWN:
                logger.warning(f"Force shutdown mode: not awaiting task for block_id: {block_id}")
                return True
            
            # Wait for task to actually cancel with a timeout
            try:
                # Use wait_for with a timeout so we don't wait forever
                await asyncio.wait_for(asyncio.shield(task), timeout=1.0)
            except asyncio.TimeoutError:
                logger.warning(f"Task cancellation timed out for block_id: {block_id}")
            except asyncio.CancelledError:
                logger.info(f"Task successfully cancelled for block_id: {block_id}")
            except Exception as e:
                logger.error(f"Error waiting for task cancellation: {e}")
                
            return True
        return False
    
    async def stop_all_tasks(self, websocket: WebSocket) -> None:
        """Stop all tasks for a websocket connection"""
        if websocket not in self.connection_tasks:
            return
            
        tasks = list(self.connection_tasks[websocket].values())
        block_ids = list(self.connection_tasks[websocket].keys())
        
        if not tasks:
            return
            
        logger.info(f"Cancelling {len(tasks)} tasks for websocket")
        
        # Cancel all tasks
        for i, task in enumerate(tasks):
            if not task.done():
                logger.info(f"Cancelling task for block_id: {block_ids[i]}")
                task.cancel()
        
        # Check if in force shutdown mode
        if _FORCE_SHUTDOWN:
            logger.warning("Force shutdown mode: not awaiting task cancellations")
            # Clear the dictionary
            if websocket in self.connection_tasks:
                self.connection_tasks[websocket] = {}
            return
            
        # Wait for all tasks to cancel with timeout
        if tasks:
            try:
                # Wait with a shorter timeout
                done, pending = await asyncio.wait(
                    tasks, 
                    timeout=1.0,  # shorter timeout (was 2.0)
                    return_when=asyncio.ALL_COMPLETED
                )
                
                if pending:
                    logger.warning(f"{len(pending)} tasks didn't complete in time")
            except Exception as e:
                logger.error(f"Error waiting for tasks cancellation: {e}")
        
        # Clear the dictionary
        if websocket in self.connection_tasks:
            self.connection_tasks[websocket] = {}
    
    async def process_for_block(
        self,
        websocket: WebSocket,
        block_id: str,
        event: Dict[str, Any],
        processor: Callable[[Dict[str, Any], Callable[[Dict[str, Any]], Awaitable[bool]]], Awaitable[None]],
        send_func: Callable[[Dict[str, Any]], Awaitable[bool]]
    ) -> None:
        """
        Process an event for a specific block_id, cancelling any existing processing.
        
        Args:
            websocket: The WebSocket connection
            block_id: Identifier for the block being processed
            event: The event data to process
            processor: Function that processes the event (like process_message)
            send_func: Function to send responses back via WebSocket
        """
        # Create a task start timestamp for debugging
        start_time = time.time()
        
        # First stop any existing task for this block_id
        await self.stop_task(websocket, block_id)
        
        # Create a new task
        task = asyncio.create_task(processor(event, send_func))
        task.set_name(f"block_{block_id}_{start_time}")
        
        # Register it
        self.register_task(websocket, block_id, task)
        
        # Wait for it to complete
        try:
            await task
            logger.info(f"Task for block_id {block_id} completed in {time.time() - start_time:.2f}s")
        except asyncio.CancelledError:
            logger.info(f"Task for block_id {block_id} was cancelled after {time.time() - start_time:.2f}s")
        except Exception as e:
            logger.error(f"Error in processing task for block_id {block_id}: {e}")
            # Try to send error status
            try:
                await send_func({"type": "status", "status": "error", "block_ids": block_id})
            except:
                pass

# Helper function to cancel all tasks (used during application shutdown)
async def cancel_all_tasks():
    """Cancel all tracked tasks"""
    # Set force shutdown mode after 3 seconds if still running
    def _enable_force_after_delay():
        time.sleep(3)
        if len(_ALL_TASKS) > 0:
            set_force_shutdown_mode()
    
    # Start a thread to enable force mode if this takes too long
    force_thread = threading.Thread(target=_enable_force_after_delay, daemon=True)
    force_thread.start()
    
    if not _ALL_TASKS:
        return
        
    tasks = list(_ALL_TASKS)
    logger.info(f"Cancelling all {len(tasks)} tracked tasks for application shutdown")
    
    # Cancel all tasks
    for task in tasks:
        if not task.done():
            task.cancel()
    
    # Check if in force shutdown mode
    if _FORCE_SHUTDOWN:
        logger.warning("Force shutdown mode: not awaiting task cancellations")
        _ALL_TASKS.clear()
        return
    
    # Wait for cancellations with timeout
    if tasks:
        try:
            done, pending = await asyncio.wait(
                tasks, 
                timeout=2.0,  # Reduced from 3.0 second timeout
                return_when=asyncio.ALL_COMPLETED
            )
            
            if pending:
                logger.warning(f"{len(pending)} tasks didn't complete in time during shutdown")
        except Exception as e:
            logger.error(f"Error during global task cancellation: {e}")
    
    # Clear the global tasks set
    _ALL_TASKS.clear() 