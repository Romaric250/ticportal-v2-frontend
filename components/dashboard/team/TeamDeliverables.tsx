"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, FileText, Code, Play, Link as LinkIcon, Type } from "lucide-react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import { teamService, type Team, type TeamDeliverable } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
};

export function TeamDeliverables({ team }: Props) {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeliverables = async () => {
      try {
        setLoading(true);
        const data = await teamService.getTeamDeliverables(team.id);
        setDeliverables(data);
      } catch (error) {
        console.error("Failed to load deliverables:", error);
        setDeliverables([]);
      } finally {
        setLoading(false);
      }
    };

    if (team?.id) {
      loadDeliverables();
    }
  }, [team?.id]);

  const getStatus = (deliverable: TeamDeliverable): "done" | "in-progress" | "to-do" => {
    if (!deliverable.content || deliverable.content.length === 0) {
      return "to-do";
    }
    if (deliverable.status === "APPROVED") {
      return "done";
    }
    if (deliverable.status === "PENDING" || deliverable.status === "REJECTED") {
      return "in-progress";
    }
    return "to-do";
  };

  const getProgress = (deliverable: TeamDeliverable): number => {
    const status = getStatus(deliverable);
    if (status === "done") return 100;
    if (status === "in-progress") return 50;
    return 0;
  };

  const getIcon = (contentType: string) => {
    switch (contentType) {
      case "FILE":
        return <FileText size={16} />;
      case "URL":
        return <LinkIcon size={16} />;
      case "TEXT":
        return <Type size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const formatDueDate = (dueDate: string | undefined): string => {
    if (!dueDate) return "No deadline";
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    }
    if (diffDays === 0) {
      return "Today";
    }
    if (diffDays === 1) {
      return "Tomorrow";
    }
    if (diffDays <= 7) {
      return `In ${diffDays} days`;
    }

    // Format as "MMM DD" (e.g., "Oct 15")
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]">
                <Check size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Team Deliverables</h2>
                <p className="text-xs text-slate-500 mt-0.5">Loading...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111827] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]">
                <Check size={18} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Team Deliverables</h2>
                <p className="text-xs text-slate-500 mt-0.5">No deliverables assigned</p>
              </div>
            </div>
            <LocalizedLink
              href="/student/team/deliverables"
              className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View All <ArrowRight size={14} />
            </LocalizedLink>
          </div>
        </div>
        <div className="px-6 py-12 text-center">
          <FileText size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600 mb-1">No deliverables assigned yet</p>
          <p className="text-xs text-slate-500">Check back later for new assignments</p>
        </div>
      </div>
    );
  }

  // Show only the first 5 deliverables
  const displayDeliverables = deliverables.slice(0, 5);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111827]">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Deliverables</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {deliverables.length} {deliverables.length === 1 ? "deliverable" : "deliverables"} assigned
              </p>
            </div>
          </div>
          <LocalizedLink
            href="/student/team/deliverables"
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            View All <ArrowRight size={14} />
          </LocalizedLink>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Deliverable
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                Progress
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayDeliverables.map((deliverable) => {
              const status = getStatus(deliverable);
              const progress = getProgress(deliverable);
              return (
                <DeliverableRow
                  key={deliverable.id}
                  icon={getIcon(deliverable.template.contentType)}
                  milestone={deliverable.template.title}
                  status={status}
                  progress={progress}
                  dueDate={formatDueDate(deliverable.template.dueDate)}
                />
              );
            })}
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
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      iconColor: "text-emerald-600",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-amber-100 text-amber-700 border-amber-200",
      iconColor: "text-amber-600",
    },
    "to-do": {
      label: "Pending",
      className: "bg-slate-100 text-slate-600 border-slate-200",
      iconColor: "text-slate-400",
    },
  };

  const config = statusConfig[status];
  const isOverdue = dueDate.includes("overdue");

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 ${config.iconColor}`}>
            {icon}
          </div>
          <div>
            <span className="font-semibold text-slate-900 text-sm">{milestone}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
        >
          <div className={`h-1.5 w-1.5 rounded-full ${
            status === "done" ? "bg-emerald-600" :
            status === "in-progress" ? "bg-amber-600" :
            "bg-slate-400"
          }`} />
          {config.label}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 max-w-32 overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === "done"
                  ? "bg-emerald-500"
                  : status === "in-progress"
                  ? "bg-amber-500"
                  : "bg-slate-300"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 min-w-[3rem]">{progress}%</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <span className={`text-xs font-medium ${
          isOverdue ? "text-red-600" : "text-slate-600"
        }`}>
          {dueDate}
        </span>
      </td>
    </tr>
  );
}
