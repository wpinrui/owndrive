import { type FC } from "react";
import './FileList.scss'

interface FileListControlsProps {
    showStarredFirst: boolean;
    toggleStarredFirst: () => void;
}

export const StarredFirstToggle: FC<FileListControlsProps> = ({
    showStarredFirst,
    toggleStarredFirst
}) => {
    return (
        <div className="file-list-controls" >
            <label>
                <input
                    type="checkbox"
                    className="toggle-button-checkbox"
                    checked={showStarredFirst}
                    onChange={toggleStarredFirst}
                />

                {/* The visible button element */}
                <span className="toggle-button-label">
                    {showStarredFirst ?
                        '⭐ Starred Files First' :
                        '🗄️ Default File Order'
                    }
                </span>
            </label>
        </div>
    );
};
