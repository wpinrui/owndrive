import { type FC, useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import type { CollisionBehavior } from "../types/settings";
import "../styling/SettingsModal.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
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

