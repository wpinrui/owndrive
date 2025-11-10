import { useCallback } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";

export function FileDrop() {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!storage || !db) return;

      const files = Array.from(event.dataTransfer.files);

      for (const file of files) {
        const fileRef = collection(db, "files");
        const existingDoc = doc(fileRef, file.name); // use name as Firestore doc ID for easy lookup
        const snap = await getDoc(existingDoc);

        // If exists and incoming file is older, ignore
        if (snap.exists()) {
          const metadata = snap.data();
          if (file.lastModified <= metadata.lastModified) {
            console.log(`Skipping ${file.name}, older than existing.`);
            continue;
          }
        }

        // Generate a random ID for storage
        const storageId = crypto.randomUUID();
        const storageReference = ref(storage, storageId);

        // Upload the file
        await uploadBytes(storageReference, file);

        // Update Firestore metadata
        await setDoc(existingDoc, {
          id: storageId,
          name: file.name,
          size: file.size,
          lastModified: file.lastModified,
          starred: snap.exists() ? snap.data().starred : false,
          uploadedAt: Date.now(),
          storagePath: storageId,
        });

        console.log(`Uploaded ${file.name} as ${storageId}`);
      }
    },
    [storage, db]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        border: "2px dashed gray",
        padding: "50px",
        textAlign: "center",
      }}
    >
      Drag & drop files here
    </div>
  );
}
