import { type FC, useState } from "react";
import { useToast } from "../../contexts/ToastContext";
import { useSettings } from "../../contexts/SettingsContext";

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
    <div className="settings-section settings-section-danger">
      <h3>Clear All Data</h3>
      <p className="settings-description">
        Permanently delete all local and remote user data, including settings, preferences, and any orphaned data. This action cannot be undone.
      </p>
      {!showClearConfirm ? (
        <button
          className="settings-button-danger"
          onClick={() => setShowClearConfirm(true)}
        >
          <span className="material-icons">delete_forever</span>
          Clear All Data
        </button>
      ) : (
        <div className="settings-clear-confirm">
          <p className="settings-clear-warning">
            Are you sure you want to clear all data? This will delete:
          </p>
          <ul className="settings-clear-list">
            <li>All localStorage data (including orphaned keys)</li>
            <li>Firebase configuration</li>
            <li>User preferences and settings</li>
            <li>Firestore settings document</li>
          </ul>
          <div className="settings-clear-actions">
            <button
              className="settings-button-secondary"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </button>
            <button
              className="settings-button-danger"
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

