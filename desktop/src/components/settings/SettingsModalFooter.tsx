import { type FC } from "react";
import styles from "../../styling/SettingsModal.module.scss";

type Props = {
  onCancel: () => void;
  onSave: () => void;
};

export const SettingsModalFooter: FC<Props> = ({ onCancel, onSave }) => {
  return (
    <div className={styles.settingsModal__footer}>
      <button className={styles["settingsModal__button--secondary"]} onClick={onCancel}>
        Cancel
      </button>
      <button className={styles["settingsModal__button--primary"]} onClick={onSave}>
        Save
      </button>
    </div>
  );
};

