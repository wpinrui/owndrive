import { type FC } from "react";
import styles from "../styling/CollisionDialog.module.scss";

type CollisionAction = "replace" | "skip" | "rename";

type Props = {
  isOpen: boolean;
  fileName: string;
  existingFileDate: string;
  newFileDate: string;
  isStarred: boolean;
  onAction: (action: CollisionAction) => void;
  onClose: () => void;
};

export const CollisionDialog: FC<Props> = ({
  isOpen,
  fileName,
  existingFileDate,
  newFileDate,
  isStarred,
  onAction,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__header">
          <h3>File Already Exists</h3>
          {isStarred && (
            <span className={styles.collisionDialog__starredBadge}>
              <span className="material-icons">star</span>
              Starred
            </span>
          )}
        </div>

        <div className="dialog__content">
          <p className={styles.collisionDialog__fileName}>{fileName}</p>
          <div className={styles.collisionDialog__fileInfo}>
            <div className={styles.collisionDialog__fileItem}>
              <span className={styles.collisionDialog__label}>Existing file:</span>
              <span className={styles.collisionDialog__date}>{existingFileDate}</span>
            </div>
            <div className={styles.collisionDialog__fileItem}>
              <span className={styles.collisionDialog__label}>New file:</span>
              <span className={styles.collisionDialog__date}>{newFileDate}</span>
            </div>
          </div>

          <p className={styles.collisionDialog__question}>What would you like to do?</p>
        </div>

        <div className="dialog__actions">
          <button
            className={`${styles.collisionDialog__button} ${styles["collisionDialog__button--replace"]}`}
            onClick={() => onAction("replace")}
          >
            <span className="material-icons">swap_horiz</span>
            Replace Existing
          </button>
          <button
            className={`${styles.collisionDialog__button} ${styles["collisionDialog__button--skip"]}`}
            onClick={() => onAction("skip")}
          >
            <span className="material-icons">cancel</span>
            Skip Upload
          </button>
          <button
            className={`${styles.collisionDialog__button} ${styles["collisionDialog__button--rename"]}`}
            onClick={() => onAction("rename")}
          >
            <span className="material-icons">drive_file_rename_outline</span>
            Keep Both (Rename)
          </button>
        </div>
      </div>
    </div>
  );
};

