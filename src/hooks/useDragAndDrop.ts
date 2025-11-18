import { useState, useRef, useCallback } from "react";
import { Firestore } from "firebase/firestore";
import { type FirebaseStorage } from "firebase/storage";
import { handleFiles, formatFileSize } from "../components/helpers/fileHelpers";
import { useToast } from "../contexts/ToastContext";
import { useSettings } from "../contexts/SettingsContext";
import { useCollisionResolver } from "./useCollisionResolver";

export const useDragAndDrop = (db: Firestore | null, storage: FirebaseStorage | null) => {
    const { showToast, updateToast } = useToast();
    const { settings } = useSettings();
    const { resolveCollision, CollisionDialogComponent } = useCollisionResolver();
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

                await handleFiles(
                    db,
                    storage,
                    files,
                    (progress) => {
                        updateToast(combinedToastId!, { progress });
                    },
                    settings,
                    resolveCollision,
                    (message, type, options) => showToast(message, type, options)
                );

                // Update individual toasts
                toastIds.forEach((id) => {
                    updateToast(id, {
                        type: "success",
                        message: "Upload complete",
                        duration: 4000,
                    });
                });

                updateToast(combinedToastId, {
                    type: "success",
                    message: `Successfully uploaded ${fileArray.length} files`,
                    duration: 4000,
                });
            } else {
                // Single file upload
                const file = fileArray[0];
                const toastId = toastIds[0];

                await handleFiles(
                    db,
                    storage,
                    files,
                    (progress) => {
                        updateToast(toastId, { progress });
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
            
            // Update all toasts to show error
            toastIds.forEach((id) => {
                updateToast(id, {
                    type: "error",
                    message: errorMessage,
                    duration: 4000,
                });
            });

            // Update combined toast if it exists
            if (combinedToastId) {
                updateToast(combinedToastId, {
                    type: "error",
                    message: `Failed to upload files: ${errorMessage}`,
                    duration: 4000,
                });
            }
        }
    }, [db, storage, showToast, updateToast, settings, resolveCollision]);

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
        CollisionDialogComponent,
    };
};

