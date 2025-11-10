import { useCallback } from "react";
import { ref, uploadBytes } from "firebase/storage";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";

export function FileUploader() {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (!storage || !db) return;

      for (const file of Array.from(files)) {
        const fileRef = collection(db, "files");
        const existingDoc = doc(fileRef, file.name);
        const snap = await getDoc(existingDoc);

        if (snap.exists()) {
          const metadata = snap.data();
          if (file.lastModified <= metadata.lastModified) {
            console.log(`Skipping ${file.name}, older than existing.`);
            continue;
          }
        }

        const storageId = crypto.randomUUID();
        const storageReference = ref(storage, storageId);

        await uploadBytes(storageReference, file);

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

  return (
    <div style={{ margin: "20px 0" }}>
      <input
        type="file"
        multiple
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}
