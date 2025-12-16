interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  saveFirebaseConfig: (config: any) => Promise<void>;
  saveSyncFolder: (folder: string) => Promise<void>;
  startSync: () => Promise<string>;
  stopSync: () => Promise<string>;
  getConfig: () => Promise<any>;
}

interface Window {
  electronAPI: ElectronAPI;
}
