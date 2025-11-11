import { type FC, useCallback, useRef, useState } from "react";
import { useFirebaseStorage } from "../hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { handleFiles } from "./fileHelpers";
import "./FileUploader.scss";

const FileUploader: FC = () => {
  const { storage, app } = useFirebaseStorage();
  const db = app ? getFirestore(app) : null;
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFilesSelected = useCallback(
    async (files: FileList) => {
      setLoading(true);
      setError(null);
      try {
        await handleFiles(db!, storage!, files);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [db, storage]
  );

  if (!db || !storage) return null;

  return (
    <div className="FileUploader">
      <button
        type="button"
        className="FileUploader__button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? (
          <span className="FileUploader__spinner"></span>
        ) : (
          <span className="material-icons FileUploader__icon">upload</span>
        )}
        {loading ? "Uploading..." : "Upload"}
      </button>

      <input
        type="file"
        multiple
        ref={inputRef}
        className="FileUploader__input"
        onChange={e => e.target.files && onFilesSelected(e.target.files)}
      />

      {error && <div className="FileUploader__toast">{error}</div>}
    </div>
  );
};

export default FileUploader;
