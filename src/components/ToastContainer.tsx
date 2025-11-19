import { type FC } from "react";
import { useToast } from "../contexts/ToastContext";
import "../styling/ToastContainer.scss";

export const ToastContainer: FC = () => {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div 
            className="toast-container"
            style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '400px',
                pointerEvents: 'none' as const,
            }}
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type}`}
                    onClick={() => dismissToast(toast.id)}
                    style={{
                        backgroundColor: '#252526',
                        border: '1px solid #3e3e42',
                        borderLeft: `4px solid ${
                            toast.type === 'success' ? '#4caf50' :
                            toast.type === 'error' ? '#a12d2d' :
                            toast.type === 'info' ? '#0e639c' : '#6b5b0e'
                        }`,
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '300px',
                        maxWidth: '400px',
                        pointerEvents: 'auto' as const,
                        cursor: 'pointer',
                        position: 'relative',
                    }}
                >
                    <div 
                        className="toast-content"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <span 
                            className="toast-icon"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '20px',
                                height: '20px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                flexShrink: 0,
                                color: toast.type === 'success' ? '#4caf50' : 
                                       toast.type === 'error' ? '#a12d2d' :
                                       toast.type === 'info' ? '#0e639c' : '#6b5b0e',
                            }}
                        >
                            {toast.type === "success" && "✓"}
                            {toast.type === "error" && "✕"}
                            {toast.type === "info" && "ℹ"}
                            {toast.type === "loading" && (
                                <span 
                                    className="toast-spinner"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #3e3e42',
                                        borderTopColor: '#6b5b0e',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }}
                                ></span>
                            )}
                        </span>
                        <span 
                            className="toast-message"
                            style={{
                                flex: 1,
                                color: '#e0e0e0',
                                fontSize: '14px',
                                lineHeight: 1.4,
                            }}
                        >
                            {toast.message}
                        </span>
                    </div>
                    {toast.progress !== undefined && (
                        <div 
                            className="toast-progress-bar"
                            style={{
                                width: '100%',
                                height: '4px',
                                backgroundColor: '#2d2d30',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                marginTop: '4px',
                            }}
                        >
                            <div
                                className="toast-progress-fill"
                                style={{ 
                                    width: `${toast.progress}%`,
                                    height: '100%',
                                    backgroundColor: '#0e639c',
                                    transition: 'width 0.3s ease',
                                    borderRadius: '2px',
                                }}
                            />
                        </div>
                    )}
                    {toast.type !== "loading" && (
                        <button
                            className="toast-close"
                            onClick={(e) => {
                                e.stopPropagation();
                                dismissToast(toast.id);
                            }}
                            aria-label="Close"
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'none',
                                border: 'none',
                                color: '#9d9d9d',
                                fontSize: '20px',
                                cursor: 'pointer',
                                padding: '4px',
                                lineHeight: 1,
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '4px',
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

