import { type FC, useCallback, useRef, useState } from "react";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { useToast } from "../contexts/ToastContext";
import { formatFileSize } from "./helpers/fileHelpers";
import "../styling/FileUploader.scss";
import { handleFiles } from "./helpers/fileHelpers";

const FileUploader: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { showToast, updateToast } = useToast();

  const onFilesSelected = useCallback(
    async (files: FileList) => {
      setLoading(true);
      const fileArray = Array.from(files);
      
      // Show toast for each file being uploaded
      const toastIds = fileArray.map((file) => {
        const fileSize = formatFileSize(file.size);
        return showToast(
          `Uploading ${file.name} (${fileSize})...`,
          "loading",
          { duration: 0 }
        );
      });

      let combinedToastId: string | undefined;

      try {
        // For multiple files, show combined progress
        if (fileArray.length > 1) {
          combinedToastId = showToast(
            `Uploading ${fileArray.length} files...`,
            "loading",
            { duration: 0, progress: 0 }
          );

          await handleFiles(db!, storage!, files, (progress) => {
            updateToast(combinedToastId!, { progress });
          });

          // Update individual toasts
          toastIds.forEach((id) => {
            updateToast(id, {
              type: "success",
              message: "Upload complete",
              duration: 2000,
            });
          });

          updateToast(combinedToastId, {
            type: "success",
            message: `Successfully uploaded ${fileArray.length} files`,
            duration: 3000,
          });
        } else {
          // Single file upload
          const file = fileArray[0];
          const toastId = toastIds[0];

          await handleFiles(db!, storage!, files, (progress) => {
            updateToast(toastId, { progress });
          });

          updateToast(toastId, {
            type: "success",
            message: `Successfully uploaded ${file.name}`,
            duration: 3000,
          });
        }
      } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || "Something went wrong";
        
        // Update all toasts to show error
        toastIds.forEach((id) => {
          updateToast(id, {
            type: "error",
            message: errorMessage,
            duration: 5000,
          });
        });

        // Update combined toast if it exists
        if (combinedToastId) {
          updateToast(combinedToastId, {
            type: "error",
            message: `Failed to upload files: ${errorMessage}`,
            duration: 5000,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [db, storage, showToast, updateToast]
  );

  if (!db || !storage) return null;

  return (
    <div className="FileUploader">
      <button
        type="button"
        className="FileUploader__button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <span className="FileUploader__spinner"></span>
        ) : (
          <span className="material-icons FileUploader__icon">upload</span>
        )}
        {loading ? "Uploading..." : "Upload"}
      </button>

      <input
        type="file"
        multiple
        ref={inputRef}
        className="FileUploader__input"
        onChange={e => e.target.files && onFilesSelected(e.target.files)}
      />
    </div>
  );
};

export default FileUploader;
