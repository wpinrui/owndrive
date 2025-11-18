import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "loading";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    progress?: number; // 0-100 for progress indication
    duration?: number; // Auto-dismiss duration in ms (0 = no auto-dismiss)
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type: ToastType, options?: { progress?: number; duration?: number }) => string;
    updateToast: (id: string, updates: Partial<Omit<Toast, "id">>) => void;
    dismissToast: (id: string) => void;
    dismissAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (
            message: string,
            type: ToastType,
            options?: { progress?: number; duration?: number }
        ): string => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            const toast: Toast = {
                id,
                message,
                type,
                progress: options?.progress,
                duration: options?.duration ?? (type === "error" ? 5000 : type === "loading" ? 0 : 3000),
            };

            setToasts((prev) => {
                const newToasts = [...prev, toast];
                console.log("ToastContext: Adding toast", toast.id, "Total toasts:", newToasts.length);
                return newToasts;
            });

            // Auto-dismiss if duration is set
            if (toast.duration && toast.duration > 0) {
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                }, toast.duration);
            }

            return id;
        },
        []
    );

    const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
        setToasts((prev) =>
            prev.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast))
        );
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return (
        <ToastContext.Provider
            value={{
                toasts,
                showToast,
                updateToast,
                dismissToast,
                dismissAllToasts,
            }}
        >
            {children}
        </ToastContext.Provider>
    );
};

