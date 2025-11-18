import { useCallback } from "react";
import type { FileMeta } from "../components/fileTypes";
import { toggleStarInFirestore, deleteFileFromStorageAndFirestore, getFileDownloadUrl } from "../components/helpers/fileHelpers";

export function useFileActions(db: any, storage: any, resetSelection: () => void) {
    const toggleStar = useCallback(
        async (items: FileMeta[]) => {
            if (!db) return;
            for (const file of items) {
                await toggleStarInFirestore(db, file);
            }
        },
        [db]
    );

    const deleteFiles = useCallback(
        async (items: FileMeta[]) => {
            if (!db || !storage) return;
            for (const file of items) {
                if (!file.starred) {
                    await deleteFileFromStorageAndFirestore(db, storage, file);
                }
            }
            resetSelection();
        },
        [db, storage, resetSelection]
    );

    const downloadFiles = useCallback(
        async (items: FileMeta[]) => {
            if (!storage) return;
            for (const file of items) {
                const url = await getFileDownloadUrl(storage, file);
                window.open(url, "_blank");
            }
        },
        [storage]
    );

    return {
        toggleStar,
        deleteFiles,
        downloadFiles
    };
}
