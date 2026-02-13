export interface IElectronAPI {
  // Updated to accept both types
  saveProcessedFile: (data: ArrayBuffer | string, name: string) => Promise<boolean>;
  checkForUpdate: () => Promise<boolean>; 
  beginUpdate: () => Promise<void>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
