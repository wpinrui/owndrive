import { type FC, useEffect, useState, useCallback, type MouseEvent } from "react";
import { collection, onSnapshot, getFirestore } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import {
  deleteFileFromStorageAndFirestore,
  getFileDownloadUrl,
  toggleStarInFirestore
} from "./fileHelpers";
import type { FileMeta } from "./fileTypes";
import { FileRow } from "./FileRow";
import { FileTableHeader } from "./FileTableHeader";
import { EmptyState } from "./EmptyState";
import { sortFiles, buildRange, mergeSelection } from "./fileListHelpers";
import "./FileList.scss";

export type SortKey = "name" | "size" | "lastModified" | "starred";
export type SortOrder = "asc" | "desc";

const FileList: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const db = app ? getFirestore(app) : null;

  useEffect(() => {
    if (!db) return;
    const q = collection(db, "files");
    const unsubscribe = onSnapshot(q, snapshot => {
      const list: FileMeta[] = snapshot.docs.map(d => ({ ...(d.data() as FileMeta), id: d.id }));
      setFiles(list);
    });
    return () => unsubscribe();
  }, [db]);

  const toggleStar = async (items: FileMeta[]) => {
    if (!db) return;
    for (const file of items) {
      await toggleStarInFirestore(db, file);
    }
  };

  const deleteFiles = async (items: FileMeta[]) => {
    if (!db || !storage) return;
    for (const file of items) {
      if (!file.starred) await deleteFileFromStorageAndFirestore(db, storage, file);
    }
    setFiles(f => f.filter(x => !items.some(y => y.id === x.id)));
    setSelected([]);
    setLastSelectedIndex(null);
  };

  const downloadFiles = async (items: FileMeta[]) => {
    if (!storage) return;
    for (const file of items) {
      const url = await getFileDownloadUrl(storage, file);
      window.open(url, "_blank");
    }
  };

  const displayedFiles = sortFiles(files, sortKey, sortOrder);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (selected.length === 0) return;
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
    },
    [selected, files, storage, db, displayedFiles]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (!files.length) return <EmptyState />;

  const onRowClick = (id: string, index: number, e: MouseEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && lastSelectedIndex !== null) {
      const range = buildRange(displayedFiles, lastSelectedIndex, index);
      setSelected(prev => mergeSelection(prev, range));
      return;
    }

    if (e.shiftKey && lastSelectedIndex !== null) {
      const range = buildRange(displayedFiles, lastSelectedIndex, index);
      setSelected(range);
      return;
    }

    if (e.metaKey || e.ctrlKey) {
      setSelected(prev =>
        prev.includes(id)
          ? prev.filter(x => x !== id)
          : [...prev, id]
      );
      setLastSelectedIndex(index);
      return;
    }

    setSelected([id]);
    setLastSelectedIndex(index);
  };

  return (
    <div className="file-list-container">
      <table className="file-list-table">
        <FileTableHeader sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
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
