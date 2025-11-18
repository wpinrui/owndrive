import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";

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
    const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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
                duration: options?.duration ?? (type === "loading" ? 0 : 4000),
            };

            setToasts((prev) => [...prev, toast]);

            // Auto-dismiss if duration is set
            if (toast.duration && toast.duration > 0) {
                const timeout = setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                    timeoutRefs.current.delete(id);
                }, toast.duration);
                timeoutRefs.current.set(id, timeout);
            }

            return id;
        },
        []
    );

    const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, "id">>) => {
        setToasts((prev) => {
            const existingToast = prev.find((t) => t.id === id);
            if (!existingToast) return prev;

            const updatedToast = { ...existingToast, ...updates };
            
            // If duration is being updated to a positive value, set up timeout
            if (updates.duration !== undefined && updates.duration > 0) {
                // Clear any existing timeout for this toast
                const existingTimeout = timeoutRefs.current.get(id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                }
                
                // Set up new timeout
                const timeout = setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== id));
                    timeoutRefs.current.delete(id);
                }, updates.duration);
                timeoutRefs.current.set(id, timeout);
            } else if (updates.duration === 0) {
                // If duration is set to 0, clear any existing timeout
                const existingTimeout = timeoutRefs.current.get(id);
                if (existingTimeout) {
                    clearTimeout(existingTimeout);
                    timeoutRefs.current.delete(id);
                }
            }

            return prev.map((toast) => (toast.id === id ? updatedToast : toast));
        });
    }, []);

    const dismissToast = useCallback((id: string) => {
        // Clear timeout if it exists
        const timeout = timeoutRefs.current.get(id);
        if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(id);
        }
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        // Clear all timeouts
        timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
        timeoutRefs.current.clear();
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

