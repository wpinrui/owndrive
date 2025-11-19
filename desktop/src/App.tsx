import { type FC, useState, useEffect } from "react";
import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";
import { StarredFirstToggle } from "./components/StarredFirstToggle";
import { DropZoneOverlay } from "./components/DropZoneOverlay";
import { ToastContainer } from "./components/ToastContainer";
import { SettingsButton } from "./components/SettingsButton";
import { useFirebaseStorage } from "./hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useSettings } from "./contexts/SettingsContext";
import { useTheme } from "./hooks/useTheme";

const STARRED_FIRST_STORAGE = "fileListStarredFirst";

const App: FC = () => {
    const initialStarredFirst = localStorage.getItem(STARRED_FIRST_STORAGE) === "true";
    const [showStarredFirst, setShowStarredFirst] = useState<boolean>(initialStarredFirst);
    const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
    const [hasCheckedConfig, setHasCheckedConfig] = useState(false);
    const { storage, app } = useFirebaseStorage();
    const { settings, isLoading } = useSettings();
    const db = app ? getFirestore(app) : null;
    const { isDragging, dragHandlers, CollisionDialogComponent, FileSizeDialogComponent } = useDragAndDrop(db, storage);
    
    // Apply theme based on user settings
    useTheme(settings.theme);

    // Check if Firebase config is missing or has empty API key on initial load
    useEffect(() => {
        // Only check once after settings have loaded
        if (isLoading || hasCheckedConfig) {
            return;
        }

        const config = settings.firebaseConfig;
        const apiKey = config?.apiKey?.trim() || "";
        const projectId = config?.projectId?.trim() || "";
        const storageBucket = config?.storageBucket?.trim() || "";
        
        // Check if any required field is missing or empty
        if (!apiKey || !projectId || !storageBucket) {
            setShouldOpenSettings(true);
        }
        
        setHasCheckedConfig(true);
    }, [settings.firebaseConfig, isLoading, hasCheckedConfig]);

    useEffect(() => {
        localStorage.setItem(STARRED_FIRST_STORAGE, String(showStarredFirst));
    }, [showStarredFirst]);

    const toggleStarredFirst = () => {
        setShowStarredFirst(prev => !prev);
    };

    return (
        <>
            <ToastContainer />
            {CollisionDialogComponent}
            {FileSizeDialogComponent}
            <div className="app-container" {...dragHandlers}>
                <DropZoneOverlay isVisible={isDragging} />
                <div className="d-flex-tight">
                <FileUploader />
                <StarredFirstToggle 
                    showStarredFirst={showStarredFirst}
                    toggleStarredFirst={toggleStarredFirst}
                />
                <SettingsButton 
                    initialOpen={shouldOpenSettings}
                    onOpenChange={setShouldOpenSettings}
                />
                </div>
                <FileList showStarredFirst={showStarredFirst} />
            </div>
        </>
    );
}

export default App;
