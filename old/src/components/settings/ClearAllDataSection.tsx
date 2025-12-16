import { type FC, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useSettings } from "../../contexts/SettingsContext";
import styles from "../../styling/SettingsModal.module.scss";

export const ClearAllDataSection: FC = () => {
  const { clearAllData } = useSettings();
  const { showToast } = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAllData = async () => {
    try {
      await clearAllData();
      showToast("All user data has been cleared. Reloading...", "success");
      // Reload the page after a short delay to reset all state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error clearing data:", error);
      showToast("Failed to clear all data. Please try again.", "error");
    }
  };

  return (
    <div className={`${styles.settingsModal__section} ${styles["settingsModal__section--danger"]}`}>
      <h3>Clear All Data</h3>
      <p className={styles.settingsModal__description}>
        Permanently delete all local and remote user data, including settings, preferences, and any orphaned data. This action cannot be undone.
      </p>
      {!showClearConfirm ? (
        <button
          className={styles["settingsModal__button--danger"]}
          onClick={() => setShowClearConfirm(true)}
        >
          <span className="material-icons">delete_forever</span>
          Clear All Data
        </button>
      ) : (
        <div className={styles.settingsModal__clearConfirm}>
          <p className={styles.settingsModal__clearWarning}>
            Are you sure you want to clear all data? This will delete:
          </p>
          <ul className={styles.settingsModal__clearList}>
            <li>All localStorage data (including orphaned keys)</li>
            <li>Firebase configuration</li>
            <li>User preferences and settings</li>
            <li>Firestore settings document</li>
          </ul>
          <div className={styles.settingsModal__clearActions}>
            <button
              className={styles["settingsModal__button--secondary"]}
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
            <button
              className={styles["settingsModal__button--danger"]}
              onClick={handleClearAllData}
            >
              <span className="material-icons">delete_forever</span>
              Yes, Clear Everything
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

