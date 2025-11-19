import { type FC } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { useLocalSettings } from "../hooks/useLocalSettings";
import { SettingsModalHeader } from "./settings/SettingsModalHeader";
import { SettingsModalFooter } from "./settings/SettingsModalFooter";
import { AppearanceSection } from "./settings/AppearanceSection";
import { FirebaseConfigSection } from "./settings/FirebaseConfigSection";
import { CollisionBehaviorSection } from "./settings/CollisionBehaviorSection";
import { FileSizeWarningSection } from "./settings/FileSizeWarningSection";
import { ClearAllDataSection } from "./settings/ClearAllDataSection";
import styles from "../styling/SettingsModal.module.scss";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SettingsModal: FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const { localSettings, setLocalSettings } = useLocalSettings(settings, isOpen);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className={`dialog ${styles.settingsModal}`} onClick={(e) => e.stopPropagation()}>
        <SettingsModalHeader onClose={onClose} />

        <div className={styles.settingsModal__content}>
          <AppearanceSection
            localSettings={localSettings}
            onSettingsChange={setLocalSettings}
          />

          <FirebaseConfigSection
            localSettings={localSettings}
            onSettingsChange={setLocalSettings}
          />

          <CollisionBehaviorSection
            title="File Collision Behavior"
            description="What to do when uploading a file that already exists"
            name="collisionBehavior"
            localSettings={localSettings}
            onSettingsChange={setLocalSettings}
          />

          <CollisionBehaviorSection
            title="Starred File Collision Behavior"
            description="What to do when uploading a file that already exists and is starred"
            name="starredCollisionBehavior"
            localSettings={localSettings}
            onSettingsChange={setLocalSettings}
          />

          <FileSizeWarningSection
            localSettings={localSettings}
            onSettingsChange={setLocalSettings}
          />

          <ClearAllDataSection />
        </div>

        <SettingsModalFooter onCancel={onClose} onSave={handleSave} />
      </div>
    </div>
  );
};

