"use client";

import { Check, Code, Play, ArrowRight, FileText } from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
};

export function TeamDeliverables({ team }: Props) {

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check size={18} className="text-[#111827]" />
          <h2 className="text-sm font-semibold text-slate-900">
            Team Deliverables
          </h2>
        </div>
        <LocalizedLink
          href="/student/team/deliverables"
          className="cursor-pointer inline-flex items-center gap-1 text-xs font-medium text-[#111827] hover:underline"
        >
          View All <ArrowRight size={12} />
        </LocalizedLink>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                MILESTONE
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                STATUS
              </th>
              <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                PROGRESS
              </th>
              <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                DUE DATE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <DeliverableRow
              icon={<FileText size={16} />}
              milestone="Project Proposal"
              status="done"
              progress={100}
              dueDate="Oct 15"
            />
            <DeliverableRow
              icon={<Code size={16} />}
              milestone="MVP Code"
              status="in-progress"
              progress={65}
              dueDate="Oct 25"
            />
            <DeliverableRow
              icon={<Play size={16} />}
              milestone="Final Pitch Deck"
              status="to-do"
              progress={8}
              dueDate="Nov 1"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

type DeliverableRowProps = {
  icon: React.ReactNode;
  milestone: string;
  status: "done" | "in-progress" | "to-do";
  progress: number;
  dueDate: string;
};

function DeliverableRow({
  icon,
  milestone,
  status,
  progress,
  dueDate,
}: DeliverableRowProps) {
  const statusConfig = {
    done: {
      label: "Done",
      className: "bg-slate-100 text-[#111827]",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-amber-50 text-amber-700",
    },
    "to-do": {
      label: "To Do",
      className: "bg-slate-50 text-slate-500",
    },
  };

  const config = statusConfig[status];

  return (
    <tr className="hover:bg-slate-50">
      <td className="py-4">
        <div className="flex items-center gap-2">
          <div className="text-slate-500">{icon}</div>
          <span className="font-medium text-slate-900">{milestone}</span>
        </div>
      </td>
      <td className="py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${config.className}`}
        >
          {config.label}
        </span>
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full ${
                status === "done" || status === "in-progress"
                  ? "bg-[#111827]"
                  : "bg-slate-300"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-600">{progress}%</span>
        </div>
      </td>
      <td className="py-4 text-right text-xs text-slate-600">{dueDate}</td>
    </tr>
  );
}

