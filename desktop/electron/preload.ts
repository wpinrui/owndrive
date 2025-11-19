import { contextBridge, ipcRenderer } from 'electron'

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    ping: () => ipcRenderer.invoke('ping'),
    getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
    getClipboardImage: () => ipcRenderer.invoke('get-clipboard-image'),
  })
} catch (error) {
  console.error('Error in preload script:', error)
}

