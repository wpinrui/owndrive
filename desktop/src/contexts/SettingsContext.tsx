import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { Firestore, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import type { UserSettings, CollisionBehavior, FirebaseConfig } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";

const FIREBASE_CONFIG_STORAGE_KEY = "firebaseConfig";

interface SettingsContextType {
  settings: UserSettings;
  updateCollisionBehavior: (behavior: CollisionBehavior) => void;
  updateStarredCollisionBehavior: (behavior: CollisionBehavior) => void;
  updateSettings: (newSettings: UserSettings) => void;
  clearAllData: () => Promise<void>;
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

// Load Firebase config from localStorage
const loadFirebaseConfig = (): FirebaseConfig | undefined => {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading Firebase config from localStorage:", error);
  }
  return undefined;
};

// Save Firebase config to localStorage
const saveFirebaseConfig = (config: FirebaseConfig | undefined) => {
  if (config) {
    localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("firebaseConfigUpdated"));
  } else {
    localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
    window.dispatchEvent(new Event("firebaseConfigUpdated"));
  }
};

export const SettingsProvider = ({ children, db }: SettingsProviderProps) => {
  // Load Firebase config from localStorage on init
  const [, setFirebaseConfig] = useState<FirebaseConfig | undefined>(() => loadFirebaseConfig());
  const [settings, setSettings] = useState<UserSettings>(() => ({
    ...DEFAULT_SETTINGS,
    fileSizeWarningLimit: DEFAULT_SETTINGS.fileSizeWarningLimit,
    theme: DEFAULT_SETTINGS.theme,
    firebaseConfig: loadFirebaseConfig(),
  }));
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
          setSettings((prev) => ({
            ...prev,
            collisionBehavior: data.collisionBehavior || DEFAULT_SETTINGS.collisionBehavior,
            starredCollisionBehavior: data.starredCollisionBehavior || DEFAULT_SETTINGS.starredCollisionBehavior,
            fileSizeWarningLimit: data.fileSizeWarningLimit !== undefined ? data.fileSizeWarningLimit : DEFAULT_SETTINGS.fileSizeWarningLimit,
            theme: data.theme !== undefined ? data.theme : DEFAULT_SETTINGS.theme,
            firebaseConfig: prev.firebaseConfig, // Keep Firebase config from localStorage
          }));
        } else {
          // Ensure Firebase config is preserved even if Firestore settings don't exist
          setSettings((prev) => ({
            ...prev,
            theme: prev.theme || DEFAULT_SETTINGS.theme,
            firebaseConfig: prev.firebaseConfig,
          }));
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [db]);

  // Save settings to Firestore (excluding Firebase config which is stored locally)
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    // Save Firebase config to localStorage
    if (newSettings.firebaseConfig !== undefined) {
      saveFirebaseConfig(newSettings.firebaseConfig);
      setFirebaseConfig(newSettings.firebaseConfig);
    }
    
    // Save other settings to Firestore
    if (db) {
      try {
        const settingsRef = doc(db, "settings", "user");
        const { firebaseConfig: _, ...settingsToSave } = newSettings;
        await setDoc(settingsRef, settingsToSave, { merge: true });
      } catch (error) {
        console.error("Error saving settings to Firestore:", error);
      }
    }
    
    setSettings(newSettings);
  }, [db]);

  const updateSettings = useCallback((newSettings: UserSettings) => {
    saveSettings(newSettings);
  }, [saveSettings]);

  const updateCollisionBehavior = useCallback((behavior: CollisionBehavior) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, collisionBehavior: behavior };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  const updateStarredCollisionBehavior = useCallback((behavior: CollisionBehavior) => {
    setSettings((prevSettings) => {
      const newSettings = { ...prevSettings, starredCollisionBehavior: behavior };
      saveSettings(newSettings);
      return newSettings;
    });
  }, [saveSettings]);

  const clearAllData = useCallback(async () => {
    // Clear all localStorage (including orphaned keys)
    localStorage.clear();
    
    // Clear Firestore settings document if db is available
    if (db) {
      try {
        const settingsRef = doc(db, "settings", "user");
        await deleteDoc(settingsRef);
      } catch (error) {
        console.error("Error clearing Firestore settings:", error);
        // Continue even if Firestore deletion fails
      }
    }
    
    // Reset local state to defaults
    setFirebaseConfig(undefined);
    setSettings({
      ...DEFAULT_SETTINGS,
      firebaseConfig: undefined,
    });
    
    // Dispatch event to notify other components
    window.dispatchEvent(new Event("firebaseConfigUpdated"));
  }, [db]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateCollisionBehavior,
        updateStarredCollisionBehavior,
        updateSettings,
        clearAllData,
        isLoading,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

