import { type FC } from "react";
import type { FileMeta } from "./fileTypes";

type Props = {
    file: FileMeta;
    selected: boolean;
    onRowClick: (id: string, e: React.MouseEvent) => void;
    onDownload: (file: FileMeta) => void;
    onDelete: (file: FileMeta) => void;
    onToggleStar: (file: FileMeta) => void;
};

export const FileRow: FC<Props> = ({ file, selected, onRowClick, onDownload, onDelete, onToggleStar }) => {
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return (
        <tr
            className={`file-row ${selected ? "selected" : ""}`}
            onClick={e => onRowClick(file.id, e)}
        >
            <td className="col-icon">
                <div className="file-thumbnail"></div>
            </td>
            <td className="col-name">{file.name}</td>
            <td className="col-size">{formatFileSize(file.size)}</td>
            <td className="col-modified">{new Date(file.lastModified).toLocaleString()}</td>
            <td className="col-starred">{file.starred && <span className="star-icon">⭐</span>}</td>
            <td className="col-actions">
                <div className="action-buttons">
                    <button
                        className="action-btn download-btn"
                        onClick={e => { e.stopPropagation(); onDownload(file); }}
                        title="Download"
                    >
                        ⬇
                    </button>

                    {!file.starred && (
                        <button
                            className="action-btn delete-btn"
                            onClick={e => { e.stopPropagation(); onDelete(file); }}
                            title="Delete"
                        >
                            🗑
                        </button>
                    )}

                    <button
                        className="action-btn star-btn"
                        onClick={e => { e.stopPropagation(); onToggleStar(file); }}
                        title={file.starred ? "Unstar" : "Star"}
                    >
                        {file.starred ? "★" : "☆"}
                    </button>
                </div>
            </td>
        </tr>
    );
};
