#!/usr/bin/env python3
import subprocess
import time
import webbrowser
import os
import sys

def main():
    print("Starting ClauseNet Local Environment...")
    
    # Try to find uvicorn and python in miniconda where dependencies were installed
    conda_bin = os.path.expanduser("~/miniconda3/bin")
    if os.path.exists(os.path.join(conda_bin, "python")):
        python_exe = os.path.join(conda_bin, "python")
    else:
        python_exe = sys.executable
        
    print(f"Using Python: {python_exe}")
    project_root = os.path.dirname(os.path.abspath(__file__))
    try:
        subprocess.run(["pkill", "-f", "uvicorn backend.main:app"], stderr=subprocess.DEVNULL)
        subprocess.run(["pkill", "-f", "http.server 8080"], stderr=subprocess.DEVNULL)
        time.sleep(1)
    except Exception:
        pass
    
    # Start the FastAPI Backend
    print("Starting Backend (FastAPI on port 8000)...")
    backend_process = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "backend.main:app", "--port", "8000"],
        cwd=project_root
    )
    
    # Start the Frontend static server
    print("Starting Frontend Server (Port 8080)...")
    frontend_process = subprocess.Popen(
        [python_exe, "-m", "http.server", "8080"],
        cwd=project_root
    )
    
    print("Waiting for servers to start...")
    time.sleep(3) # Give them a moment to bind to ports
    
    url = "http://localhost:8080/frontend_preview.html"
    print(f"\nOpening {url} in your default browser...")
    webbrowser.open(url)
    
    print("\n--- ClauseNet is Running! ---")
    print("Press Ctrl+C to stop both servers.")
    
    try:
        # Keep script running so processes stay alive
        backend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
