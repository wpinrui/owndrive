import { type FC, useState, useEffect } from "react";
import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";
import { StarredFirstToggle } from "./components/StarredFirstToggle";
import { DropZoneOverlay } from "./components/DropZoneOverlay";
import { ToastContainer } from "./components/ToastContainer";
import { useFirebaseStorage } from "./hooks/useFirebaseStorage";
import { getFirestore } from "firebase/firestore";
import { useDragAndDrop } from "./hooks/useDragAndDrop";

const STARRED_FIRST_STORAGE = "fileListStarredFirst";

const App: FC = () => {
    const initialStarredFirst = localStorage.getItem(STARRED_FIRST_STORAGE) === "true";
    const [showStarredFirst, setShowStarredFirst] = useState<boolean>(initialStarredFirst);
    const { storage, app } = useFirebaseStorage();
    const db = app ? getFirestore(app) : null;
    const { isDragging, dragHandlers } = useDragAndDrop(db, storage);

    useEffect(() => {
        localStorage.setItem(STARRED_FIRST_STORAGE, String(showStarredFirst));
    }, [showStarredFirst]);

    const toggleStarredFirst = () => {
        setShowStarredFirst(prev => !prev);
    };

    return (
        <>
            <ToastContainer />
            <div className="app-container" {...dragHandlers}>
                <DropZoneOverlay isVisible={isDragging} />
                <div className="d-flex">
                <FileUploader />
                <StarredFirstToggle 
                    showStarredFirst={showStarredFirst}
                    toggleStarredFirst={toggleStarredFirst}
                /> 
                </div>
                <FileList showStarredFirst={showStarredFirst} />
            </div>
        </>
    );
}

export default App;
