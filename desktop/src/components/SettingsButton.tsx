import { type FC, useState, useEffect } from "react";
import { SettingsModal } from "./SettingsModal";
import "../styling/SettingsButton.scss";

type Props = {
  initialOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export const SettingsButton: FC<Props> = ({ initialOpen = false, onOpenChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(initialOpen);

  useEffect(() => {
    setIsModalOpen(initialOpen);
  }, [initialOpen]);

  const handleOpen = () => {
    setIsModalOpen(true);
    onOpenChange?.(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    onOpenChange?.(false);
  };

  return (
    <>
      <button
        className="settings-button"
        onClick={handleOpen}
        title="Settings"
        aria-label="Open settings"
      >
        <span className="material-icons">settings</span>
      </button>
      <SettingsModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
};

