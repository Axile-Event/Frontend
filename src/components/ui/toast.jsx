"use client";

import React, { createContext, useContext, useState } from "react";
import { Check, X, Sparkles } from "lucide-react";

const ToastContext = createContext({
  showToast: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`
              min-w-[300px] p-4 rounded-xl shadow-lg border flex items-center gap-3 animate-fade-in pointer-events-auto backdrop-blur-sm
              ${
                t.type === "success"
                  ? "bg-white/90 border-green-100 text-green-800"
                  : t.type === "error"
                  ? "bg-white/90 border-red-100 text-red-800"
                  : "bg-white/90 border-blue-100 text-blue-800"
              }
            `}
          >
            <div
              className={`p-1 rounded-full ${
                t.type === "success"
                  ? "bg-green-100"
                  : t.type === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}
            >
              {t.type === "success" ? (
                <Check size={16} />
              ) : t.type === "error" ? (
                <X size={16} />
              ) : (
                <Sparkles size={16} />
              )}
            </div>

            <span className="font-medium text-sm">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
