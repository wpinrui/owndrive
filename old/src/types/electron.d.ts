export {}

declare global {
  interface Window {
    electronAPI: {
      ping: () => Promise<unknown>
      getClipboardText: () => Promise<string>
      getClipboardImage: () => Promise<ArrayBuffer | null>
    }
  }
}

