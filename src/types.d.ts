export interface IElectronAPI {
  saveProcessedFile: (buffer: ArrayBuffer, name: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
