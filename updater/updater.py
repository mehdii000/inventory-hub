import os
import sys
import zipfile
import requests
import time
import tkinter as tk
from tkinter import ttk, messagebox
from threading import Thread

# --- CONFIGURATION ---
REPO = "mehdii000/inventory-hub"
GITHUB_URL = f"https://api.github.com/repos/{REPO}/releases/latest"
EXE_NAME = "StockSync.exe" 

class UpdaterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("InventoryHub Updater")
        self.root.geometry("450x220")
        self.root.resizable(False, False)
        self.root.configure(bg="#121212") # Deep dark theme

        # Safety Check First
        if not self.is_allowed_environment():
            self.show_forbidden_screen()
            return

        # Modern Styles
        self.style = ttk.Style()
        self.style.theme_use('default')
        self.style.configure("TProgressbar", 
                             thickness=15, 
                             troughcolor='#2d2d2d', 
                             background='#3b82f6', # Primary Blue
                             borderwidth=0)

        # UI Elements
        self.label = tk.Label(root, text="System Update", font=("Segoe UI Semibold", 14), fg="#ffffff", bg="#121212")
        self.label.pack(pady=(25, 5))

        self.progress = ttk.Progressbar(root, orient="horizontal", length=380, mode="determinate", style="TProgressbar")
        self.progress.pack(pady=10)

        self.status_label = tk.Label(root, text="Initializing...", font=("Segoe UI", 9), fg="#9ca3af", bg="#121212")
        self.status_label.pack()

        # Start process
        self.update_thread = Thread(target=self.start_update_process)
        self.update_thread.daemon = True
        self.update_thread.start()

    def is_allowed_environment(self):
        # Get the path of the current executable/script
        current_path = os.path.abspath(sys.argv[0]).lower()
        # Only allow execution if "resources" is in the path
        return "resources" in current_path

    def show_forbidden_screen(self):
        self.root.configure(bg="#1a1a1a")
        tk.Label(self.root, text="⚠️ Update Not Allowed", font=("Segoe UI Bold", 14), fg="#ef4444", bg="#1a1a1a").pack(pady=40)
        tk.Label(self.root, text="Developer Mode detected.\nRun from installed 'resources' folder only.", 
                 font=("Segoe UI", 10), fg="#d1d5db", bg="#1a1a1a").pack()
        self.root.after(5000, self.root.quit) # Auto close after 5 seconds

    def update_gui(self, text, status, value=None):
        self.label.config(text=text)
        self.status_label.config(text=status)
        if value is not None:
            self.progress['value'] = value
        self.root.update_idletasks()

    def start_update_process(self):
        try:
            # 1. GitHub API Fetch
            self.update_gui("Checking Server", "Connecting to GitHub...")
            response = requests.get(GITHUB_URL, headers={'User-Agent': 'Electron-Updater'}, timeout=10).json()
            
            asset = next(a for a in response['assets'] if a['name'].endswith('.zip'))
            download_url = asset['browser_download_url']
            total_size = asset['size']
            
            # 2. Stream Download
            local_zip = "temp_update.zip"
            with requests.get(download_url, stream=True) as r:
                r.raise_for_status()
                downloaded = 0
                for chunk in r.iter_content(chunk_size=16384):
                    if chunk:
                        with open(local_zip, 'ab') as f:
                            f.write(chunk)
                        downloaded += len(chunk)
                        percent = (downloaded / total_size) * 100
                        self.update_gui("Downloading...", f"{downloaded // 1048576}MB / {total_size // 1048576}MB", percent)

            # 3. Extraction
            self.update_gui("Installing", "Overwriting files...", 100)
            # Electron root is usually 1 level up from 'resources'
            # (AppPath/resources/updater/updater.exe) -> We go up twice
            app_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[0]))))
            
            with zipfile.ZipFile(local_zip, 'r') as zip_ref:
                zip_ref.extractall(app_root)

            # 4. Success
            self.update_gui("Update Complete", "Cleaning up and restarting...")
            os.remove(local_zip)
            time.sleep(2)

            # Restart
            exe_path = os.path.join(app_root, EXE_NAME)
            if os.path.exists(exe_path):
                os.startfile(exe_path)
            
            self.root.quit()

        except Exception as e:
            messagebox.showerror("Update Error", f"An error occurred: {str(e)}")
            self.root.quit()

if __name__ == "__main__":
    root = tk.Tk()
    app = UpdaterApp(root)
    root.mainloop()
