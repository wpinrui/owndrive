import { useCallback } from "react";
import type { FileMeta } from "../components/fileTypes";
import { toggleStarInFirestore, deleteFileFromStorageAndFirestore, getFileDownloadUrl } from "../components/helpers/fileHelpers";
import { useToast } from "../contexts/ToastContext";

export function useFileActions(db: any, storage: any, resetSelection: () => void) {
    const { showToast, updateToast } = useToast();
    const toggleStar = useCallback(
        async (items: FileMeta[]) => {
            if (!db) return;
            const action = items[0]?.starred ? "Unstarring" : "Starring";
            const toastId = items.length > 1
                ? showToast(`${action} ${items.length} files...`, "loading", { duration: 0 })
                : showToast(`${action} ${items[0].name}...`, "loading", { duration: 0 });

            try {
                for (const file of items) {
                    await toggleStarInFirestore(db, file);
                }
                updateToast(toastId, {
                    type: "success",
                    message: items.length > 1
                        ? `Successfully ${action.toLowerCase()} ${items.length} files`
                        : `Successfully ${action.toLowerCase()} ${items[0].name}`,
                    duration: 2000,
                });
            } catch (err: any) {
                updateToast(toastId, {
                    type: "error",
                    message: `Failed to ${action.toLowerCase()}: ${err.message || "Unknown error"}`,
                    duration: 5000,
                });
            }
        },
        [db, showToast, updateToast]
    );

    const deleteFiles = useCallback(
        async (items: FileMeta[]) => {
            if (!db || !storage) return;
            
            const filesToDelete = items.filter(f => !f.starred);
            if (filesToDelete.length === 0) {
                showToast("Cannot delete starred files", "info", { duration: 3000 });
                return;
            }

            const toastId = filesToDelete.length > 1
                ? showToast(`Deleting ${filesToDelete.length} files...`, "loading", { duration: 0, progress: 0 })
                : showToast(`Deleting ${filesToDelete[0].name}...`, "loading", { duration: 0 });
            console.log("Delete toast created with ID:", toastId);

            try {
                for (let i = 0; i < filesToDelete.length; i++) {
                    const file = filesToDelete[i];
                    await deleteFileFromStorageAndFirestore(db, storage, file);
                    
                    // Update progress
                    if (filesToDelete.length > 1) {
                        const progress = Math.round(((i + 1) / filesToDelete.length) * 100);
                        updateToast(toastId, { progress });
                    }
                }

                updateToast(toastId, {
                    type: "success",
                    message: filesToDelete.length > 1
                        ? `Successfully deleted ${filesToDelete.length} files`
                        : `Successfully deleted ${filesToDelete[0].name}`,
                    duration: 3000,
                });
                resetSelection();
            } catch (err: any) {
                updateToast(toastId, {
                    type: "error",
                    message: `Failed to delete: ${err.message || "Unknown error"}`,
                    duration: 5000,
                });
            }
        },
        [db, storage, resetSelection, showToast, updateToast]
    );

    const downloadFiles = useCallback(
        async (items: FileMeta[]) => {
            if (!storage) return;
            const toastId = items.length > 1
                ? showToast(`Preparing ${items.length} files for download...`, "loading", { duration: 0 })
                : showToast(`Preparing ${items[0].name}...`, "loading", { duration: 0 });

            try {
                for (let i = 0; i < items.length; i++) {
                    const file = items[i];
                    const url = await getFileDownloadUrl(storage, file);
                    window.open(url, "_blank");
                    
                    if (items.length > 1) {
                        const progress = Math.round(((i + 1) / items.length) * 100);
                        updateToast(toastId, { progress });
                    }
                }

                updateToast(toastId, {
                    type: "success",
                    message: items.length > 1
                        ? `Opened ${items.length} files for download`
                        : `Opened ${items[0].name} for download`,
                    duration: 2000,
                });
            } catch (err: any) {
                updateToast(toastId, {
                    type: "error",
                    message: `Failed to download: ${err.message || "Unknown error"}`,
                    duration: 5000,
                });
            }
        },
        [storage, showToast, updateToast]
    );

    return {
        toggleStar,
        deleteFiles,
        downloadFiles
    };
}
