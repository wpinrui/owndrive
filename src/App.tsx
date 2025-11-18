import { type FC, useState, useEffect } from "react";
import FileList from "./components/FileList";
import FileUploader from "./components/FileUploader";
import { StarredFirstToggle } from "./components/StarredFirstToggle";

const STARRED_FIRST_STORAGE = "fileListStarredFirst";

const App: FC = () => {
    const initialStarredFirst = localStorage.getItem(STARRED_FIRST_STORAGE) === "true";
    const [showStarredFirst, setShowStarredFirst] = useState<boolean>(initialStarredFirst);

    useEffect(() => {
        localStorage.setItem(STARRED_FIRST_STORAGE, String(showStarredFirst));
    }, [showStarredFirst]);

    const toggleStarredFirst = () => {
        setShowStarredFirst(prev => !prev);
    };

    return (
        <div className="app-container">
            <div className="d-flex">
                <FileUploader />
                <StarredFirstToggle 
                    showStarredFirst={showStarredFirst}
                    toggleStarredFirst={toggleStarredFirst}
                /> 
            </div>
            <FileList showStarredFirst={showStarredFirst} />
        </div>
    );
}

export default App;
