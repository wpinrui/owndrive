import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { Firestore, doc, getDoc, setDoc } from "firebase/firestore";
import type { UserSettings, CollisionBehavior } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

interface SettingsContextType {
  settings: UserSettings;
  updateCollisionBehavior: (behavior: CollisionBehavior) => void;
  updateStarredCollisionBehavior: (behavior: CollisionBehavior) => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
  db: Firestore | null;
}

export const SettingsProvider = ({ children, db }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from Firestore
  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        const settingsRef = doc(db, "settings", "user");
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setSettings({
            collisionBehavior: data.collisionBehavior || DEFAULT_SETTINGS.collisionBehavior,
            starredCollisionBehavior: data.starredCollisionBehavior || DEFAULT_SETTINGS.starredCollisionBehavior,
          });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [db]);

  // Save settings to Firestore
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    if (!db) return;
    
    try {
      const settingsRef = doc(db, "settings", "user");
      await setDoc(settingsRef, newSettings, { merge: true });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }, [db]);

  const updateCollisionBehavior = useCallback((behavior: CollisionBehavior) => {
    const newSettings = { ...settings, collisionBehavior: behavior };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  const updateStarredCollisionBehavior = useCallback((behavior: CollisionBehavior) => {
    const newSettings = { ...settings, starredCollisionBehavior: behavior };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateCollisionBehavior,
        updateStarredCollisionBehavior,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

