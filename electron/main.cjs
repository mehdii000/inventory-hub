const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;
let pyProc = null;
let mainWindow = null; // Use 'let' and declare it at the top level

// 1. SINGLE INSTANCE LOCK (Check this FIRST before anything else)
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
    let pyPath;
    if (isDev) {
      // Dev path: PROJECT_ROOT/backend/dist/app.exe
      pyPath = path.join(process.cwd(), "backend", "dist", "app.exe");
    } else {
      // Prod path: resources/backend/app.exe
      pyPath = path.join(process.resourcesPath, "backend", "app.exe");
    }

    pyProc = spawn(pyPath, [], { 
      windowsHide: false,
      stdio: 'ignore' // Good practice to prevent pipe clogs in prod
    });

    pyProc.on("error", (err) => console.error("Failed to start backend:", err));
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
        // Ensure this file exists in your electron/ folder!
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    mainWindow.setMenuBarVisibility(false);

    if (isDev) {
      mainWindow.loadURL("http://localhost:8080");
    } else {
      // PRODUCTION PATH FIX:
      // If main.cjs is in /electron and HTML is in /dist:
      const indexPath = path.join(__dirname, "..", "dist", "index.html");
      mainWindow.loadFile(indexPath).catch((e) => console.error("Failed to load web files:", e));
    }
  }

  // 4. APP LIFECYCLE
  app.whenReady().then(() => {
    startPython();
    createWindow();
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  if (pyProc) {
    // 1. Send the "Poison Pill" to the Flask server first
    // Using a simple request to tell Flask to shut itself down gracefully
    fetch("http://127.0.0.1:5454/kys").catch(() => {});

    // 2. Windows specific: Nuke the process tree
    if (process.platform === "win32") {
      // We use 'spawnSync' to ensure Electron waits long enough to send the command
      const { spawnSync } = require("child_process");
      spawnSync("taskkill", ["/pid", pyProc.pid, "/f", "/t"]);
    } else {
      pyProc.kill('SIGTERM');
    }

    pyProc = null;
  }
});
