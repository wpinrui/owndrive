import { type FC, useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import type { FirebaseConfig } from "../types/settings";
import styles from "../styling/SettingsModal.module.scss";

type Props = {
  isOpen: boolean;
};

/**
 * Parses Firebase config code from clipboard/text
 * Handles various formats including:
 * - Full Firebase config object with comments
 * - Just the firebaseConfig object
 * - Individual key-value pairs
 */
const parseFirebaseConfig = (text: string): Partial<FirebaseConfig> | null => {
  if (!text || !text.trim()) return null;

  const result: Partial<FirebaseConfig> = {};

  // Try to extract from firebaseConfig object
  // Match: apiKey: "...", or apiKey: '...',
  const apiKeyMatch = text.match(/apiKey\s*:\s*["']([^"']+)["']/);
  if (apiKeyMatch) {
    result.apiKey = apiKeyMatch[1];
  }

  // Match: projectId: "...", or projectId: '...',
  const projectIdMatch = text.match(/projectId\s*:\s*["']([^"']+)["']/);
  if (projectIdMatch) {
    result.projectId = projectIdMatch[1];
  }

  // Match: storageBucket: "...", or storageBucket: '...',
  const storageBucketMatch = text.match(/storageBucket\s*:\s*["']([^"']+)["']/);
  if (storageBucketMatch) {
    result.storageBucket = storageBucketMatch[1];
  }

  // Also try to match authDomain and messagingSenderId if present (for completeness)
  // But we only need the three above

  // Return null if we didn't find at least one field
  if (!result.apiKey && !result.projectId && !result.storageBucket) {
    return null;
  }

  return result;
};

export const FirstLaunchSettingsModal: FC<Props> = ({ isOpen }) => {
  const { settings, updateSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.firebaseConfig?.apiKey || "");
  const [projectId, setProjectId] = useState(settings.firebaseConfig?.projectId || "");
  const [storageBucket, setStorageBucket] = useState(settings.firebaseConfig?.storageBucket || "");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setApiKey(settings.firebaseConfig?.apiKey || "");
      setProjectId(settings.firebaseConfig?.projectId || "");
      setStorageBucket(settings.firebaseConfig?.storageBucket || "");
      setPasteError(null);
      setPasteSuccess(false);
    }
  }, [isOpen, settings.firebaseConfig]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = parseFirebaseConfig(text);
      
      if (!parsed || (!parsed.apiKey && !parsed.projectId && !parsed.storageBucket)) {
        setPasteError("Could not parse Firebase config from clipboard. Please paste the config code manually.");
        setPasteSuccess(false);
        return;
      }

      // Update fields with parsed values (only if found)
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);

      setPasteSuccess(true);
      setPasteError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setPasteSuccess(false), 3000);
    } catch (error) {
      setPasteError("Failed to read from clipboard. Please paste the config code manually.");
      setPasteSuccess(false);
    }
  };


  const handleSave = () => {
    const trimmedApiKey = apiKey.trim();
    const trimmedProjectId = projectId.trim();
    const trimmedStorageBucket = storageBucket.trim();

    if (!trimmedApiKey || !trimmedProjectId || !trimmedStorageBucket) {
      setPasteError("All fields are required. Please fill in all Firebase configuration fields.");
      return;
    }

    const firebaseConfig: FirebaseConfig = {
      apiKey: trimmedApiKey,
      projectId: trimmedProjectId,
      storageBucket: trimmedStorageBucket,
    };

    updateSettings({
      ...settings,
      firebaseConfig,
    });
  };

  const canSave = apiKey.trim() && projectId.trim() && storageBucket.trim();

  if (!isOpen) return null;

  return (
    <div 
      className="dialog-overlay" 
      style={{ 
        pointerEvents: "auto",
        zIndex: 10000,
      }}
      // Prevent closing by clicking outside
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className={`dialog ${styles.settingsModal}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "600px" }}
      >
        <div className={styles.settingsModal__header}>
          <div>
            <h2>Welcome to OwnDrive</h2>
            <p className={styles.settingsModal__description} style={{ marginTop: "8px" }}>
              Please configure your Firebase credentials to get started
            </p>
          </div>
        </div>

        <div className={styles.settingsModal__content}>
          <div className={styles.settingsModal__section}>
            <h3>Firebase Configuration</h3>
            <p className={styles.settingsModal__description}>
              Configure your Firebase project credentials. These are stored locally and required to connect to your Firebase Storage and Firestore.
            </p>

            <div className={styles.settingsModal__fieldsRow}>
              {/* Left side: Input fields (2/3) */}
              <div className={styles.settingsModal__fieldsColumn}>
                <div className={styles.settingsModal__inputGroup}>
                  <label htmlFor="firebase-api-key" className={styles.settingsModal__inputLabel}>
                    API Key *
                  </label>
                  <input
                    id="firebase-api-key"
                    type="text"
                    className={styles.settingsModal__input}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setPasteError(null);
                    }}
                    placeholder="Enter your Firebase API Key"
                    required
                  />
                </div>
                <div className={styles.settingsModal__inputGroup}>
                  <label htmlFor="firebase-project-id" className={styles.settingsModal__inputLabel}>
                    Project ID *
                  </label>
                  <input
                    id="firebase-project-id"
                    type="text"
                    className={styles.settingsModal__input}
                    value={projectId}
                    onChange={(e) => {
                      setProjectId(e.target.value);
                      setPasteError(null);
                    }}
                    placeholder="Enter your Firebase Project ID"
                    required
                  />
                </div>
                <div className={styles.settingsModal__inputGroup}>
                  <label htmlFor="firebase-storage-bucket" className={styles.settingsModal__inputLabel}>
                    Storage Bucket *
                  </label>
                  <input
                    id="firebase-storage-bucket"
                    type="text"
                    className={styles.settingsModal__input}
                    value={storageBucket}
                    onChange={(e) => {
                      setStorageBucket(e.target.value);
                      setPasteError(null);
                    }}
                    placeholder="Enter your Firebase Storage Bucket (e.g., project-id.appspot.com)"
                    required
                  />
                </div>
              </div>

              {/* Bottom section: Paste option (1/3) */}
              <div className={styles.settingsModal__pasteColumn}>
                <div className={styles.settingsModal__pasteSidebar}>
                  <div className={styles.settingsModal__pasteDivider}>
                    <span>OR</span>
                  </div>
                  <div style={{ width: "100%", textAlign: "center" }}>
                    <button
                      onClick={handlePaste}
                      className={styles.settingsModal__pasteButton}
                    >
                      Auto-fill from Clipboard
                    </button>
                    <p className={styles.settingsModal__pasteHelp}>
                      Paste your Firebase config code from the console
                    </p>
                  </div>
                  {pasteSuccess && (
                    <p className={`${styles.settingsModal__message} ${styles["settingsModal__message--success"]}`}>
                      ✓ Config parsed!
                    </p>
                  )}
                  {pasteError && (
                    <p className={`${styles.settingsModal__message} ${styles["settingsModal__message--error"]}`}>
                      {pasteError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsModal__footer}>
          <button
            className={`${styles.settingsModal__button} ${styles["settingsModal__button--primary"]}`}
            onClick={handleSave}
            disabled={!canSave}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

