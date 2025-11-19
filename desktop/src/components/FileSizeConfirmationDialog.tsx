import { type FC } from "react";
import styles from "../styling/FileSizeConfirmationDialog.module.scss";

type Props = {
  isOpen: boolean;
  fileName: string;
  fileSize: string;
  warningLimit: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const FileSizeConfirmationDialog: FC<Props> = ({
  isOpen,
  fileName,
  fileSize,
  warningLimit,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className={styles.fileSizeDialog__header}>
          <span className={`material-icons ${styles.fileSizeDialog__warningIcon}`}>warning</span>
          <h3>Large File Warning</h3>
        </div>

        <div className="dialog__content">
          <p className={styles.fileSizeDialog__fileName}>{fileName}</p>
          <div className={styles.fileSizeDialog__info}>
            <div className={styles.fileSizeDialog__item}>
              <span className={styles.fileSizeDialog__label}>File size:</span>
              <span className={styles.fileSizeDialog__value}>{fileSize}</span>
            </div>
            <div className={styles.fileSizeDialog__item}>
              <span className={styles.fileSizeDialog__label}>Warning threshold:</span>
              <span className={styles.fileSizeDialog__value}>{warningLimit}</span>
            </div>
          </div>

          <p className={styles.fileSizeDialog__warningMessage}>
            This file exceeds your warning threshold. Firebase free tier includes 5 GB storage. 
            Do you want to proceed with the upload?
          </p>
        </div>

        <div className="dialog__actions">
          <button
            className={`${styles.fileSizeDialog__button} ${styles["fileSizeDialog__button--cancel"]}`}
            onClick={onCancel}
          >
            <span className="material-icons">cancel</span>
            Cancel Upload
          </button>
          <button
            className={`${styles.fileSizeDialog__button} ${styles["fileSizeDialog__button--confirm"]}`}
            onClick={onConfirm}
          >
            <span className="material-icons">check</span>
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

