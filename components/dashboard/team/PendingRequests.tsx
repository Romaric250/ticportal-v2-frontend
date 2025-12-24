import { X, Check } from "lucide-react";

export function PendingRequests() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
        PENDING REQUESTS
      </h2>

      <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-200" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Alex Rivera</p>
            <p className="text-xs text-slate-500">
              Requested to join as Data Analyst
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="cursor-pointer rounded-full p-1.5 text-red-500 hover:bg-red-50">
            <X size={18} />
          </button>
          <button className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937]">
            <Check size={14} />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
}

