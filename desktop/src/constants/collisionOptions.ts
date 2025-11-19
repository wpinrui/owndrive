import type { CollisionBehavior } from "../types/settings";

export interface CollisionOption {
  value: CollisionBehavior;
  label: string;
  description: string;
}

export const COLLISION_OPTIONS: CollisionOption[] = [
  {
    value: "ask-every-time",
    label: "Ask Every Time",
    description: "Prompt for each collision",
  },
  {
    value: "accept-newer-reject-older",
    label: "Accept Newer, Reject Older",
    description: "Automatically replace older files with newer ones",
  },
  {
    value: "keep-both-rename",
    label: "Keep Both and Rename",
    description: "Keep both files by renaming the new one",
  },
];

