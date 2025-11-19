import { type FC, useCallback, useState, useEffect } from "react";
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
import { FileNameDialog } from "./FileNameDialog";

const ClipboardUploader: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isElectronAvailable, setIsElectronAvailable] = useState(false);
  const { showToast, updateToast } = useToast();
  const { settings } = useSettings();
  const { resolveCollision, CollisionDialogComponent } = useCollisionResolver();
  const { confirmFileSize, FileSizeDialogComponent } = useFileSizeConfirmation();

  // Check if Electron API is available
  useEffect(() => {
    const checkElectronAPI = () => {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Verify clipboard methods exist (check if they are functions)
        const hasClipboardText = typeof window.electronAPI.getClipboardText === 'function';
        const hasClipboardImage = typeof window.electronAPI.getClipboardImage === 'function';
        
        if (hasClipboardText && hasClipboardImage) {
          setIsElectronAvailable(true);
        } else {
          setIsElectronAvailable(false);
        }
      } else {
        setIsElectronAvailable(false);
      }
    };
    
    checkElectronAPI();
    // Check again after delays in case it loads asynchronously
    const timeout1 = setTimeout(checkElectronAPI, 100);
    const timeout2 = setTimeout(checkElectronAPI, 500);
    const timeout3 = setTimeout(checkElectronAPI, 1000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setLoading(true);
      
      // Check file size and request confirmation if needed
      const filesToUpload = await checkFileSizesAndConfirm(
        [file],
        settings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit,
        confirmFileSize
      );

      if (filesToUpload.length === 0) {
        showToast("Upload cancelled", "info", { duration: 3000 });
        setLoading(false);
        return;
      }

      const fileToUpload = filesToUpload[0];
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(fileToUpload);
      const fileList = dataTransfer.files;

      let toastId: string | undefined;

      try {
        const fileSize = formatFileSize(fileToUpload.size);
        toastId = showToast(
          `Uploading ${fileToUpload.name} (${fileSize})...`,
          "loading",
          { duration: 0 }
        );

        await handleFiles(
          db!,
          storage!,
          fileList,
          (progress) => {
            updateToast(toastId!, { progress });
          },
          settings,
          resolveCollision,
          (message, type, options) => showToast(message, type, options)
        );

        updateToast(toastId, {
          type: "success",
          message: `Successfully uploaded ${fileToUpload.name}`,
          duration: 4000,
        });
      } catch (err: any) {
        console.error(err);
        const errorMessage = err.message || "Something went wrong";
        
        if (toastId) {
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

  const handleClipboardClick = useCallback(async () => {
    if (!isElectronAvailable || !window.electronAPI) {
      showToast("Clipboard access not available. Please restart the app.", "error", { duration: 4000 });
      return;
    }

    try {
      // Try to get image first
      const imageBuffer = await window.electronAPI.getClipboardImage();
      
      if (imageBuffer) {
        // Convert ArrayBuffer to Blob, then to File
        // Electron IPC serializes Buffer as ArrayBuffer
        const blob = new Blob([imageBuffer], { type: "image/png" });
        const file = new File([blob], "clipboard-image.png", {
          type: "image/png",
          lastModified: Date.now(),
        });
        setPendingFile(file);
        setShowDialog(true);
        return;
      }

      // If no image, try text
      const text = await window.electronAPI.getClipboardText();
      
      if (text && text.trim()) {
        const blob = new Blob([text], { type: "text/plain" });
        const file = new File([blob], "clipboard-text.txt", {
          type: "text/plain",
          lastModified: Date.now(),
        });
        setPendingFile(file);
        setShowDialog(true);
        return;
      }

      // No content in clipboard
      showToast("Clipboard is empty", "info", { duration: 3000 });
    } catch (err: any) {
      console.error("Error reading clipboard:", err);
      showToast("Failed to read clipboard", "error", { duration: 3000 });
    }
  }, [showToast, isElectronAvailable]);

  const handleDialogConfirm = useCallback(
    (fileName: string) => {
      if (!pendingFile) return;

      setShowDialog(false);
      
      // Update file name and extension
      const fileType = pendingFile.type.startsWith("image/") ? "image" : "text";
      const extension = fileType === "image" ? ".png" : ".txt";
      
      // Remove any existing extension and add the correct one
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      const finalFileName = nameWithoutExt ? `${nameWithoutExt}${extension}` : `clipboard${extension}`;

      // Create new file with the user-provided name
      const renamedFile = new File([pendingFile], finalFileName, {
        type: pendingFile.type,
        lastModified: pendingFile.lastModified,
      });

      uploadFile(renamedFile);
      setPendingFile(null);
    },
    [pendingFile, uploadFile]
  );

  const handleDialogCancel = useCallback(() => {
    setShowDialog(false);
    setPendingFile(null);
  }, []);

  if (!db || !storage) return null;

  const fileType = pendingFile?.type.startsWith("image/") ? "image" : "text";
  const defaultFileName = pendingFile
    ? pendingFile.name.replace(/\.[^/.]+$/, "")
    : "";

  return (
    <>
      {CollisionDialogComponent}
      {FileSizeDialogComponent}
      <FileNameDialog
        isOpen={showDialog}
        defaultFileName={defaultFileName}
        fileType={fileType}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
      <div className={styles.fileUploader}>
        <button
          type="button"
          className={styles.fileUploader__button}
          onClick={handleClipboardClick}
          disabled={loading || !isElectronAvailable}
          title={isElectronAvailable ? "Upload from clipboard" : "Clipboard access not available"}
        >
          {loading ? (
            <span className={styles.fileUploader__spinner}></span>
          ) : (
            <span className={`material-icons ${styles.fileUploader__icon}`}>content_paste</span>
          )}
          {loading ? "Uploading..." : "Clipboard"}
        </button>
      </div>
    </>
  );
};

export default ClipboardUploader;

