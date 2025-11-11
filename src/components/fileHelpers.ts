// fileHelpers.ts
import { Firestore, collection, doc, getDoc, setDoc, DocumentReference, DocumentSnapshot } from "firebase/firestore";
import { type FirebaseStorage, ref, uploadBytes } from "firebase/storage";

export const shouldUpload = async (
  db: Firestore,
  file: File
): Promise<{ fileRef: DocumentReference; snap: DocumentSnapshot | null } | null> => {
  const fileRef = doc(collection(db, "files"), file.name);
  const snap = await getDoc(fileRef);
  if (snap.exists() && file.lastModified <= snap.data()?.lastModified) return null;
  return { fileRef, snap: snap.exists() ? snap : null };
};

export const uploadToStorage = async (storage: FirebaseStorage, file: File): Promise<string> => {
  const storageId = crypto.randomUUID();
  await uploadBytes(ref(storage, storageId), file);
  return storageId;
};

export const updateFirestore = async (
  fileRef: DocumentReference,
  file: File,
  storageId: string,
  existingSnap: DocumentSnapshot | null
): Promise<void> => {
  await setDoc(fileRef, {
    id: storageId,
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    starred: existingSnap?.data()?.starred ?? false,
    uploadedAt: Date.now(),
    storagePath: storageId,
  });
};

export const handleFiles = async (db: Firestore, storage: FirebaseStorage, files: FileList) => {
  for (const file of Array.from(files)) {
    const uploadInfo = await shouldUpload(db, file);
    if (!uploadInfo) continue;

    const { fileRef, snap } = uploadInfo;
    const storageId = await uploadToStorage(storage, file);
    await updateFirestore(fileRef, file, storageId, snap);
  }
};
