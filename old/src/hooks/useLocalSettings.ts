import { useState, useEffect } from "react";
import type { UserSettings } from "../types/settings";

/**
 * Hook to manage local settings state that can be edited before saving
 */
export const useLocalSettings = (settings: UserSettings, isOpen: boolean) => {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  return { localSettings, setLocalSettings };
};

