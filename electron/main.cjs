const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { ipcMain, dialog } = require('electron');
const fs = require('fs');

const isDev = !app.isPackaged;
let pyProc = null;
let mainWindow = null;

// 1. SINGLE INSTANCE LOCK
const isFirstInstance = app.requestSingleInstanceLock();

if (!isFirstInstance) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // 2. BACKEND LOGIC
  function startPython() {
    let pyCommand;
    let args = [];

    if (isDev) {
      /**
       * DEV MODE: Mimics terminal "python ../backend/app.py"
       * shell: true allows the OS to find 'python' in the system PATH.
       */
      pyCommand = process.platform === "win32" ? "python" : "python3";
      
      // Assumes your folder structure is:
      // Project/electron/main.js
      // Project/backend/app.py
      const scriptPath = path.join(__dirname, "..", "backend", "app.py"); 
      args = [scriptPath];
      
      console.log(`[Dev] Executing terminal command: ${pyCommand} ${scriptPath}`);
    } else {
      /**
       * PROD MODE: Runs the compiled executable from the resources folder.
       */
      pyCommand = path.join(process.resourcesPath, "backend", process.platform === "win32" ? "app.exe" : "app");
      args = [];
      
      console.log(`[Prod] Executing binary: ${pyCommand}`);
    }

    pyProc = spawn(pyCommand, args, { 
      windowsHide: true,
      stdio: "inherit",
      shell: isDev, // Run as a shell command in dev to find 'python' easily
    });

    pyProc.on("error", (err) => {
      console.error("CRITICAL: Failed to start backend process:", err);
    });
  }

  // 3. WINDOW LOGIC
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 900,
      minHeight: 600,
      title: "StockSync",
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.setMenuBarVisibility(false);

    if (isDev) {
      mainWindow.loadURL("http://localhost:8080");
    } else {
      const indexPath = path.join(__dirname, "..", "dist", "index.html");
      mainWindow.loadFile(indexPath).catch((e) => console.error("Failed to load web files:", e));
    }
  }

  // 4. APP LIFECYCLE
  app.whenReady().then(() => {
    startPython();
    createWindow();
    console.log(app.getVersion());
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// 5. CLEANUP
app.on("will-quit", () => {
  if (pyProc) {
    console.log("Shutting down backend...");
    
    // Attempt Graceful Shutdown (Flask /kys route)
    // Note: 'fetch' is available in Node 18+
    fetch("http://127.0.0.1:5454/kys").catch(() => {});

    if (process.platform === "win32") {
      // Force kill the process tree on Windows to ensure no ghost processes
      const { spawnSync } = require("child_process");
      spawnSync("taskkill", ["/pid", pyProc.pid, "/f", "/t"]);
    } else {
      pyProc.kill('SIGTERM');
    }

    pyProc = null;
  }
});

ipcMain.handle('dialog:saveFile', async (event, arrayBuffer, fileName) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: fileName,
    filters: [
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'Zip Files', extensions: ['zip'] }
    ]
  });

  if (filePath) {
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    return true; // Success
  }
  return false; // User cancelled
});
