import { type FC } from "react";

type Props = {
    isVisible: boolean;
};

export const DropZoneOverlay: FC<Props> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="drop-zone-overlay">
            <div className="drop-zone-content">
                <span className="material-icons drop-zone-icon">cloud_upload</span>
                <p className="drop-zone-text">Drop file here to upload</p>
            </div>
        </div>
    );
};

