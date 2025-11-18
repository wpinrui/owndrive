import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const preloadPath = path.join(__dirname, '../preload/main.mjs')
const rendererPath = path.join(__dirname, '../../dist')

const resolveIconPath = () => {
  if (process.env.VITE_DEV_SERVER_URL) {
    const generatedDevIcon = path.join(process.cwd(), 'resources', 'icons', 'png', '256x256.png')
    if (existsSync(generatedDevIcon)) {
      return generatedDevIcon
    }
    const fallbackDevIcon = path.join(process.cwd(), 'resources', 'owndrive-icon.png')
    return existsSync(fallbackDevIcon) ? fallbackDevIcon : undefined
  }

  const platformCandidates =
    process.platform === 'win32'
      ? [path.join(process.resourcesPath, 'icons', 'win', 'icon.ico')]
      : process.platform === 'darwin'
        ? [path.join(process.resourcesPath, 'icons', 'mac', 'icon.icns')]
        : [
            path.join(process.resourcesPath, 'icons', 'png', '256x256.png'),
            path.join(process.resourcesPath, 'icons', 'png', '512x512.png'),
          ]

  for (const candidate of platformCandidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return undefined
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let mainWindow: BrowserWindow | null = null

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'OwnDrive',
    autoHideMenuBar: true,
    icon: resolveIconPath(),
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(rendererPath, 'index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')

  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

