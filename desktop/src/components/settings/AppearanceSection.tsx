import { type FC } from "react";
import type { Theme, UserSettings } from "../../types/settings";
import { DEFAULT_SETTINGS } from "../../types/settings";
import styles from "../../styling/SettingsModal.module.scss";

type Props = {
  localSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
};

export const AppearanceSection: FC<Props> = ({ localSettings, onSettingsChange }) => {
  return (
    <div className={styles.settingsModal__section}>
      <h3>Appearance</h3>
      <p className={styles.settingsModal__description}>
        Choose your preferred theme. Auto follows your system preference.
      </p>
      <div className={styles.settingsModal__inputGroup}>
        <label htmlFor="theme-selector" className={styles.settingsModal__inputLabel}>
          Theme
        </label>
        <select
          id="theme-selector"
          className={styles.settingsModal__select}
          value={localSettings.theme || DEFAULT_SETTINGS.theme || "auto"}
          onChange={(e) =>
            onSettingsChange({
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
  );
};

