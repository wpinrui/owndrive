# OwnDrive Folder Sync

Minimal Electron app for bidirectional folder sync with Firebase (Firestore + Storage).

## Features

✅ **Bidirectional sync** - Local folder ↔ Cloud
✅ **System tray** - Runs in background
✅ **Automatic sync** - File changes upload/download automatically
✅ **Folder structure** - Preserves directory hierarchy
✅ **Conflict resolution** - Newest file wins
✅ **Delete propagation** - Deletes sync both ways

## Quick Start

### 1. Install Dependencies (Already Done)
```bash
npm install
```

### 2. Run the App
```bash
npm run dev
```

### 3. Configure Firebase
1. Open the settings window (launches automatically)
2. Enter your Firebase credentials:
   - API Key
   - Project ID
   - Storage Bucket
3. Click "Save Config"

### 4. Select Sync Folder
1. Click "Select Folder"
2. Choose the folder you want to keep in sync
3. All existing files will be uploaded immediately

### 5. Start Syncing
1. Click "Start Sync"
2. The app will now keep your folder in sync with Firebase
3. Close the settings window - app stays running in system tray

## System Tray

- **Right-click tray icon** → Menu appears
- **Open Settings** → Opens settings window
- **Quit** → Stops sync and closes app

## Config File Location

Settings are stored at:
```
%APPDATA%\owndrive-sync\config.json
```

## Testing

### Local → Cloud Sync
1. Add a new file to the sync folder → Check Firebase Storage
2. Modify a file → Check Firebase Storage (should update)
3. Delete a file → Check Firebase Storage (should delete)

### Cloud → Local Sync
1. Add a file via Firebase Console → Check local folder
2. Modify a file via Firebase Console → Check local folder
3. Delete a file via Firebase Console → Check local folder

### Background Operation
1. Close settings window → App stays in system tray
2. Add/modify files → Still syncs
3. Right-click tray → Menu works

## Logs

The app logs sync activity to the console. When running with `npm run dev`, you'll see:
- `[SyncEngine] Starting sync for folder: ...`
- `[SyncEngine] Uploading: file.txt`
- `[SyncEngine] Downloaded: file.txt`

## Firestore Schema

Collection: `synced_files`

Document structure:
```json
{
  "relativePath": "documents/report.pdf",
  "size": 1024000,
  "lastModified": 1734403200000,
  "storagePath": "documents/report.pdf",
  "syncedAt": 1734403205000
}
```

## Troubleshooting

### App won't start
- Check that all dependencies are installed: `npm install`
- Make sure TypeScript compiled: `npm run build`

### Sync not working
- Check Firebase credentials are correct
- Make sure sync folder is selected
- Check console for error messages

### Files not uploading
- Check Firebase Storage rules allow writes
- Check file size (Firebase free tier has 5GB limit)
- Check console for errors

### Files not downloading
- Check Firestore rules allow reads
- Check Firebase Storage rules allow reads
- Make sure sync is started

## Building for Production

To create a distributable installer:
```bash
npm run build
npm run package
```

Installer will be created in `release/` folder.

## Architecture

- **Main Process** (`main/index.ts`) - Electron main, system tray, IPC
- **Preload Script** (`preload/index.ts`) - Secure IPC bridge
- **Renderer** (`renderer/index.html`) - Settings UI
- **File Watcher** (`main/fileWatcher.ts`) - Monitors local folder with chokidar
- **Sync Engine** (`main/syncEngine.ts`) - Bidirectional sync logic

## What's NOT Included (MVP Scope)

- ❌ Progress bars for initial sync
- ❌ Advanced retry logic
- ❌ Ignore patterns (`.git`, `node_modules`)
- ❌ Multiple folder support
- ❌ Sync history/versioning
- ❌ Bandwidth limits
- ❌ Pause/resume persistence across restarts

## Next Steps

After testing the MVP, consider adding:
- Better error notifications
- Progress indicators
- Ignore patterns for common folders
- Auto-resume sync on app restart
