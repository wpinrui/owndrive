import { type FC, useState, useEffect, useRef } from "react";
import styles from "../styling/FileNameDialog.module.scss";

type Props = {
  isOpen: boolean;
  defaultFileName: string;
  fileType: "text" | "image";
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
};

export const FileNameDialog: FC<Props> = ({
  isOpen,
  defaultFileName,
  fileType,
  onConfirm,
  onCancel,
}) => {
  const [fileName, setFileName] = useState(defaultFileName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFileName(defaultFileName);
      // Focus input after dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, defaultFileName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
      onConfirm(fileName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel} onKeyDown={handleKeyDown}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h3>Name Your File</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog__content">
            <label className={styles.fileNameDialog__label}>
              File name:
              <input
                ref={inputRef}
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className={styles.fileNameDialog__input}
                placeholder="Enter file name"
                autoFocus
              />
            </label>
            <p className={styles.fileNameDialog__hint}>
              {fileType === "text" 
                ? "This will be saved as a .txt file" 
                : "This will be saved as a .png file"}
            </p>
          </div>

          <div className="dialog__actions">
            <button
              type="button"
              className={`${styles.fileNameDialog__button} ${styles["fileNameDialog__button--cancel"]}`}
              onClick={onCancel}
            >
              <span className="material-icons">cancel</span>
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.fileNameDialog__button} ${styles["fileNameDialog__button--confirm"]}`}
              disabled={!fileName.trim()}
            >
              <span className="material-icons">check</span>
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

