import { useEffect, useState, useCallback } from "react";
import type { FirebaseApp } from "firebase/app";
import { initializeApp } from "firebase/app";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

export function useFirebaseStorage() {
  const [storage, setStorage] = useState<FirebaseStorage | null>(null);
  const [app, setApp] = useState<FirebaseApp | null>(null);

  const setupFirebase = useCallback(() => {
    let config = localStorage.getItem("firebaseConfig");

    if (!config) {
      const apiKey = prompt("Enter your Firebase API Key:");
      const projectId = prompt("Enter your Firebase Project ID:");
      const storageBucket = prompt("Enter your Storage Bucket URL:");

      config = JSON.stringify({ apiKey, projectId, storageBucket });
      localStorage.setItem("firebaseConfig", config);
    }

    const { apiKey, projectId, storageBucket } = JSON.parse(config);
    const firebaseApp = initializeApp({ apiKey, projectId, storageBucket });
    const storageInstance = getStorage(firebaseApp);

    setApp(firebaseApp);
    setStorage(storageInstance);
  }, []);

  const resetCredentials = useCallback(() => {
    localStorage.removeItem("firebaseConfig");
    setApp(null);
    setStorage(null);
    setupFirebase();
  }, [setupFirebase]);

  useEffect(() => {
    setupFirebase();
  }, [setupFirebase]);

  return { storage, app, resetCredentials };
}
