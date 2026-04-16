"use client";

import * as React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons: Record<ToastType, React.ElementType> = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles: Record<ToastType, { icon: string; bg: string; border: string }> = {
    success: {
      icon: "text-green-500",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    error: {
      icon: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20",
    },
    warning: {
      icon: "text-yellow-500",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
    },
    info: {
      icon: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
  };

  const Icon = icons[toast.type];
  const style = styles[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 w-80 p-4 rounded-lg border bg-card shadow-lg animate-in slide-in-from-right-full duration-300",
        style.border
      )}
    >
      <div className={cn("p-1 rounded", style.bg)}>
        <Icon className={cn("h-4 w-4", style.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Utility functions for easy toast creation
export function toast(toast: Omit<Toast, "id">) {
  // This is a placeholder - in production you'd use a global store or event emitter
  console.log("Toast:", toast);
}

toast.success = (title: string, description?: string) => {
  toast({ type: "success", title, description });
};

toast.error = (title: string, description?: string) => {
  toast({ type: "error", title, description });
};

toast.warning = (title: string, description?: string) => {
  toast({ type: "warning", title, description });
};

toast.info = (title: string, description?: string) => {
  toast({ type: "info", title, description });
};