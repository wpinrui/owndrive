import { type FC, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { deleteFileFromStorageAndFirestore, getFileDownloadUrl, toggleStarInFirestore } from "./fileHelpers";
import type { FileMeta } from "./fileTypes";
import "./FileList.scss";

type SortKey = "name" | "size" | "lastModified" | "starred";
type SortOrder = "asc" | "desc";

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
      const list: FileMeta[] = snapshot.docs.map(d => ({
        ...(d.data() as FileMeta),
        id: d.id,
      }));
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

  const handleRowClick = (fileId: string) => {
    setSelectedFile(fileId);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let result = 0;
    switch (sortKey) {
      case "name":
        result = a.name.localeCompare(b.name);
        break;
      case "size":
        result = a.size - b.size;
        break;
      case "lastModified":
        result = a.lastModified - b.lastModified;
        break;
      case "starred":
        result = (a.starred ? 1 : 0) - (b.starred ? 1 : 0);
        break;
    }
    return sortOrder === "asc" ? result : -result;
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const renderSortIndicator = (key: SortKey) => {
    if (sortKey !== key) return null;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  if (!files.length) {
    return (
      <div className="file-list-empty">
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <p>No files uploaded yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <table className="file-list-table">
        <thead>
          <tr>
            <th className="col-icon"></th>
            <th className="col-name" onClick={() => handleSort("name")}>
              Name{renderSortIndicator("name")}
            </th>
            <th className="col-size" onClick={() => handleSort("size")}>
              Size{renderSortIndicator("size")}
            </th>
            <th className="col-modified" onClick={() => handleSort("lastModified")}>
              Last Modified{renderSortIndicator("lastModified")}
            </th>
            <th className="col-starred" onClick={() => handleSort("starred")}>
              Starred{renderSortIndicator("starred")}
            </th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map(file => (
            <tr
              key={file.id}
              className={`file-row ${selectedFile === file.id ? "selected" : ""}`}
              onClick={() => handleRowClick(file.id)}
            >
              <td className="col-icon">
                <div className="file-thumbnail"></div>
              </td>
              <td className="col-name">
                <span className="file-name">{file.name}</span>
              </td>
              <td className="col-size">{formatFileSize(file.size)}</td>
              <td className="col-modified">
                {new Date(file.lastModified).toLocaleString()}
              </td>
              <td className="col-starred">
                {file.starred && <span className="star-icon">⭐</span>}
              </td>
              <td className="col-actions">
                <div className="action-buttons">
                  <button
                    className="action-btn download-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(file);
                    }}
                    title="Download"
                  >
                    ⬇
                  </button>
                  {!file.starred && (
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file);
                      }}
                      title="Delete"
                    >
                      🗑
                    </button>
                  )}
                  <button
                    className="action-btn star-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(file);
                    }}
                    title={file.starred ? "Unstar" : "Star"}
                  >
                    {file.starred ? "★" : "☆"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
