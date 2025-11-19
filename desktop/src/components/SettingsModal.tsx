import { type FC, useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useToast } from "../contexts/ToastContext";
import type { CollisionBehavior, Theme } from "../types/settings";
import { DEFAULT_SETTINGS } from "../types/settings";
import { formatFileSize } from "./helpers/fileHelpers";
import "../styling/SettingsModal.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, clearAllData } = useSettings();
  const { showToast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      setShowClearConfirm(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

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

  const collisionOptions: { value: CollisionBehavior; label: string; description: string }[] = [
    {
      value: "ask-every-time",
      label: "Ask Every Time",
      description: "Prompt for each collision",
    },
    {
      value: "accept-newer-reject-older",
      label: "Accept Newer, Reject Older",
      description: "Automatically replace older files with newer ones",
    },
    {
      value: "keep-both-rename",
      label: "Keep Both and Rename",
      description: "Keep both files by renaming the new one",
    },
  ];

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>Settings</h2>
          <button className="settings-modal-close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-section">
            <h3>Appearance</h3>
            <p className="settings-description">
              Choose your preferred theme. Auto follows your system preference.
            </p>
            <div className="settings-input-group">
              <label htmlFor="theme-selector" className="settings-input-label">
                Theme
              </label>
              <select
                id="theme-selector"
                className="settings-select"
                value={localSettings.theme || DEFAULT_SETTINGS.theme || "auto"}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    theme: e.target.value as Theme,
                  })
                }
              >
                <option value="light">Light</option>
                <option value="auto">Auto</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3>Firebase Configuration</h3>
            <p className="settings-description">
              Configure your Firebase project credentials. These are stored locally and required to connect to your Firebase Storage and Firestore.
            </p>
            <div className="settings-input-group">
              <label htmlFor="firebase-api-key" className="settings-input-label">
                API Key
              </label>
              <input
                id="firebase-api-key"
                type="text"
                className="settings-input"
                value={localSettings.firebaseConfig?.apiKey || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    firebaseConfig: {
                      ...(localSettings.firebaseConfig || { apiKey: "", projectId: "", storageBucket: "" }),
                      apiKey: e.target.value,
                    },
                  })
                }
                placeholder="Enter your Firebase API Key"
              />
            </div>
            <div className="settings-input-group">
              <label htmlFor="firebase-project-id" className="settings-input-label">
                Project ID
              </label>
              <input
                id="firebase-project-id"
                type="text"
                className="settings-input"
                value={localSettings.firebaseConfig?.projectId || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    firebaseConfig: {
                      ...(localSettings.firebaseConfig || { apiKey: "", projectId: "", storageBucket: "" }),
                      projectId: e.target.value,
                    },
                  })
                }
                placeholder="Enter your Firebase Project ID"
              />
            </div>
            <div className="settings-input-group">
              <label htmlFor="firebase-storage-bucket" className="settings-input-label">
                Storage Bucket
              </label>
              <input
                id="firebase-storage-bucket"
                type="text"
                className="settings-input"
                value={localSettings.firebaseConfig?.storageBucket || ""}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    firebaseConfig: {
                      ...(localSettings.firebaseConfig || { apiKey: "", projectId: "", storageBucket: "" }),
                      storageBucket: e.target.value,
                    },
                  })
                }
                placeholder="Enter your Firebase Storage Bucket (e.g., project-id.appspot.com)"
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>File Collision Behavior</h3>
            <p className="settings-description">
              What to do when uploading a file that already exists
            </p>
            <div className="settings-options">
              {collisionOptions.map((option) => (
                <label key={option.value} className="settings-option">
                  <input
                    type="radio"
                    name="collisionBehavior"
                    value={option.value}
                    checked={localSettings.collisionBehavior === option.value}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        collisionBehavior: e.target.value as CollisionBehavior,
                      })
                    }
                  />
                  <div className="settings-option-content">
                    <div className="settings-option-label">{option.label}</div>
                    <div className="settings-option-description">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>Starred File Collision Behavior</h3>
            <p className="settings-description">
              What to do when uploading a file that already exists and is starred
            </p>
            <div className="settings-options">
              {collisionOptions.map((option) => (
                <label key={option.value} className="settings-option">
                  <input
                    type="radio"
                    name="starredCollisionBehavior"
                    value={option.value}
                    checked={localSettings.starredCollisionBehavior === option.value}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        starredCollisionBehavior: e.target.value as CollisionBehavior,
                      })
                    }
                  />
                  <div className="settings-option-content">
                    <div className="settings-option-label">{option.label}</div>
                    <div className="settings-option-description">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3>File Size Warning</h3>
            <p className="settings-description">
              Warn when uploading files larger than this size. This helps you stay within Firebase's free tier limits (5 GB storage). The default is 100 MB (2% of free tier).
            </p>
            <div className="settings-input-group">
              <label htmlFor="file-size-warning-limit" className="settings-input-label">
                Warning Threshold
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  id="file-size-warning-limit"
                  type="number"
                  className="settings-input"
                  value={(localSettings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit!) ? Math.round((localSettings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit!) / (1024 * 1024)) : 100}
                  onChange={(e) => {
                    const mbValue = parseFloat(e.target.value) || 0;
                    const bytesValue = mbValue * 1024 * 1024;
                    setLocalSettings({
                      ...localSettings,
                      fileSizeWarningLimit: bytesValue,
                    });
                  }}
                  min="0"
                  step="1"
                  style={{ flex: 1 }}
                />
                <span style={{ whiteSpace: "nowrap" }}>MB</span>
              </div>
              {(localSettings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit) && (
                <p style={{ marginTop: "4px", fontSize: "0.875rem", color: "#666" }}>
                  Current setting: {formatFileSize(localSettings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit!)}
                </p>
              )}
            </div>
          </div>

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
        </div>

        <div className="settings-modal-footer">
          <button className="settings-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="settings-button-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

