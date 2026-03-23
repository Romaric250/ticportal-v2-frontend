"use client";

import { useState, useEffect } from "react";
import { Check, ArrowRight, FileText, Link as LinkIcon, Type, Upload } from "lucide-react";
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

  const needsSubmission = (d: TeamDeliverable): boolean => {
    const submitted = d.content && d.content.length > 0;
    const reviewStatus = d.reviewStatus || d.status || "PENDING";
    return !submitted || reviewStatus === "REJECTED";
  };

  const getIcon = (contentType: string, size = 14) => {
    switch (contentType) {
      case "FILE":
        return <FileText size={size} />;
      case "URL":
        return <LinkIcon size={size} />;
      case "TEXT":
        return <Type size={size} />;
      default:
        return <FileText size={size} />;
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
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 sm:px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Deliverables</h2>
              <p className="text-xs text-slate-500 mt-0.5">Loading...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
        </div>
      </div>
    );
  }

  if (deliverables.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-4 sm:px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <Check size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Deliverables</h2>
              <p className="text-xs text-slate-500 mt-0.5">No deliverables assigned</p>
            </div>
          </div>
          <LocalizedLink
            href="/student/team/deliverables"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            View All <ArrowRight size={12} />
          </LocalizedLink>
        </div>
        </div>
        <div className="px-5 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <FileText size={24} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">No deliverables assigned yet</p>
        </div>
      </div>
    );
  }

  // Show only the first 6 deliverables (2 rows of 3 on desktop)
  const displayDeliverables = deliverables.slice(0, 6);

  const statusConfig = {
    done: {
      label: "Completed",
      accent: "border-l-emerald-500",
      badge: "bg-emerald-50 text-emerald-700",
    },
    "in-progress": {
      label: "In Progress",
      accent: "border-l-amber-500",
      badge: "bg-amber-50 text-amber-700",
    },
    "to-do": {
      label: "Pending",
      accent: "border-l-slate-300",
      badge: "bg-slate-100 text-slate-600",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden min-w-0">
      <div className="border-b border-slate-100 bg-slate-50/80 px-3 sm:px-4 md:px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <Check size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">Team Deliverables</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {deliverables.length} {deliverables.length === 1 ? "deliverable" : "deliverables"} assigned
              </p>
            </div>
          </div>
          <LocalizedLink
            href="/student/team/deliverables"
            className="inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            View All <ArrowRight size={12} />
          </LocalizedLink>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden p-3 sm:p-4 md:p-5 bg-slate-50/30">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {displayDeliverables.map((deliverable) => {
            const status = getStatus(deliverable);
            const config = statusConfig[status];
            const needsSubmit = needsSubmission(deliverable);
            const dueDate = formatDueDate(deliverable.template.dueDate);
            const isOverdue = dueDate.includes("overdue");

            return (
              <div
                key={deliverable.id}
                className={`min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:shadow-md border-l-4 ${config.accent}`}
              >
                <div className="mb-2 flex items-center gap-2 min-w-0 overflow-hidden">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                    {getIcon(deliverable.template.contentType, 12)}
                  </div>
                  <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
                    <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate" title={deliverable.template.title}>
                      {deliverable.template.title}
                    </h3>
                    {deliverable.template.required && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-1.5 min-w-0">
                  <span className="inline-flex shrink-0 items-center rounded-lg bg-blue-950 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Content type: {deliverable.template.contentType}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}>
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 min-w-0 flex-wrap">
                  <span className={`shrink-0 text-[10px] font-medium ${isOverdue ? "text-red-600" : "text-slate-500"}`}>
                    {dueDate}
                  </span>
                  {needsSubmit ? (
                    <LocalizedLink
                      href="/student/team/deliverables"
                      className="inline-flex shrink-0 items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      <Upload size={10} />
                      Submit
                    </LocalizedLink>
                  ) : (
                    <span className="text-[10px] text-slate-400">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
