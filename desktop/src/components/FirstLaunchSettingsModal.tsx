import { type FC, useState, useRef, useEffect } from "react";
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
  const pasteTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleManualPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");
    const parsed = parseFirebaseConfig(text);
    
    if (parsed) {
      if (parsed.apiKey) setApiKey(parsed.apiKey);
      if (parsed.projectId) setProjectId(parsed.projectId);
      if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
      setPasteSuccess(true);
      setPasteError(null);
      setTimeout(() => setPasteSuccess(false), 3000);
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
          <h2>Welcome to OwnDrive</h2>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "var(--text-secondary)" }}>
            Please configure your Firebase credentials to get started
          </p>
        </div>

        <div className={styles.settingsModal__content}>
          <div className={styles.settingsModal__section}>
            <h3>Firebase Configuration</h3>
            <p className={styles.settingsModal__description}>
              Configure your Firebase project credentials. These are stored locally and required to connect to your Firebase Storage and Firestore.
            </p>

            {/* Paste from Clipboard Section */}
            <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--surface-secondary)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <button
                  onClick={handlePaste}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  Paste from Clipboard
                </button>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Or paste Firebase config code below
                </span>
              </div>
              <textarea
                ref={pasteTextareaRef}
                onPaste={handleManualPaste}
                placeholder="Paste your Firebase config code here (e.g., from Firebase Console)..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  resize: "vertical",
                }}
              />
              {pasteSuccess && (
                <p style={{ marginTop: "8px", color: "var(--success)", fontSize: "14px" }}>
                  ✓ Config parsed successfully! Fields have been filled.
                </p>
              )}
              {pasteError && (
                <p style={{ marginTop: "8px", color: "var(--error)", fontSize: "14px" }}>
                  {pasteError}
                </p>
              )}
            </div>

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
        </div>

        <div className={styles.settingsModal__footer}>
          <button
            className={styles["settingsModal__button--primary"]}
            onClick={handleSave}
            disabled={!canSave}
            style={{
              opacity: canSave ? 1 : 0.5,
              cursor: canSave ? "pointer" : "not-allowed",
            }}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

