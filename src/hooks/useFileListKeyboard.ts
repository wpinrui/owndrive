import { useEffect } from "react";
import type { FileMeta } from "../components/fileTypes";

export function useFileListKeyboard(
    selected: string[],
    displayedFiles: FileMeta[],
    downloadFiles: (items: FileMeta[]) => void | Promise<void>,
    deleteFiles: (items: FileMeta[]) => void | Promise<void>,
    toggleStar: (items: FileMeta[]) => void | Promise<void>
) {
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (!selected.length) return;
            const selectedFiles = displayedFiles.filter(f => selected.includes(f.id));

            if (e.key === "Enter") {
                e.preventDefault();
                downloadFiles(selectedFiles);
            }

            if (e.key === "Delete" && e.shiftKey) {
                e.preventDefault();
                deleteFiles(selectedFiles);
            }

            if (e.key.toLowerCase() === "s") {
                e.preventDefault();
                toggleStar(selectedFiles);
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [selected, displayedFiles, downloadFiles, deleteFiles, toggleStar]);
}
