import { Firestore, collection, doc, getDoc, setDoc, DocumentReference, DocumentSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, type FirebaseStorage, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import type { FileMeta } from "./fileTypes";

export const shouldUpload = async (
  db: Firestore,
  file: File
): Promise<{ fileRef: DocumentReference; snap: DocumentSnapshot | null } | null> => {
  const fileRef = doc(collection(db, "files"), file.name);
  const snap = await getDoc(fileRef);
  if (snap.exists() && file.lastModified <= snap.data()?.lastModified) return null;
  return { fileRef, snap: snap.exists() ? snap : null };
};

const formatTimestamp = (timestamp: number) => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

export const uploadToStorage = async (storage: FirebaseStorage, file: File): Promise<string> => {
  const timestamp = formatTimestamp(file.lastModified);

  const dotIndex = file.name.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex) : "";

  const storageId = `${baseName}-${timestamp}${extension}`;
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

export const toggleStarInFirestore = async (db: Firestore, file: FileMeta) => {
  const fileDoc = doc(db, "files", file.name);
  await updateDoc(fileDoc, { starred: !file.starred });
};

export const deleteFileFromStorageAndFirestore = async (db: Firestore, storage: FirebaseStorage, file: FileMeta) => {
  const storageRef = ref(storage, file.storagePath);
  await deleteObject(storageRef);
  const fileDoc = doc(db, "files", file.name);
  await deleteDoc(fileDoc);
};

export const getFileDownloadUrl = async (storage: FirebaseStorage, file: FileMeta) => {
  const storageRef = ref(storage, file.storagePath);
  return await getDownloadURL(storageRef);
};