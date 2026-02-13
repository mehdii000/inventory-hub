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
      pyCommand = path.join(process.resourcesPath, "backend", "app.exe");
      args = [];
      
      console.log(`[Prod] Executing binary: ${pyCommand}`);
    }

    pyProc = spawn(pyCommand, args, { 
      detached: false,
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
    console.log(app.getAppPath());
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

ipcMain.handle('dialog:saveFile', async (event, data, fileName) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: fileName,
  });

  if (filePath) {
    let buffer;

    if (typeof data === 'string') {
      // It's a Base64 PNG string
      const base64Data = data.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      // It's an ArrayBuffer from Excel
      buffer = Buffer.from(data);
    }

    try {
      fs.writeFileSync(filePath, buffer);
      return true;
    } catch (err) {
      console.error("Save failed:", err);
      return false;
    }
  }
  return false;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-update', async () => {
  try {
    const currentVersion = app.getVersion(); // e.g., "1.0.0"
    const response = await fetch('https://api.github.com/repos/mehdii000/inventory-hub/releases/latest', {
      headers: { 'User-Agent': 'Electron-App' } // GitHub API requires a User-Agent header
    });
    if (!response.ok) throw new Error('GitHub request failed');
    const data = await response.json();
    const latestVersion = data.tag_name.replace(/^v/, '');
    return latestVersion !== currentVersion;
    
  } catch (error) {
    console.error("Update check failed:", error);
    return false; // Fail silently to the user
  }
});

ipcMain.handle('begin-update', async () => {
  // Use path.resolve to get the absolute clean path
  let updaterPath;
  if (isDev) {
    updaterPath = path.resolve(__dirname, "..", "updater", "dist", "updater.exe");
  } else {
    updaterPath = path.resolve(process.resourcesPath, "updater", "updater.exe");
  }

  if (!fs.existsSync(updaterPath)) {
    console.error("Updater not found!");
    return;
  }

  console.log("Launching updater at:", updaterPath);

  try {
    const child = spawn(updaterPath, [], {
      detached: true,
      stdio: 'ignore',
      shell: true,
      windowsHide: false // Set to false temporarily to see if it even starts
    });

    child.on('error', (err) => {
      console.error("Failed to start updater process:", err);
    });

    child.unref();
    setTimeout(() => {
      app.quit();
    }, 500);
  } catch (error) {
    console.error("Spawn error:", error);
  }
});
