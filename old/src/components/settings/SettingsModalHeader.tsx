import { type FC } from "react";
import styles from "../../styling/SettingsModal.module.scss";

type Props = {
  onClose: () => void;
};

export const SettingsModalHeader: FC<Props> = ({ onClose }) => {
  return (
    <div className={styles.settingsModal__header}>
      <h2>Settings</h2>
      <button className={styles.settingsModal__close} onClick={onClose}>
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

