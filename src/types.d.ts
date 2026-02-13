export interface IElectronAPI {
  saveProcessedFile: (buffer: ArrayBuffer, name: string) => Promise<boolean>;
  checkForUpdate: () => Promise<boolean>; 
  beginUpdate: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
