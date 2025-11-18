import { Firestore, collection, doc, getDoc, setDoc, DocumentReference, DocumentSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { deleteObject, type FirebaseStorage, getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import type { FileMeta } from "../fileTypes";
import type { UserSettings, CollisionBehavior } from "../../types/settings";
import type { CollisionAction } from "../../hooks/useCollisionResolver";

export interface CollisionCheckResult {
  exists: boolean;
  fileRef: DocumentReference;
  existingFile: FileMeta | null;
  shouldProceed: boolean;
  finalFileName: string;
}

export const checkCollision = async (
  db: Firestore,
  file: File,
  settings: UserSettings,
  resolveCollision?: (fileName: string, existingFile: FileMeta, newFile: File, isStarred: boolean) => Promise<CollisionAction>,
  showToast?: (message: string, type: "info" | "success" | "error", options?: { duration?: number }) => string
): Promise<CollisionCheckResult> => {
  const fileRef = doc(collection(db, "files"), file.name);
  const snap = await getDoc(fileRef);
  
  if (!snap.exists()) {
    return {
      exists: false,
      fileRef,
      existingFile: null,
      shouldProceed: true,
      finalFileName: file.name,
    };
  }

  const existingFile = snap.data() as FileMeta;
  const isStarred = existingFile.starred || false;
  const behavior: CollisionBehavior = isStarred 
    ? settings.starredCollisionBehavior 
    : settings.collisionBehavior;

  // Determine behavior
  if (behavior === "ask-every-time") {
    if (!resolveCollision) {
      // Fallback if resolver not provided
      showToast?.(
        `File "${file.name}" already exists. Skipping upload.`,
        "info",
        { duration: 4000 }
      );
      return {
        exists: true,
        fileRef,
        existingFile,
        shouldProceed: false,
        finalFileName: file.name,
      };
    }

    const action = await resolveCollision(file.name, existingFile, file, isStarred);
    
    if (action === "skip") {
      showToast?.(
        `Skipped upload of "${file.name}"`,
        "info",
        { duration: 3000 }
      );
      return {
        exists: true,
        fileRef,
        existingFile,
        shouldProceed: false,
        finalFileName: file.name,
      };
    } else if (action === "replace") {
      showToast?.(
        `Replacing existing file "${file.name}"`,
        "info",
        { duration: 3000 }
      );
      return {
        exists: true,
        fileRef,
        existingFile,
        shouldProceed: true,
        finalFileName: file.name,
      };
    } else if (action === "rename") {
      const newFileName = await generateUniqueFileName(file.name, db);
      const newFileRef = doc(collection(db, "files"), newFileName);
      showToast?.(
        `Renaming "${file.name}" to "${newFileName}"`,
        "info",
        { duration: 3000 }
      );
      return {
        exists: true,
        fileRef: newFileRef,
        existingFile: null,
        shouldProceed: true,
        finalFileName: newFileName,
      };
    }
  } else if (behavior === "accept-newer-reject-older") {
    if (file.lastModified > existingFile.lastModified) {
      showToast?.(
        `Replacing older file "${file.name}" with newer version`,
        "info",
        { duration: 3000 }
      );
      return {
        exists: true,
        fileRef,
        existingFile,
        shouldProceed: true,
        finalFileName: file.name,
      };
    } else {
      showToast?.(
        `Skipping "${file.name}" - existing file is newer`,
        "info",
        { duration: 3000 }
      );
      return {
        exists: true,
        fileRef,
        existingFile,
        shouldProceed: false,
        finalFileName: file.name,
      };
    }
  } else if (behavior === "keep-both-rename") {
    const newFileName = await generateUniqueFileName(file.name, db);
    const newFileRef = doc(collection(db, "files"), newFileName);
    showToast?.(
      `Renaming "${file.name}" to "${newFileName}" to keep both files`,
      "info",
      { duration: 3000 }
    );
    return {
      exists: true,
      fileRef: newFileRef,
      existingFile: null,
      shouldProceed: true,
      finalFileName: newFileName,
    };
  }

  // Default: skip
  return {
    exists: true,
    fileRef,
    existingFile,
    shouldProceed: false,
    finalFileName: file.name,
  };
};

const generateUniqueFileName = async (originalName: string, db: Firestore): Promise<string> => {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
  const extension = dotIndex !== -1 ? originalName.slice(dotIndex) : "";
  
  let counter = 1;
  let newName = `${baseName} (${counter})${extension}`;
  
  while (true) {
    const fileRef = doc(collection(db, "files"), newName);
    const snap = await getDoc(fileRef);
    if (!snap.exists()) {
      return newName;
    }
    counter++;
    newName = `${baseName} (${counter})${extension}`;
  }
};

const formatTimestamp = (timestamp: number) => {
  const d = new Date(timestamp);
  const pad = (n: number) => n.toString().padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
};

export const uploadToStorage = async (
  storage: FirebaseStorage,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const timestamp = formatTimestamp(file.lastModified);

  const dotIndex = file.name.lastIndexOf(".");
  const baseName = dotIndex !== -1 ? file.name.slice(0, dotIndex) : file.name;
  const extension = dotIndex !== -1 ? file.name.slice(dotIndex) : "";

  const storageId = `${baseName}-${timestamp}${extension}`;
  const storageRef = ref(storage, storageId);

  if (onProgress) {
    // Use resumable upload for progress tracking
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        () => {
          resolve(storageId);
        }
      );
    });
  } else {
    // Use simple upload for smaller files or when progress isn't needed
    await uploadBytes(storageRef, file);
    return storageId;
  }
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

export const handleFiles = async (
  db: Firestore,
  storage: FirebaseStorage,
  files: FileList,
  onProgress?: (progress: number) => void,
  settings?: UserSettings,
  resolveCollision?: (fileName: string, existingFile: FileMeta, newFile: File, isStarred: boolean) => Promise<CollisionAction>,
  showToast?: (message: string, type: "info" | "success" | "error", options?: { duration?: number }) => string
) => {
  const fileArray = Array.from(files);
  const totalFiles = fileArray.length;
  const defaultSettings: UserSettings = {
    collisionBehavior: "ask-every-time",
    starredCollisionBehavior: "ask-every-time",
  };
  const userSettings = settings || defaultSettings;

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    // Check for collisions if settings or resolveCollision are provided
    let collisionResult: CollisionCheckResult | null = null;
    if (settings || resolveCollision) {
      collisionResult = await checkCollision(db, file, userSettings, resolveCollision, showToast);
      if (!collisionResult.shouldProceed) {
        // Skip this file
        continue;
      }
    } else {
      // Fallback: check if file exists and skip if it does
      const fileRef = doc(collection(db, "files"), file.name);
      const snap = await getDoc(fileRef);
      if (snap.exists()) {
        // File already exists, skip it
        if (onProgress && totalFiles === 1) {
          onProgress(100);
        }
        continue;
      }
      collisionResult = {
        exists: false,
        fileRef,
        existingFile: null,
        shouldProceed: true,
        finalFileName: file.name,
      };
    }

    const { fileRef, existingFile, finalFileName } = collisionResult!;
    
    // For single file, pass progress callback directly
    // For multiple files, calculate progress based on file index
    const fileProgressCallback = onProgress && totalFiles === 1
      ? onProgress
      : onProgress && totalFiles > 1
      ? (progress: number) => {
          const fileProgress = (i / totalFiles) * 100 + (progress / totalFiles);
          onProgress(Math.min(100, Math.round(fileProgress)));
        }
      : undefined;

    // If replacing, delete old storage file first
    if (existingFile && existingFile.storagePath) {
      try {
        const oldStorageRef = ref(storage, existingFile.storagePath);
        await deleteObject(oldStorageRef);
      } catch (error) {
        console.warn("Could not delete old storage file:", error);
      }
    }

    const storageId = await uploadToStorage(storage, file, fileProgressCallback);
    
    // Update Firestore with the final file name
    const finalFileRef = doc(collection(db, "files"), finalFileName);
    const finalSnap = await getDoc(finalFileRef);
    const existingSnap = finalSnap.exists() ? finalSnap : null;
    
    await setDoc(finalFileRef, {
      id: storageId,
      name: finalFileName,
      size: file.size,
      lastModified: file.lastModified,
      starred: existingFile?.starred ?? (existingSnap?.data()?.starred ?? false),
      uploadedAt: Date.now(),
      storagePath: storageId,
    });
  }

  if (onProgress) {
    onProgress(100);
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

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Check file sizes against the warning limit and request confirmation for files that exceed it
 * @param files Array of files to check
 * @param warningLimit Warning limit in bytes (from settings)
 * @param confirmFileSize Function to request confirmation (returns Promise<boolean>)
 * @returns Promise that resolves to array of files that should be uploaded
 */
export const checkFileSizesAndConfirm = async (
    files: File[],
    warningLimit: number | undefined,
    confirmFileSize?: (fileName: string, fileSize: number, warningLimit: number) => Promise<boolean>
): Promise<File[]> => {
    if (!warningLimit || !confirmFileSize) {
        // If no limit or confirmation function, allow all files
        return files;
    }

    const filesToUpload: File[] = [];

    for (const file of files) {
        if (file.size > warningLimit) {
            // File exceeds limit, request confirmation
            const proceed = await confirmFileSize(file.name, file.size, warningLimit);
            if (proceed) {
                filesToUpload.push(file);
            }
            // If user cancels, file is not added to filesToUpload
        } else {
            // File is within limit, include it
            filesToUpload.push(file);
        }
    }

    return filesToUpload;
};

type FileIconMeta = { icon: string; className: string };

const ICON_MAP: Record<string, FileIconMeta> = {
    pdf: { icon: "picture_as_pdf", className: "icon-pdf" },
    doc: { icon: "description", className: "icon-doc" },
    docx: { icon: "description", className: "icon-doc" },
    xls: { icon: "grid_on", className: "icon-xls" },
    xlsx: { icon: "grid_on", className: "icon-xls" },
    ppt: { icon: "slideshow", className: "icon-ppt" },
    pptx: { icon: "slideshow", className: "icon-ppt" },
    txt: { icon: "note", className: "icon-txt" },
    md: { icon: "article", className: "icon-md" },
    csv: { icon: "table_chart", className: "icon-csv" },
    jpg: { icon: "image", className: "icon-img" },
    jpeg: { icon: "image", className: "icon-img" },
    png: { icon: "image", className: "icon-img" },
    gif: { icon: "image", className: "icon-img" },
    mp3: { icon: "audiotrack", className: "icon-audio" },
    wav: { icon: "audiotrack", className: "icon-audio" },
    mp4: { icon: "movie", className: "icon-video" },
    mov: { icon: "movie", className: "icon-video" },
    zip: { icon: "folder_zip", className: "icon-archive" },
    rar: { icon: "folder_zip", className: "icon-archive" },
    js: { icon: "code", className: "icon-code" },
    ts: { icon: "code", className: "icon-code" },
    json: { icon: "code", className: "icon-code" },
    html: { icon: "language", className: "icon-code" },
    css: { icon: "style", className: "icon-code" },
    kdbx: { icon: "vpn_key", className: "icon-key" },
};

export const getFileIcon = (fileName: string): FileIconMeta => {
    const ext = fileName.split(".").pop()?.toLowerCase() || "";
    const defaultIcon: FileIconMeta = { icon: "insert_drive_file", className: "icon-default" };
    return ICON_MAP[ext] || defaultIcon;
};