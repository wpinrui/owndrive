import { type FC, useRef, useMemo, useEffect } from "react";
import { getFirestore } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { FileRow } from "./FileRow";
import { FileTableHeader } from "./FileTableHeader";
import { EmptyState } from "./EmptyState";
import "../styling/FileList.scss";
import { sortFiles } from "./helpers/fileListHelpers";
import { useSortPreferences } from "../hooks/useSortPreferences";
import { useFileSelection } from "../hooks/useFileSelection";
import { useFileActions } from "../hooks/useFileActions";
import { useFileListKeyboard } from "../hooks/useFileListKeyboard";
import { useFilesSubscription } from "../hooks/useFileSubscription";

export type SortKey = "name" | "size" | "lastModified" | "starred" | "type";
export type SortOrder = "asc" | "desc";

interface FileListProps {
    showStarredFirst: boolean;
}

const FileList: FC<FileListProps> = ({ showStarredFirst }) => {
    const { storage, app } = useFirebaseStorage();
    const db = app ? getFirestore(app) : null;

    const files = useFilesSubscription(db);

    const { sortKey, sortOrder, handleSort } = useSortPreferences("name", "asc");

    const displayedFiles = useMemo(() => {
        const primary = sortFiles(files, sortKey, sortOrder);
        if (!showStarredFirst) return primary;
        const starred = primary.filter(f => f.starred);
        const unstarred = primary.filter(f => !f.starred);
        return [...starred, ...unstarred];
    }, [files, sortKey, sortOrder, showStarredFirst]);

    const {
        selected,
        setSelected,
        setLastSelectedIndex,
        onRowClick
    } = useFileSelection(displayedFiles);

    const resetSelection = () => {
        setSelected([]);
        setLastSelectedIndex(null);
    };

    const { toggleStar, deleteFiles, downloadFiles } =
        useFileActions(db, storage, resetSelection);

    useFileListKeyboard(selected, displayedFiles, downloadFiles, deleteFiles, toggleStar);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | globalThis.MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setSelected([]);
                setLastSelectedIndex(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setSelected, setLastSelectedIndex]);

    if (!files.length) return <EmptyState />;

    return (
        <div ref={containerRef} className="file-list-container">
            <table className="file-list-table">
                <FileTableHeader
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                />
                <tbody>
                    {displayedFiles.map((file, index) => (
                        <FileRow
                            key={file.id}
                            file={file}
                            selected={selected.includes(file.id)}
                            onRowClick={(id, e) => onRowClick(id, index, e)}
                            onDownload={() => downloadFiles([file])}
                            onDelete={() => deleteFiles([file])}
                            onToggleStar={() => toggleStar([file])}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default FileList;
