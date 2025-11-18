import { type FC } from "react";
import type { FileMeta } from "./fileTypes";
import "../styling/FileRow.scss";
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

    return (
        <tr
            className={`file-row ${selected ? "selected" : ""}`}
            onClick={e => onRowClick(id, e)}
        >
            <td className="col-icon">
                <span className={`material-icons file-thumbnail ${fileIcon.className}`}>
                    {fileIcon.icon}
                </span>
            </td>
            <td className="col-name">{name}</td>
            <td className="col-type">{fileType}</td>
            <td className="col-size">{formattedSize}</td>
            <td className="col-modified">{lastModifiedDisplay}</td>
            <td className="col-starred">{starred && <span className="star-icon">⭐</span>}</td>
            <td className="col-actions">
                <div className="action-buttons">
                    <button
                        className="action-btn download-btn"
                        onClick={stopProp(onDownload)}
                        title="Download"
                    >
                        ⬇
                    </button>
                    {!starred && (
                        <button
                            className="action-btn delete-btn"
                            onClick={stopProp(onDelete)}
                            title="Delete"
                        >
                            🗑
                        </button>
                    )}
                    <button
                        className="action-btn star-btn"
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