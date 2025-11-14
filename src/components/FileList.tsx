// FileList.tsx
import { type FC, useEffect, useState } from "react";
import { collection, onSnapshot, getFirestore } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { deleteFileFromStorageAndFirestore, getFileDownloadUrl, toggleStarInFirestore } from "./fileHelpers";
import type { FileMeta } from "./fileTypes";
import { FileRow } from "./FileRow";
import { FileTableHeader } from "./FileTableHeader";
import { EmptyState } from "./EmptyState";
import "./FileList.scss";

export type SortKey = "name" | "size" | "lastModified" | "starred";
export type SortOrder = "asc" | "desc";

const FileList: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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

  const toggleStar = async (file: FileMeta) => {
    if (!db) return;
    await toggleStarInFirestore(db, file);
    setFiles(f => f.map(f2 => (f2.name === file.name ? { ...f2, starred: !f2.starred } : f2)));
  };

  const deleteFile = async (file: FileMeta) => {
    if (!db || !storage || file.starred) return;
    await deleteFileFromStorageAndFirestore(db, storage, file);
    setFiles(f => f.filter(f2 => f2.name !== file.name));
    if (selectedFile === file.id) setSelectedFile(null);
  };

  const downloadFile = async (file: FileMeta) => {
    if (!storage) return;
    const url = await getFileDownloadUrl(storage, file);
    window.open(url, "_blank");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (!files.length) return <EmptyState />;

  const sortedFiles = [...files].sort((a, b) => {
    let result = 0;
    switch (sortKey) {
      case "name": result = a.name.localeCompare(b.name); break;
      case "size": result = a.size - b.size; break;
      case "lastModified": result = a.lastModified - b.lastModified; break;
      case "starred": result = (a.starred ? 1 : 0) - (b.starred ? 1 : 0); break;
    }
    return sortOrder === "asc" ? result : -result;
  });

  return (
    <div className="file-list-container">
      <table className="file-list-table">
        <FileTableHeader sortKey={sortKey} sortOrder={sortOrder} onSort={handleSort} />
        <tbody>
          {sortedFiles.map(file => (
            <FileRow
              key={file.id}
              file={file}
              selected={selectedFile === file.id}
              onRowClick={setSelectedFile}
              onDownload={downloadFile}
              onDelete={deleteFile}
              onToggleStar={toggleStar}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
