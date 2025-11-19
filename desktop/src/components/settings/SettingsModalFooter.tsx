import { type FC } from "react";

type Props = {
  onCancel: () => void;
  onSave: () => void;
};

export const SettingsModalFooter: FC<Props> = ({ onCancel, onSave }) => {
  return (
    <div className="settings-modal-footer">
      <button className="settings-button-secondary" onClick={onCancel}>
        Cancel
      </button>
      <button className="settings-button-primary" onClick={onSave}>
        Save
      </button>
    </div>
  );
};

