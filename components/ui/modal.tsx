"use client";

import type { ReactNode } from "react";
import { cn } from "../../src/utils/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** `dark` — light card with black header strip; use inner sections for black panels */
  variant?: "default" | "light" | "dark";
};

export function Modal({ open, onClose, title, children, className, variant = "default" }: ModalProps) {
  if (!open) return null;

  if (variant === "dark") {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={cn(
            "flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl",
            className
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-black bg-black px-5 py-4">
            {title && <h2 className="text-base font-semibold tracking-tight text-white">{title}</h2>}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto shrink-0 rounded-md px-2 py-1 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-5 pb-5 pt-4 text-slate-800">{children}</div>
        </div>
      </div>
    );
  }

  if (variant === "light") {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className={cn(
            "flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl",
            className
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto shrink-0 rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              Close
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="text-sm font-semibold text-slate-100">{title}</h2>}
          <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:text-slate-100">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
