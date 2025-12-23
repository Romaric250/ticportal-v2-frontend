"use client";

import type { ReactNode } from "react";
import { cn } from "../../src/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-sm font-semibold text-slate-100">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-100"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}


