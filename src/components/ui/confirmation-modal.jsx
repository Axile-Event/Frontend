"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { X, AlertTriangle, Trash2, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

// ============================================
// CONFIRMATION MODAL COMPONENT
// ============================================

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
  },
  warning: {
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  success: {
    icon: CheckCircle,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  info: {
    icon: Info,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    confirmBtn: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  default: {
    icon: AlertCircle,
    iconBg: "bg-muted/50",
    iconColor: "text-muted-foreground",
    confirmBtn: "bg-foreground hover:bg-foreground/90 text-background",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
}) {
  if (!isOpen) return null;

  const config = variantConfig[variant] || variantConfig.default;
  const Icon = config.icon;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-200" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className={cn(
            "absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground",
            "hover:bg-muted/50 hover:text-foreground transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div
            className={cn(
              "w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center",
              config.iconBg
            )}
          >
            <Icon className={cn("w-7 h-7", config.iconColor)} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {description}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 border-border/60"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              className={cn("flex-1 h-11", config.confirmBtn)}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CONFIRMATION MODAL CONTEXT & HOOK
// ============================================

const ConfirmModalContext = createContext(null);

export function ConfirmModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    onConfirm: null,
    loading: false,
  });

  const [resolvePromise, setResolvePromise] = useState(null);

  const confirm = useCallback(
    ({
      title = "Confirm Action",
      description = "Are you sure you want to proceed?",
      confirmText = "Confirm",
      cancelText = "Cancel",
      variant = "default",
    }) => {
      return new Promise((resolve) => {
        setResolvePromise(() => resolve);
        setModalState({
          isOpen: true,
          title,
          description,
          confirmText,
          cancelText,
          variant,
          loading: false,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleConfirm = useCallback(() => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  return (
    <ConfirmModalContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={modalState.title}
        description={modalState.description}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        variant={modalState.variant}
        loading={modalState.loading}
      />
    </ConfirmModalContext.Provider>
  );
}

export function useConfirmModal() {
  const context = useContext(ConfirmModalContext);
  if (!context) {
    throw new Error("useConfirmModal must be used within a ConfirmModalProvider");
  }
  return context;
}
