import { useEffect, useState } from "react";
import type { FirebaseApp } from "firebase/app";
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";
import type { FirebaseConfig } from "../types/settings";

const FIREBASE_CONFIG_STORAGE_KEY = "firebaseConfig";

const getFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const stored = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      if (config.apiKey && config.projectId && config.storageBucket) {
        return config;
      }
    }
  } catch (error) {
    console.error("Error loading Firebase config from localStorage:", error);
  }
  
  // Fallback to environment variables for backward compatibility during development
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (apiKey && projectId && storageBucket) {
    return {
      apiKey,
      projectId,
      storageBucket,
    };
  }

  return null;
};

export function useFirebaseStorage() {
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFirebase = () => {
      const config = getFirebaseConfig();

      if (!config) {
        setError("Missing Firebase configuration. Please configure it in Settings.");
        setApp(null);
        setStorage(null);
        return;
      }

      try {
        // Check if Firebase app already exists with this name
        const existingApps = getApps();
        let firebaseApp = existingApps.find(
          (app) => app.options.projectId === config.projectId
        );

        if (!firebaseApp) {
          firebaseApp = initializeApp(config);
        }

        const storageInstance = getStorage(firebaseApp);
        setApp(firebaseApp);
        setStorage(storageInstance);
        setError(null);
      } catch (e) {
        console.error("Error initializing Firebase:", e);
        setError("Failed to initialize Firebase with provided credentials. Please check your settings.");
        setApp(null);
        setStorage(null);
      }
    };

    // Initialize on mount
    initializeFirebase();

    // Listen for storage changes to reinitialize when settings are updated
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FIREBASE_CONFIG_STORAGE_KEY) {
        initializeFirebase();
      }
    };

    // Listen for custom event (for same-tab updates)
    const handleCustomStorageChange = () => {
      initializeFirebase();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("firebaseConfigUpdated", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("firebaseConfigUpdated", handleCustomStorageChange);
    };
  }, []);

  return { storage, app, error };
}
