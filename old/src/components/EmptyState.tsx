import { type FC } from "react";
import styles from "../styling/EmptyState.module.scss";

export const EmptyState: FC = () => (
    <div className={styles.emptyState}>
        <div className={styles.emptyState__content}>
            <div className={styles.emptyState__icon}>📁</div>
            <p className={styles.emptyState__message}>No files uploaded yet</p>
        </div>
    </div>
);
