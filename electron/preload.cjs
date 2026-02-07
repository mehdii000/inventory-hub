const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process here
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
  saveProcessedFile: (arrayBuffer, fileName) => 
    ipcRenderer.invoke('dialog:saveFile', arrayBuffer, fileName)
});
