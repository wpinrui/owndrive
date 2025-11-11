import { useCallback } from "react";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { handleFiles } from "./fileHelpers";

export function FileUploader() {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;

  const onFilesSelected = useCallback(
    (files: FileList) => handleFiles(db!, storage!, files),
    [db, storage]
  )

  if (!db || !storage) return null

  return (
    <div style={{ margin: "20px 0" }}>
      <input
        type="file"
        multiple
        onChange={e => e.target.files && onFilesSelected(e.target.files)}
      />
    </div>
  );
}
