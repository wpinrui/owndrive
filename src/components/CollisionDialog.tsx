import { type FC } from "react";
import "../styling/CollisionDialog.scss";

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
    <div className="collision-dialog-overlay" onClick={onClose}>
      <div className="collision-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="collision-dialog-header">
          <h3>File Already Exists</h3>
          {isStarred && (
            <span className="collision-starred-badge">
              <span className="material-icons">star</span>
              Starred
            </span>
          )}
        </div>

        <div className="collision-dialog-content">
          <p className="collision-file-name">{fileName}</p>
          <div className="collision-file-info">
            <div className="collision-file-item">
              <span className="collision-label">Existing file:</span>
              <span className="collision-date">{existingFileDate}</span>
            </div>
            <div className="collision-file-item">
              <span className="collision-label">New file:</span>
              <span className="collision-date">{newFileDate}</span>
            </div>
          </div>

          <p className="collision-question">What would you like to do?</p>
        </div>

        <div className="collision-dialog-actions">
          <button
            className="collision-button collision-button-replace"
            onClick={() => onAction("replace")}
          >
            <span className="material-icons">swap_horiz</span>
            Replace Existing
          </button>
          <button
            className="collision-button collision-button-skip"
            onClick={() => onAction("skip")}
          >
            <span className="material-icons">cancel</span>
            Skip Upload
          </button>
          <button
            className="collision-button collision-button-rename"
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

