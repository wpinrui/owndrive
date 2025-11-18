import { useState, useRef, useCallback } from "react";
import { Firestore } from "firebase/firestore";
import { type FirebaseStorage } from "firebase/storage";
import { handleFiles } from "../components/helpers/fileHelpers";

export const useDragAndDrop = (db: Firestore | null, storage: FirebaseStorage | null) => {
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
        if (files.length > 1) {
            // If multiple files, only take the first one
            const singleFile = files[0];
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(singleFile);
            const singleFileList = dataTransfer.files;
            
            try {
                await handleFiles(db, storage, singleFileList);
            } catch (err: any) {
                console.error("Error uploading file:", err);
            }
        } else {
            try {
                await handleFiles(db, storage, files);
            } catch (err: any) {
                console.error("Error uploading file:", err);
            }
        }
    }, [db, storage]);

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

