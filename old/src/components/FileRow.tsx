import { type FC, type MouseEvent } from "react";
import type { FileMeta } from "./fileTypes";
import styles from "../styling/FileRow.module.scss";
import { getFileIcon, formatFileSize } from "./helpers/fileHelpers";

type Props = {
    file: FileMeta;
    selected: boolean;
    onRowClick: (id: string, e: React.MouseEvent) => void;
    onDownload: (file: FileMeta) => void;
    onDelete: (file: FileMeta) => void;
    onToggleStar: (file: FileMeta) => void;
};

export const FileRow: FC<Props> = ({
    file,
    selected,
    onRowClick,
    onDownload,
    onDelete,
    onToggleStar
}) => {
    const { id, name, size, lastModified, starred } = file;

    const fileIcon = getFileIcon(name);
    const formattedSize = formatFileSize(size);
    const lastModifiedDisplay = new Date(lastModified).toLocaleString();
    const fileType = name.split(".").pop()?.toUpperCase() || "-";

    const stopProp = (callback: (f: FileMeta) => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        callback(file);
    };

    const handleDoubleClick = (e: MouseEvent<HTMLTableRowElement>) => {
        e.stopPropagation();
        onDownload(file);
    };

    // Map icon class names from "icon-pdf" to "fileRow__thumbnail--pdf"
    const iconModifier = fileIcon.className.replace('icon-', '');
    const thumbnailClass = `${styles.fileRow__thumbnail} ${styles[`fileRow__thumbnail--${iconModifier}`] || styles["fileRow__thumbnail--default"]}`;

    return (
        <tr
            className={`${styles.fileRow} ${selected ? styles["fileRow--selected"] : ""}`}
            onClick={e => onRowClick(id, e)}
            onDoubleClick={handleDoubleClick}
        >
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--icon"]}`}>
                <span className={`material-icons ${thumbnailClass}`}>
                    {fileIcon.icon}
                </span>
            </td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--name"]}`}>
                <span className={styles.fileRow__fileName}>{name}</span>
            </td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--type"]}`}>{fileType}</td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--size"]}`}>{formattedSize}</td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--modified"]}`}>{lastModifiedDisplay}</td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--starred"]}`}>
                {starred && <span className={styles.fileRow__starIcon}>⭐</span>}
            </td>
            <td className={`${styles.fileRow__cell} ${styles["fileRow__cell--actions"]}`}>
                <div className={styles.fileRow__actionButtons}>
                    <button
                        className={`${styles.fileRow__actionButton} ${styles["fileRow__actionButton--download"]}`}
                        onClick={stopProp(onDownload)}
                        title="Download"
                    >
                        ⬇
                    </button>
                    {!starred && (
                        <button
                            className={`${styles.fileRow__actionButton} ${styles["fileRow__actionButton--delete"]}`}
                            onClick={stopProp(onDelete)}
                            title="Delete"
                        >
                            🗑
                        </button>
                    )}
                    <button
                        className={`${styles.fileRow__actionButton} ${styles["fileRow__actionButton--star"]}`}
                        onClick={stopProp(onToggleStar)}
                        title={starred ? "Unstar" : "Star"}
                    >
                        {starred ? "★" : "☆"}
                    </button>
                </div>
            </td>
        </tr>
    );
};