import { useState, useRef, useCallback } from "react";
import { Firestore } from "firebase/firestore";
import { type FirebaseStorage } from "firebase/storage";
import { handleFiles, formatFileSize, checkFileSizesAndConfirm } from "../components/helpers/fileHelpers";
import { useToast } from "../contexts/ToastContext";
import { useSettings } from "../contexts/SettingsContext";
import { useCollisionResolver } from "./useCollisionResolver";
import { DEFAULT_SETTINGS } from "../types/settings";
import { useFileSizeConfirmation } from "./useFileSizeConfirmation";

export const useDragAndDrop = (db: Firestore | null, storage: FirebaseStorage | null) => {
    const { showToast, updateToast } = useToast();
    const { settings } = useSettings();
    const { resolveCollision, CollisionDialogComponent } = useCollisionResolver();
    const { confirmFileSize, FileSizeDialogComponent } = useFileSizeConfirmation();
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dragCounter = useRef<number>(0);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        // Only set dragging if we have file items
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            const hasFiles = Array.from(e.dataTransfer.items).some(
                item => item.kind === 'file'
            );
            if (hasFiles) {
                setIsDragging(true);
            }
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        // Only hide overlay when we've truly left the container
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (!db || !storage) {
            return;
        }

        const files = e.dataTransfer.files;
        if (files.length === 0) {
            return;
        }

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
            return;
        }

        // If some files were cancelled, show info
        if (filesToUpload.length < fileArray.length) {
            const cancelledCount = fileArray.length - filesToUpload.length;
            showToast(`${cancelledCount} file(s) were cancelled`, "info", { duration: 3000 });
        }

        // Create a new FileList-like object from the filtered files
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
                    db,
                    storage,
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
                    db,
                    storage,
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
            console.error("Error uploading files:", err);
            const errorMessage = err.message || "Unknown error";
            
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
        }
    }, [db, storage, showToast, updateToast, settings, resolveCollision, confirmFileSize]);

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
        CollisionDialogComponent,
        FileSizeDialogComponent,
    };
};

