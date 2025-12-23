"use client";

import { useSocketConnection } from "../../src/lib/socket";

export function ConnectionStatus() {
  const { status } = useSocketConnection();

  const color =
    status === "connected"
      ? "bg-emerald-500"
      : status === "connecting"
      ? "bg-amber-400"
      : "bg-rose-500";

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-200">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="capitalize">{status}</span>
    </div>
  );
}


