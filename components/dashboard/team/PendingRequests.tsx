"use client";

import { X, Check } from "lucide-react";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
  onUpdate: () => void;
};

export function PendingRequests({ team, onUpdate }: Props) {
  // TODO: Implement pending requests API when available
  // For now, show empty state
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
        PENDING REQUESTS
      </h2>

      <div className="py-4 text-center text-sm text-slate-500">
        No pending requests
      </div>
    </div>
  );
}

