export type CollisionBehavior = 
  | "ask-every-time"
  | "accept-newer-reject-older"
  | "keep-both-rename";

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  storageBucket: string;
}

export interface UserSettings {
  collisionBehavior: CollisionBehavior;
  starredCollisionBehavior: CollisionBehavior;
  firebaseConfig?: FirebaseConfig;
  fileSizeWarningLimit?: number; // File size warning limit in bytes (default: 100 MB)
}

export const DEFAULT_SETTINGS: UserSettings = {
  collisionBehavior: "ask-every-time",
  starredCollisionBehavior: "ask-every-time",
  fileSizeWarningLimit: 100 * 1024 * 1024, // 100 MB default (2% of 5 GB free tier)
};

