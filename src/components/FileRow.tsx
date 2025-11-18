import { type FC } from "react";
import type { FileMeta } from "./fileTypes";
import "./FileRow.scss";

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

    const getFileIcon = (name: string) => {
        const ext = name.split(".").pop()?.toLowerCase() || "";

        const iconMap: Record<string, { icon: string; className: string }> = {
            "pdf": { icon: "picture_as_pdf", className: "icon-pdf" },
            "doc": { icon: "description", className: "icon-doc" },
            "docx": { icon: "description", className: "icon-doc" },
            "xls": { icon: "grid_on", className: "icon-xls" },
            "xlsx": { icon: "grid_on", className: "icon-xls" },
            "ppt": { icon: "slideshow", className: "icon-ppt" },
            "pptx": { icon: "slideshow", className: "icon-ppt" },
            "txt": { icon: "note", className: "icon-txt" },
            "md": { icon: "article", className: "icon-md" },
            "csv": { icon: "table_chart", className: "icon-csv" },
            "jpg": { icon: "image", className: "icon-img" },
            "jpeg": { icon: "image", className: "icon-img" },
            "png": { icon: "image", className: "icon-img" },
            "gif": { icon: "image", className: "icon-img" },
            "mp3": { icon: "audiotrack", className: "icon-audio" },
            "wav": { icon: "audiotrack", className: "icon-audio" },
            "mp4": { icon: "movie", className: "icon-video" },
            "mov": { icon: "movie", className: "icon-video" },
            "zip": { icon: "folder_zip", className: "icon-archive" },
            "rar": { icon: "folder_zip", className: "icon-archive" },
            "js": { icon: "code", className: "icon-code" },
            "ts": { icon: "code", className: "icon-code" },
            "json": { icon: "code", className: "icon-code" },
            "html": { icon: "language", className: "icon-code" },
            "css": { icon: "style", className: "icon-code" },
            "default": { icon: "insert_drive_file", className: "icon-default" },
        };

        return iconMap[ext] || iconMap["default"];
    };

    const fileIcon = getFileIcon(file.name);

    return (
        <tr
            className={`file-row ${selected ? "selected" : ""}`}
            onClick={e => onRowClick(file.id, e)}
        >
            <td className="col-icon">
                <span className={`material-icons file-thumbnail ${fileIcon.className}`}>
                    {fileIcon.icon}
                </span>
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
