import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveFirebaseConfig: (config: any) => ipcRenderer.invoke('save-firebase-config', config),
  saveSyncFolder: (folder: string) => ipcRenderer.invoke('save-sync-folder', folder),
  startSync: () => ipcRenderer.invoke('start-sync'),
  stopSync: () => ipcRenderer.invoke('stop-sync'),
  getConfig: () => ipcRenderer.invoke('get-config')
});
