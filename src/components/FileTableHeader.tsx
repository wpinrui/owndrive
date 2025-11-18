import { type FC } from "react";
import type { SortKey, SortOrder } from "./FileList";

type Props = {
    sortKey: SortKey;
    sortOrder: SortOrder;
    onSort: (key: SortKey) => void;
};

export const FileTableHeader: FC<Props> = ({ sortKey, sortOrder, onSort }) => {
    const renderSortIndicator = (key: SortKey) => {
        if (sortKey !== key) return null;
        return sortOrder === "asc" ? " ▲" : " ▼";
    };

    return (
        <thead>
            <tr>
                <th className="col-icon"></th>
                <th className="col-name" onClick={() => onSort("name")}>Name{renderSortIndicator("name")}</th>
                <th className="col-type" onClick={() => onSort("type")}>Type{renderSortIndicator("type")}</th>
                <th className="col-size" onClick={() => onSort("size")}>Size{renderSortIndicator("size")}</th>
                <th className="col-modified" onClick={() => onSort("lastModified")}>Last Modified{renderSortIndicator("lastModified")}</th>
                <th className="col-starred" onClick={() => onSort("starred")}>Starred{renderSortIndicator("starred")}</th>
                <th className="col-actions">Actions</th>
            </tr>
        </thead>
    );
};
