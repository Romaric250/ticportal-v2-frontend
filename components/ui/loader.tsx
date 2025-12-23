"use client";

type Props = {
  label?: string;
};

export function Loader({ label }: Props) {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-300">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-[#111827]" />
      {label && <span>{label}</span>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-800/80 ${className ?? ""}`}
    />
  );
}


