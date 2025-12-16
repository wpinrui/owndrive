import { type FC } from "react";
import { useToast } from "../contexts/ToastContext";
import styles from "../styling/ToastContainer.module.scss";

export const ToastContainer: FC = () => {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className={styles.toastContainer}>
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[`toast--${toast.type}`]}`}
                    onClick={() => dismissToast(toast.id)}
                >
                    <div className={styles.toast__content}>
                        <span className={`${styles.toast__icon} ${styles[`toast__icon--${toast.type}`]}`}>
                            {toast.type === "success" && "✓"}
                            {toast.type === "error" && "✕"}
                            {toast.type === "info" && "ℹ"}
                            {toast.type === "loading" && (
                                <span className={styles.toast__spinner}></span>
                            )}
                        </span>
                        <span className={styles.toast__message}>
                            {toast.message}
                        </span>
                    </div>
                    {toast.progress !== undefined && (
                        <div className={styles.toast__progressBar}>
                            <div
                                className={styles.toast__progressFill}
                                style={{ width: `${toast.progress}%` }}
                            />
                        </div>
                    )}
                    {toast.type !== "loading" && (
                        <button
                            className={styles.toast__close}
                            onClick={(e) => {
                                e.stopPropagation();
                                dismissToast(toast.id);
                            }}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

