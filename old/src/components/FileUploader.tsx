import { type FC, useCallback, useRef, useState } from "react";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { useToast } from "../contexts/ToastContext";
import { useSettings } from "../contexts/SettingsContext";
import { useCollisionResolver } from "../hooks/useCollisionResolver";
import { formatFileSize, checkFileSizesAndConfirm } from "./helpers/fileHelpers";
import styles from "../styling/FileUploader.module.scss";
import { handleFiles } from "./helpers/fileHelpers";
import { DEFAULT_SETTINGS } from "../types/settings";
import { useFileSizeConfirmation } from "../hooks/useFileSizeConfirmation";

const FileUploader: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { showToast, updateToast } = useToast();
  const { settings } = useSettings();
  const { resolveCollision, CollisionDialogComponent } = useCollisionResolver();
  const { confirmFileSize, FileSizeDialogComponent } = useFileSizeConfirmation();

  const onFilesSelected = useCallback(
    async (files: FileList) => {
      setLoading(true);
      const fileArray = Array.from(files);
      
      // Check file sizes and request confirmation for files that exceed the limit
      const filesToUpload = await checkFileSizesAndConfirm(
        fileArray,
        settings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit,
        confirmFileSize
      );

      // If all files were cancelled, show message and return
      if (filesToUpload.length === 0) {
        showToast("Upload cancelled - no files selected", "info", { duration: 3000 });
        setLoading(false);
        return;
      }

      // If some files were cancelled, show info
      if (filesToUpload.length < fileArray.length) {
        const cancelledCount = fileArray.length - filesToUpload.length;
        showToast(`${cancelledCount} file(s) were cancelled`, "info", { duration: 3000 });
      }
      
      // Create a new FileList-like object from the filtered files
      // We'll need to pass filesToUpload directly to handleFiles
      // Since handleFiles expects FileList, we'll need to update it or create a DataTransfer
      const dataTransfer = new DataTransfer();
      filesToUpload.forEach(file => dataTransfer.items.add(file));
      const filteredFileList = dataTransfer.files;
      
      let combinedToastId: string | undefined;
      let toastId: string | undefined;

      try {
        // For multiple files, show combined progress only
        if (filesToUpload.length > 1) {
          combinedToastId = showToast(
            `Uploading ${filesToUpload.length} files...`,
            "loading",
            { duration: 0, progress: 0 }
          );

          await handleFiles(
            db!,
            storage!,
            filteredFileList,
            (progress) => {
              updateToast(combinedToastId!, { progress });
            },
            settings,
            resolveCollision,
            (message, type, options) => showToast(message, type, options)
          );

          updateToast(combinedToastId, {
            type: "success",
            message: `Successfully uploaded ${filesToUpload.length} files`,
            duration: 4000,
          });
        } else {
          // Single file upload - show individual toast
          const file = filesToUpload[0];
          const fileSize = formatFileSize(file.size);
          toastId = showToast(
            `Uploading ${file.name} (${fileSize})...`,
            "loading",
            { duration: 0 }
          );

          await handleFiles(
            db!,
            storage!,
            filteredFileList,
            (progress) => {
              updateToast(toastId!, { progress });
            },
            settings,
            resolveCollision,
            (message, type, options) => showToast(message, type, options)
          );

          updateToast(toastId, {
            type: "success",
            message: `Successfully uploaded ${file.name}`,
            duration: 4000,
          });
        }
      } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || "Something went wrong";
        
        // Update toast to show error
        if (combinedToastId) {
          updateToast(combinedToastId, {
            type: "error",
            message: `Failed to upload files: ${errorMessage}`,
            duration: 4000,
          });
        } else if (toastId) {
          updateToast(toastId, {
            type: "error",
            message: errorMessage,
            duration: 4000,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [db, storage, showToast, updateToast, settings, resolveCollision, confirmFileSize]
  );

  if (!db || !storage) return null;

  return (
    <>
      {CollisionDialogComponent}
      {FileSizeDialogComponent}
      <div className={styles.fileUploader}>
        <button
          type="button"
          className={styles.fileUploader__button}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? (
            <span className={styles.fileUploader__spinner}></span>
          ) : (
            <span className={`material-icons ${styles.fileUploader__icon}`}>upload</span>
          )}
          {loading ? "Uploading..." : "Upload"}
        </button>

        <input
          type="file"
          multiple
          ref={inputRef}
          className={styles.fileUploader__input}
          onChange={e => e.target.files && onFilesSelected(e.target.files)}
        />
      </div>
    </>
  );
};

export default FileUploader;
