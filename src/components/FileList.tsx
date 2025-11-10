import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";

interface FileMeta {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  starred: boolean;
  uploadedAt: number;
  storagePath: string;
}

export function FileList() {
  const { storage, app } = useFirebaseStorage();
  const [files, setFiles] = useState<FileMeta[]>([]);
  const db = app ? getFirestore(app) : null;

  useEffect(() => {
    if (!db) return;

    const fetchFiles = async () => {
      const snap = await getDocs(collection(db, "files"));
      const list: FileMeta[] = snap.docs.map(doc => doc.data() as FileMeta);
      setFiles(list);
    };

    fetchFiles();
  }, [db]);

  const toggleStar = async (file: FileMeta) => {
    if (!db) return;
    const fileDoc = doc(db, "files", file.name);
    await updateDoc(fileDoc, { starred: !file.starred });
    setFiles(f => f.map(f2 => (f2.name === file.name ? { ...f2, starred: !f2.starred } : f2)));
  };

  const deleteFile = async (file: FileMeta) => {
    if (!db || !storage) return;
    if (file.starred) return; // cannot delete starred files

    const storageRef = ref(storage, file.storagePath);
    await deleteObject(storageRef);

    const fileDoc = doc(db, "files", file.name);
    await deleteDoc(fileDoc);

    setFiles(f => f.filter(f2 => f2.name !== file.name));
  };

  const downloadFile = async (file: FileMeta) => {
    if (!storage) return;
    const storageRef = ref(storage, file.storagePath);
    const url = await getDownloadURL(storageRef);
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
}
