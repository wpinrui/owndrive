import { type FC } from "react";
import type { SortKey, SortOrder } from "./FileList";
import styles from "../styling/FileList.module.scss";

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
        <thead className={styles.fileList__thead}>
            <tr>
                <th className={`${styles.fileList__th} ${styles["fileList__th--icon"]}`}></th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--name"]}`} onClick={() => onSort("name")}>Name{renderSortIndicator("name")}</th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--type"]}`} onClick={() => onSort("type")}>Type{renderSortIndicator("type")}</th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--size"]}`} onClick={() => onSort("size")}>Size{renderSortIndicator("size")}</th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--modified"]}`} onClick={() => onSort("lastModified")}>Last Modified{renderSortIndicator("lastModified")}</th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--starred"]}`} onClick={() => onSort("starred")}>Starred{renderSortIndicator("starred")}</th>
                <th className={`${styles.fileList__th} ${styles["fileList__th--actions"]}`}>Actions</th>
            </tr>
        </thead>
    );
};
