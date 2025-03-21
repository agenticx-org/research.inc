import uvicorn
import signal
import sys
import logging
import os
import threading
import time
import asyncio
import subprocess

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Track if we're in shutdown mode to avoid duplicate shutdown calls
_shutdown_in_progress = False

# Use this to detect if we're in a reload operation
_reload_started_at = 0

def handle_exit(signum, frame):
    """Handle exit signals gracefully"""
    global _shutdown_in_progress
    
    if _shutdown_in_progress:
        logger.info("Forced exit due to multiple shutdown signals")
        os._exit(1)  # Force immediate exit if already shutting down
        
    _shutdown_in_progress = True
    logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
    
    try:
        # Try to send a SIGUSR1 to the main process to trigger force shutdown
        # This helps ensure that the thread_manager is aware of the shutdown
        if hasattr(signal, 'SIGUSR1'):
            os.kill(os.getpid(), signal.SIGUSR1)
            # Give it a moment to start shutdown
            time.sleep(0.5)
    except Exception as e:
        logger.warning(f"Failed to send SIGUSR1: {e}")
    
    # Use os._exit instead of sys.exit for more reliable exit
    # when called from signal handler
    os._exit(0)

def monitor_for_reload_hang():
    """This function runs in a background thread to detect reload hangs"""
    global _reload_started_at, _shutdown_in_progress
    
    # Only start timing if we're in a reload situation
    if _reload_started_at > 0:
        # Wait for a fixed amount of time
        time.sleep(5)  # Give 5 seconds max for reload
        
        # If we're still running after the timeout, it's hung
        if _reload_started_at > 0 and time.time() - _reload_started_at > 5 and not _shutdown_in_progress:
            logger.error("Reload appears to be hanging! Forcing exit...")
            
            # Try to trigger our force shutdown mechanism
            try:
                if hasattr(signal, 'SIGUSR1'):
                    logger.info("Sending SIGUSR1 to trigger force shutdown")
                    os.kill(os.getpid(), signal.SIGUSR1)
                    # Give it some time to work
                    time.sleep(1.5)
            except Exception as e:
                logger.warning(f"Failed to send SIGUSR1: {e}")
                
            # If still here, force exit
            _shutdown_in_progress = True
            os._exit(1)  # Force exit

def setup_watchdog():
    """Set up a watchdog thread that will force-exit if reload hangs"""
    thread = threading.Thread(target=monitor_for_reload_hang, daemon=True)
    thread.start()
    logger.info("Started reload watchdog thread")

def setup_final_watchdog():
    """Set up a final watchdog that will force kill the process if it hangs for too long"""
    def _final_watchdog():
        # Wait for a long time - this is the last resort
        time.sleep(12)
        if not _shutdown_in_progress:
            return
        # If we're still in shutdown after this much time, force kill
        logger.critical("FINAL WATCHDOG: Process still hanging after 12 seconds in shutdown. Forcing kill.")
        # On Unix, SIGKILL is more reliable for termination than os._exit
        try:
            os.kill(os.getpid(), signal.SIGKILL)
        except:
            os._exit(1)  # Fallback
    
    thread = threading.Thread(target=_final_watchdog, daemon=True)
    thread.start()
    logger.info("Started final watchdog thread")

if __name__ == "__main__":
    # Get environment variables
    debug_mode = os.environ.get("DEBUG", "false").lower() == "true"
    use_reload = os.environ.get("USE_RELOAD", "true").lower() == "true"
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, handle_exit)
    signal.signal(signal.SIGTERM, handle_exit)
    
    # Set up our final emergency watchdog
    setup_final_watchdog()
    
    try:
        logger.info(f"Starting uvicorn server (debug={debug_mode}, reload={use_reload})")
        
        # Set up a pre-reload hook to detect reload operations
        def handle_pre_reload():
            """Called just before reload happens"""
            global _reload_started_at, _shutdown_in_progress
            logger.info("Reload detected! Preparing for reload...")
            _reload_started_at = time.time()
            _shutdown_in_progress = True  # Mark as shutdown in progress
            
            # Try to send SIGUSR1 to trigger force shutdown in thread_manager
            try:
                if hasattr(signal, 'SIGUSR1'):
                    logger.info("Sending SIGUSR1 to trigger force shutdown for reload")
                    os.kill(os.getpid(), signal.SIGUSR1)
            except Exception as e:
                logger.warning(f"Failed to send SIGUSR1 during reload: {e}")
                
            setup_watchdog()  # Start watchdog
        
        # Try to monkey patch the StatReload module to call our pre-reload hook
        try:
            # Only if reload is enabled
            if use_reload:
                from uvicorn.supervisors.statreload import StatReload
                original_restart = StatReload.restart
                
                def patched_restart(self):
                    handle_pre_reload()
                    return original_restart(self)
                
                StatReload.restart = patched_restart
                logger.info("Successfully patched StatReload for better reload handling")
        except Exception as e:
            logger.warning(f"Could not patch StatReload: {e}")
        
        uvicorn.run(
            "app.main:app", 
            host="0.0.0.0", 
            port=8000, 
            reload=use_reload,
            # debug parameter isn't valid for uvicorn.run
            # Use log_level only
            timeout_keep_alive=65,     # Keep-alive timeout (secs)
            timeout_graceful_shutdown=2,  # Reduced from 3 for faster reloads
            # Add access log config to reduce log noise
            access_log=not debug_mode,
            log_level="debug" if debug_mode else "info"
        )
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Shutting down...")
    except Exception as e:
        logger.error(f"Error running server: {e}")
    finally:
        logger.info("Server shutdown complete") 