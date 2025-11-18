import { type FC, useState } from "react";
import { SettingsModal } from "./SettingsModal";
import "../styling/SettingsButton.scss";

export const SettingsButton: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="settings-button"
        onClick={() => setIsModalOpen(true)}
        title="Settings"
        aria-label="Open settings"
      >
        <span className="material-icons">settings</span>
      </button>
      <SettingsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

