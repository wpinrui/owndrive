import { useState, useRef, useCallback } from "react";
import { Firestore } from "firebase/firestore";
import { type FirebaseStorage } from "firebase/storage";
import { handleFiles, formatFileSize } from "../components/helpers/fileHelpers";
import { useToast } from "../contexts/ToastContext";

export const useDragAndDrop = (db: Firestore | null, storage: FirebaseStorage | null) => {
    const { showToast, updateToast } = useToast();
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

        // Only process single file as requested
        const fileToUpload = files.length > 1 ? files[0] : files[0];
        const fileName = fileToUpload.name;
        const fileSize = formatFileSize(fileToUpload.size);
        
        const toastId = showToast(
            `Uploading ${fileName} (${fileSize})...`,
            "loading",
            { duration: 0 }
        );
        console.log("Toast created with ID:", toastId);

        try {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(fileToUpload);
            const singleFileList = dataTransfer.files;
            
            await handleFiles(db, storage, singleFileList, (progress) => {
                updateToast(toastId, { progress });
            });

            updateToast(toastId, {
                type: "success",
                message: `Successfully uploaded ${fileName}`,
                duration: 3000,
            });
        } catch (err: any) {
            console.error("Error uploading file:", err);
            updateToast(toastId, {
                type: "error",
                message: `Failed to upload ${fileName}: ${err.message || "Unknown error"}`,
                duration: 5000,
            });
        }
    }, [db, storage, showToast, updateToast]);

    return {
        isDragging,
        dragHandlers: {
            onDragEnter: handleDragEnter,
            onDragOver: handleDragOver,
            onDragLeave: handleDragLeave,
            onDrop: handleDrop,
        },
    };
};

