import React from "react";
import { X } from "lucide-react";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center overflow-hidden">
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto shadow-2xl transition-transform animate-[slideUp_0.2s_ease-out]">
        {/* Simple handle for bottom sheet drag decoration */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <X size={16} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
