import { useEffect, useState } from "react";
import type { FirebaseApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

const getFirebaseConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;

  if (!apiKey || !projectId || !storageBucket) {
    console.error("Missing Firebase configuration in VITE_ environment variables!");
    return null;
  }

  return {
    apiKey,
    projectId,
    storageBucket,
  };
};

export function useFirebaseStorage() {
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [app, setApp] = useState<FirebaseApp | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const config = getFirebaseConfig();

    if (config) {
      try {
        const firebaseApp = initializeApp(config);
        const storageInstance = getStorage(firebaseApp);
        setApp(firebaseApp);
        setStorage(storageInstance);
        setError(null);
      } catch (e) {
        console.error("Error initializing Firebase:", e);
        setError("Failed to initialize Firebase with provided credentials.");
        setApp(null);
        setStorage(null);
      }
    } else {
      setError("Missing Firebase configuration in environment variables.");
    }
  }, []);

  return { storage, app, error };
}
