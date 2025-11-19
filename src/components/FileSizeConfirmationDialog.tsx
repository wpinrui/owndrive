import { type FC } from "react";
import "../styling/FileSizeConfirmationDialog.scss";

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
    <div className="file-size-dialog-overlay" onClick={onCancel}>
      <div className="file-size-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="file-size-dialog-header">
          <span className="material-icons file-size-warning-icon">warning</span>
          <h3>Large File Warning</h3>
        </div>

        <div className="file-size-dialog-content">
          <p className="file-size-file-name">{fileName}</p>
          <div className="file-size-info">
            <div className="file-size-item">
              <span className="file-size-label">File size:</span>
              <span className="file-size-value">{fileSize}</span>
            </div>
            <div className="file-size-item">
              <span className="file-size-label">Warning threshold:</span>
              <span className="file-size-value">{warningLimit}</span>
            </div>
          </div>

          <p className="file-size-warning-message">
            This file exceeds your warning threshold. Firebase free tier includes 5 GB storage. 
            Do you want to proceed with the upload?
          </p>
        </div>

        <div className="file-size-dialog-actions">
          <button
            className="file-size-button file-size-button-cancel"
            onClick={onCancel}
          >
            <span className="material-icons">cancel</span>
            Cancel Upload
          </button>
          <button
            className="file-size-button file-size-button-confirm"
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

