import { type FC } from "react";
import type { CollisionBehavior, UserSettings } from "../../types/settings";
import { COLLISION_OPTIONS } from "../../constants/collisionOptions";

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
    <div className="settings-section">
      <h3>{title}</h3>
      <p className="settings-description">{description}</p>
      <div className="settings-options">
        {COLLISION_OPTIONS.map((option) => (
          <label key={option.value} className="settings-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => handleChange(e.target.value as CollisionBehavior)}
            />
            <div className="settings-option-content">
              <div className="settings-option-label">{option.label}</div>
              <div className="settings-option-description">{option.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

