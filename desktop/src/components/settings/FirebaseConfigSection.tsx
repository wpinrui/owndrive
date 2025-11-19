import { type FC } from "react";
import type { UserSettings } from "../../types/settings";

type Props = {
  localSettings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
};

export const FirebaseConfigSection: FC<Props> = ({ localSettings, onSettingsChange }) => {
  const updateFirebaseConfig = (field: "apiKey" | "projectId" | "storageBucket", value: string) => {
    onSettingsChange({
      ...localSettings,
      firebaseConfig: {
        ...(localSettings.firebaseConfig || { apiKey: "", projectId: "", storageBucket: "" }),
        [field]: value,
      },
    });
  };

  return (
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
          onChange={(e) => updateFirebaseConfig("apiKey", e.target.value)}
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
          onChange={(e) => updateFirebaseConfig("projectId", e.target.value)}
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
          onChange={(e) => updateFirebaseConfig("storageBucket", e.target.value)}
          placeholder="Enter your Firebase Storage Bucket (e.g., project-id.appspot.com)"
        />
      </div>
    </div>
  );
};

