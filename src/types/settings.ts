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
}

export const DEFAULT_SETTINGS: UserSettings = {
  collisionBehavior: "ask-every-time",
  starredCollisionBehavior: "ask-every-time",
};

