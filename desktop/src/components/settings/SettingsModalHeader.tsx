import { type FC } from "react";

type Props = {
  onClose: () => void;
};

export const SettingsModalHeader: FC<Props> = ({ onClose }) => {
  return (
    <div className="settings-modal-header">
      <h2>Settings</h2>
      <button className="settings-modal-close" onClick={onClose}>
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

