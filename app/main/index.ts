import { app, BrowserWindow, Tray, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import fs from 'fs';
import { SyncEngine } from './syncEngine';

let tray: Tray | null = null;
let settingsWindow: BrowserWindow | null = null;
let isQuitting = false;

const configPath = path.join(app.getPath('userData'), 'config.json');

function createTray() {
  // Create icon in renderer folder (source directory)
  const iconPath = path.join(__dirname, '../../renderer/icon.png');

  // Check if icon exists, otherwise create a placeholder
  if (!fs.existsSync(iconPath)) {
    // Create a simple placeholder icon (1x1 transparent PNG)
    const placeholderIcon = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
    fs.writeFileSync(iconPath, placeholderIcon);
  }

  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Settings', click: () => showSettings() },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
  tray.setToolTip('OwnDrive Sync');
}

function showSettings() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  // Load from source directory (renderer folder is not compiled by TypeScript)
  const rendererPath = path.join(__dirname, '../../renderer/index.html');
  settingsWindow.loadFile(rendererPath);

  settingsWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      settingsWindow?.hide();
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('save-firebase-config', async (_, config) => {
  let data: any = {};
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    data = JSON.parse(fileContent);
  } catch {
    // File doesn't exist yet, use empty object
  }
  data.firebase = config;
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
});

ipcMain.handle('save-sync-folder', async (_, folder) => {
  let data: any = {};
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    data = JSON.parse(fileContent);
  } catch {
    // File doesn't exist yet, use empty object
  }
  data.syncFolder = folder;
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
});

ipcMain.handle('get-config', async () => {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(fileContent);
  } catch {
    return {};
  }
});

let syncEngine: SyncEngine | null = null;

// IPC Handlers for sync control
ipcMain.handle('start-sync', async () => {
  try {
    // Get config from file
    const fileContent = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(fileContent);

    if (!config.firebase || !config.syncFolder) {
      return 'Error: Firebase config and sync folder must be configured first';
    }

    if (syncEngine) {
      return 'Sync is already running';
    }

    // Create and start sync engine
    syncEngine = new SyncEngine(config.firebase, config.syncFolder);
    await syncEngine.start();

    return 'Sync started successfully';
  } catch (error: any) {
    console.error('Error starting sync:', error);
    return 'Error starting sync: ' + error.message;
  }
});

ipcMain.handle('stop-sync', async () => {
  try {
    if (!syncEngine) {
      return 'Sync is not running';
    }

    syncEngine.stop();
    syncEngine = null;

    return 'Sync stopped successfully';
  } catch (error: any) {
    console.error('Error stopping sync:', error);
    return 'Error stopping sync: ' + error.message;
  }
});

app.whenReady().then(() => {
  createTray();
  showSettings(); // Show settings window on first launch
});

app.on('window-all-closed', () => {
  // Keep running in background (don't quit)
});

app.on('before-quit', () => {
  isQuitting = true;
});
