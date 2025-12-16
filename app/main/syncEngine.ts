import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FileWatcher } from './fileWatcher';
import fs from 'fs';
import path from 'path';

export class SyncEngine {
  private watcher: FileWatcher;
  private unsubscribe: (() => void) | null = null;
  private db: any;
  private storage: any;
  private syncFolder: string;

  constructor(firebaseConfig: any, syncFolder: string) {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.storage = getStorage(app);
    this.syncFolder = syncFolder;
    this.watcher = new FileWatcher();
  }

  async start() {
    console.log('[SyncEngine] Starting sync for folder:', this.syncFolder);

    // 1. Upload all existing files (initial sync)
    await this.uploadAllFiles();

    // 2. Start watching for local changes
    this.watcher.on('add', (filePath) => this.handleLocalAdd(filePath));
    this.watcher.on('change', (filePath) => this.handleLocalChange(filePath));
    this.watcher.on('delete', (filePath) => this.handleLocalDelete(filePath));
    this.watcher.start(this.syncFolder);

    // 3. Listen for cloud changes
    this.unsubscribe = onSnapshot(collection(this.db, 'synced_files'), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          this.handleCloudChange(change.doc.data()).catch(err => {
            console.error('[SyncEngine] Error handling cloud change:', err);
          });
        } else if (change.type === 'removed') {
          this.handleCloudDelete(change.doc.data()).catch(err => {
            console.error('[SyncEngine] Error handling cloud delete:', err);
          });
        }
      });
    });

    console.log('[SyncEngine] Sync started successfully');
  }

  private async uploadAllFiles() {
    console.log('[SyncEngine] Starting initial upload of all files...');
    const files = await this.getAllFiles(this.syncFolder);
    console.log(`[SyncEngine] Found ${files.length} files to upload`);

    for (const file of files) {
      try {
        await this.uploadFile(file);
      } catch (error) {
        console.error(`[SyncEngine] Error uploading ${file}:`, error);
      }
    }

    console.log('[SyncEngine] Initial upload complete');
  }

  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async uploadFile(filePath: string) {
    const relativePath = path.relative(this.syncFolder, filePath).split(path.sep).join('/');
    const stats = await fs.promises.stat(filePath);
    const buffer = await fs.promises.readFile(filePath);

    console.log(`[SyncEngine] Uploading: ${relativePath}`);

    // Upload to Firebase Storage
    const storageRef = ref(this.storage, relativePath);
    await uploadBytes(storageRef, buffer);

    // Encode relativePath for Firestore document ID (can't contain slashes)
    const docId = encodeURIComponent(relativePath);

    // Update Firestore
    await setDoc(doc(this.db, 'synced_files', docId), {
      relativePath,
      size: stats.size,
      lastModified: stats.mtimeMs,
      storagePath: relativePath,
      syncedAt: Date.now()
    });

    console.log(`[SyncEngine] Uploaded: ${relativePath}`);
  }

  private async handleLocalAdd(filePath: string) {
    console.log(`[SyncEngine] Local file added: ${filePath}`);
    try {
      await this.uploadFile(filePath);
    } catch (error) {
      console.error(`[SyncEngine] Error uploading added file:`, error);
    }
  }

  private async handleLocalChange(filePath: string) {
    console.log(`[SyncEngine] Local file changed: ${filePath}`);
    try {
      await this.uploadFile(filePath);
    } catch (error) {
      console.error(`[SyncEngine] Error uploading changed file:`, error);
    }
  }

  private async handleLocalDelete(filePath: string) {
    const relativePath = path.relative(this.syncFolder, filePath).split(path.sep).join('/');
    console.log(`[SyncEngine] Local file deleted: ${relativePath}`);

    try {
      // Delete from Storage
      await deleteObject(ref(this.storage, relativePath));

      // Delete from Firestore (encode path for doc ID)
      const docId = encodeURIComponent(relativePath);
      await deleteDoc(doc(this.db, 'synced_files', docId));

      console.log(`[SyncEngine] Deleted from cloud: ${relativePath}`);
    } catch (error) {
      console.error(`[SyncEngine] Error deleting from cloud:`, error);
    }
  }

  private async handleCloudChange(data: any) {
    const localPath = path.join(this.syncFolder, data.relativePath.split('/').join(path.sep));

    console.log(`[SyncEngine] Cloud change detected: ${data.relativePath}`);

    // Check if local file exists and is newer
    try {
      const stats = await fs.promises.stat(localPath);
      if (stats.mtimeMs >= data.lastModified) {
        console.log(`[SyncEngine] Local file is newer or same, skipping download`);
        return; // Local is newer or same, skip
      }
    } catch {
      // File doesn't exist locally, will download
      console.log(`[SyncEngine] File doesn't exist locally, downloading`);
    }

    // Pause watcher to prevent loop
    this.watcher.pause(localPath);

    try {
      // Download from Storage
      const url = await getDownloadURL(ref(this.storage, data.storagePath));
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();

      // Ensure directory exists
      await fs.promises.mkdir(path.dirname(localPath), { recursive: true });

      // Write file
      await fs.promises.writeFile(localPath, Buffer.from(buffer));

      console.log(`[SyncEngine] Downloaded: ${data.relativePath}`);
    } catch (error) {
      console.error(`[SyncEngine] Error downloading file:`, error);
    }
  }

  private async handleCloudDelete(data: any) {
    const localPath = path.join(this.syncFolder, data.relativePath.split('/').join(path.sep));

    console.log(`[SyncEngine] Cloud delete detected: ${data.relativePath}`);

    // Pause watcher to prevent loop
    this.watcher.pause(localPath);

    // Delete local file if it exists
    try {
      await fs.promises.unlink(localPath);
      console.log(`[SyncEngine] Deleted local file: ${data.relativePath}`);
    } catch {
      // File already doesn't exist, ignore
      console.log(`[SyncEngine] File already doesn't exist locally`);
    }
  }

  stop() {
    console.log('[SyncEngine] Stopping sync...');
    this.watcher.stop();
    this.unsubscribe?.();
  }
}
