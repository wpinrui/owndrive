// EmptyState.tsx
import { type FC } from "react";

export const EmptyState: FC = () => (
    <div className="file-list-empty">
        <div className="empty-state">
            <div className="empty-icon">📁</div>
            <p>No files uploaded yet</p>
        </div>
    </div>
);
