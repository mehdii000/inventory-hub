import os
import time
import threading

# This function make sure we are not a stranded process.
def check_parent():
    while True:
        # If the parent process (Electron) is gone, os.getppid() 
        # usually changes to 1 or the process simply fails to find the parent.
        if os.getppid() == 1: 
            os._exit(0)
        time.sleep(2)

# Start a background thread to watch for Electron's death
def begin_check():
    threading.Thread(target=check_parent, daemon=True).start()
