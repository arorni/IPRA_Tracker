"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import clsx from "clsx";

export type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      className={clsx(
        "fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border max-w-sm animate-in slide-in-from-bottom-4 fade-in",
        type === "success"
          ? "bg-white border-green-200 text-green-800"
          : "bg-white border-red-200 text-red-800"
      )}
    >
      {type === "success" ? (
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
