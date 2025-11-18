export type CollisionBehavior = 
  | "ask-every-time"
  | "accept-newer-reject-older"
  | "keep-both-rename";

export interface UserSettings {
  collisionBehavior: CollisionBehavior;
  starredCollisionBehavior: CollisionBehavior;
}

export const DEFAULT_SETTINGS: UserSettings = {
  collisionBehavior: "ask-every-time",
  starredCollisionBehavior: "ask-every-time",
};

