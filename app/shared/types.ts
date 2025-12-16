export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  storageBucket: string;
}

export interface SyncedFile {
  relativePath: string;
  size: number;
  lastModified: number;
  storagePath: string;
  syncedAt: number;
}
