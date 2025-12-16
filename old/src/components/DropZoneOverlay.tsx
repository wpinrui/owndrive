import { type FC } from "react";
import styles from "../styling/DropZoneOverlay.module.scss";

type Props = {
    isVisible: boolean;
};

export const DropZoneOverlay: FC<Props> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className={styles.dropZoneOverlay}>
            <div className={styles.dropZoneOverlay__content}>
                <span className={`material-icons ${styles.dropZoneOverlay__icon}`}>cloud_upload</span>
                <p className={styles.dropZoneOverlay__text}>Drop files here to upload</p>
            </div>
        </div>
    );
};

