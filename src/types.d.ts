export interface IElectronAPI {
  saveProcessedFile: (buffer: ArrayBuffer, name: string) => Promise<boolean>;
  checkForUpdate: () => Promise<boolean>; 
  beginUpdate: () => Promise<void>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
