import { type FC } from "react";
import type { CollisionBehavior, UserSettings } from "../../types/settings";
import { COLLISION_OPTIONS } from "../../constants/collisionOptions";
import styles from "../../styling/SettingsModal.module.scss";

type Props = {
  title: string;
  description: string;
  name: "collisionBehavior" | "starredCollisionBehavior";
  localSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
};

export const CollisionBehaviorSection: FC<Props> = ({
  title,
  description,
  name,
  localSettings,
  onSettingsChange,
}) => {
  const value = localSettings[name];

  const handleChange = (newValue: CollisionBehavior) => {
    onSettingsChange({
      ...localSettings,
      [name]: newValue,
    });
  };

  return (
    <div className={styles.settingsModal__section}>
      <h3>{title}</h3>
      <p className={styles.settingsModal__description}>{description}</p>
      <div className={styles.settingsModal__options}>
        {COLLISION_OPTIONS.map((option) => (
          <label key={option.value} className={styles.settingsModal__option}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => handleChange(e.target.value as CollisionBehavior)}
            />
            <div className={styles.settingsModal__optionContent}>
              <div className={styles.settingsModal__optionLabel}>{option.label}</div>
              <div className={styles.settingsModal__optionDescription}>{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

