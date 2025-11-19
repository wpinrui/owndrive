import { type FC } from "react";
import type { UserSettings } from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";
import { formatFileSize } from "../helpers/fileHelpers";
import styles from "../../styling/SettingsModal.module.scss";

type Props = {
  localSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
};

export const FileSizeWarningSection: FC<Props> = ({ localSettings, onSettingsChange }) => {
  const mbValue = localSettings.fileSizeWarningLimit
    ? Math.round(localSettings.fileSizeWarningLimit / (1024 * 1024))
    : 100;

  const handleChange = (mbValue: number) => {
    const bytesValue = mbValue * 1024 * 1024;
    onSettingsChange({
      ...localSettings,
      fileSizeWarningLimit: bytesValue,
    });
  };

  const currentLimit = localSettings.fileSizeWarningLimit ?? DEFAULT_SETTINGS.fileSizeWarningLimit!;

  return (
    <div className={styles.settingsModal__section}>
      <h3>File Size Warning</h3>
      <p className={styles.settingsModal__description}>
        Warn when uploading files larger than this size. This helps you stay within Firebase's free tier limits (5 GB storage). The default is 100 MB (2% of free tier).
      </p>
      <div className={styles.settingsModal__inputGroup}>
        <label htmlFor="file-size-warning-limit" className={styles.settingsModal__inputLabel}>
          Warning Threshold
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input
            id="file-size-warning-limit"
            type="number"
            className={styles.settingsModal__input}
            value={mbValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              handleChange(value);
            }}
            min="0"
            step="1"
            style={{ flex: 1 }}
          />
          <span style={{ whiteSpace: "nowrap" }}>MB</span>
        </div>
        {currentLimit && (
          <p style={{ marginTop: "4px", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Current setting: {formatFileSize(currentLimit)}
          </p>
        )}
      </div>
    </div>
  );
};

