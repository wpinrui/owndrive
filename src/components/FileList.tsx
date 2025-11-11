import { type FC, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { deleteFileFromStorageAndFirestore, getFileDownloadUrl, toggleStarInFirestore } from "./fileHelpers";
import type { FileMeta } from "./fileTypes";

const FileList: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const [files, setFiles] = useState<FileMeta[]>([]);
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
  };

  const downloadFile = async (file: FileMeta) => {
    if (!storage) return;
    const url = await getFileDownloadUrl(storage, file);
    window.open(url, "_blank");
  };

  if (!files.length) return <div>No files uploaded yet.</div>;

  return (
    <table style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Size (bytes)</th>
          <th>Last Modified</th>
          <th>Starred</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map(file => (
          <tr key={file.id} style={{ borderBottom: "1px solid gray" }}>
            <td>{file.name}</td>
            <td>{file.size}</td>
            <td>{new Date(file.lastModified).toLocaleString()}</td>
            <td>{file.starred ? "⭐" : ""}</td>
            <td>
              <button onClick={() => downloadFile(file)}>Download</button>
              {!file.starred && <button onClick={() => deleteFile(file)}>Delete</button>}
              <button onClick={() => toggleStar(file)}>{file.starred ? "Unstar" : "Star"}</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FileList;
