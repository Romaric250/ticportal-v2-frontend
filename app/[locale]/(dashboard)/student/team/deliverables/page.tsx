"use client";

import { useState } from "react";
import { LocalizedLink } from "@/components/ui/LocalizedLink";
import {
  Check,
  Clock,
  Star,
  AlertTriangle,
  Eye,
  Info,
  Lock,
  Filter,
  GraduationCap,
  Settings,
  BarChart,
  Code,
  Users,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

export default function DeliverablesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due-date");

  const filters = [
    { id: "all", label: "All", icon: <Check size={14} /> },
    { id: "pending", label: "Pending", icon: <Clock size={14} /> },
    { id: "graded", label: "Graded", icon: <Star size={14} /> },
    { id: "overdue", label: "Overdue", icon: <AlertTriangle size={14} /> },
  ];

  // All deliverables data
  const allDeliverables = [
    {
      id: "1",
      status: "graded" as const,
      title: "Project Proposal",
      submittedDate: "Oct 12",
      description: "Initial draft of the team solution outlining the problem statement...",
      actionLabel: "View Feedback",
      actionIcon: <Eye size={14} />,
      icon: <GraduationCap size={24} />,
      iconColor: "text-[#111827]",
    },
    {
      id: "2",
      status: "needs-attention" as const,
      title: "Prototype Demo",
      dueDate: "2 days",
      isUrgent: true,
      description: "A 3-minute video walkthrough of the MVP demonstrating core features...",
      actionLabel: "Submit Work",
      actionIcon: <Info size={14} />,
      icon: <Settings size={24} />,
      iconColor: "text-slate-400",
    },
    {
      id: "3",
      status: "overdue" as const,
      title: "Market Research",
      dueDate: "yesterday",
      isOverdue: true,
      description: "Detailed survey results and competitor analysis matrix. Require...",
      actionLabel: "Late Submission",
      actionIcon: <AlertCircle size={14} />,
      icon: <BarChart size={24} />,
      iconColor: "text-slate-400",
    },
    {
      id: "4",
      status: "upcoming" as const,
      title: "Final Codebase",
      dueDate: "Nov 15",
      description: "Complete source code repository link with README documentation...",
      actionLabel: "Locked",
      actionIcon: <Lock size={14} />,
      isLocked: true,
      icon: <Code size={24} />,
      iconColor: "text-slate-400",
    },
    {
      id: "5",
      status: "graded" as const,
      title: "Team Formation",
      submittedDate: "Sep 20",
      description: "Registration of all team members, roles assignment, and mentor...",
      actionLabel: "View Details",
      actionIcon: <Eye size={14} />,
      icon: <Users size={24} />,
      iconColor: "text-slate-400",
    },
    {
      id: "6",
      status: "pending" as const,
      title: "Pitch Deck",
      dueDate: "Nov 05",
      description: "The visual presentation slides used during the final pitch to judges.",
      actionLabel: "Start Draft",
      actionIcon: <Info size={14} />,
      icon: <BarChart size={24} />,
      iconColor: "text-slate-400",
    },
  ];

  // Filter deliverables based on active filter
  const filteredDeliverables = allDeliverables.filter((deliverable) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "graded") return deliverable.status === "graded";
    if (activeFilter === "pending") 
      return deliverable.status === "pending" || deliverable.status === "needs-attention";
    if (activeFilter === "overdue") return deliverable.status === "overdue";
    return true;
  });

  // Sort deliverables
  const sortedDeliverables = [...filteredDeliverables].sort((a, b) => {
    if (sortBy === "due-date") {
      // Simple date comparison (you might want to improve this)
      if (a.dueDate && b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0;
    }
    if (sortBy === "status") {
      return a.status.localeCompare(b.status);
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="space-y-6 text-slate-900">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-500">
        <LocalizedLink href="/student" className="hover:text-slate-700">
          Home
        </LocalizedLink>
        {" / "}
        <LocalizedLink href="/student/team" className="hover:text-slate-700">
          My Team
        </LocalizedLink>
        {" / "}
        <span className="text-slate-900">Deliverables</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">My Deliverables</h1>
          <p className="mt-2 text-base text-slate-600">
            Track your team&apos;s submission progress. Keep up the momentum to reach the finals!
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm lg:w-72">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            OVERALL PROGRESS
          </p>
          <div className="mt-4">
            <div className="mb-3">
              <span className="text-3xl font-bold text-slate-900">65%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[65%] rounded-full bg-[#111827]" />
            </div>
            <p className="mt-3 text-sm font-medium text-[#111827]">
              Next Deadline: 2 days
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeFilter === filter.id
                  ? "bg-[#111827] text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-500" />
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2 pr-8 text-xs font-medium text-slate-700 outline-none focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            >
              <option value="due-date">Sort by: Due Date</option>
              <option value="status">Sort by: Status</option>
              <option value="title">Sort by: Title</option>
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Deliverables Grid */}
      {sortedDeliverables.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No deliverables found for this filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sortedDeliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.id}
              status={deliverable.status}
              title={deliverable.title}
              submittedDate={deliverable.submittedDate}
              dueDate={deliverable.dueDate}
              isUrgent={deliverable.isUrgent}
              isOverdue={deliverable.isOverdue}
              description={deliverable.description}
              actionLabel={deliverable.actionLabel}
              actionIcon={deliverable.actionIcon}
              icon={deliverable.icon}
              iconColor={deliverable.iconColor}
              isLocked={deliverable.isLocked}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DeliverableCardProps = {
  status: "graded" | "needs-attention" | "overdue" | "upcoming" | "pending";
  title: string;
  submittedDate?: string;
  dueDate?: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
  description: string;
  actionLabel: string;
  actionIcon: React.ReactNode;
  icon: React.ReactNode;
  iconColor?: string;
  isLocked?: boolean;
};

function DeliverableCard({
  status,
  title,
  submittedDate,
  dueDate,
  isUrgent,
  isOverdue,
  description,
  actionLabel,
  actionIcon,
  icon,
  iconColor = "text-slate-300",
  isLocked,
}: DeliverableCardProps) {
  const statusConfig = {
    graded: {
      label: "GRADED",
      className: "bg-slate-100 text-[#111827]",
      borderColor: "border-l-[#111827]",
    },
    "needs-attention": {
      label: "NEEDS ATTENTION",
      className: "bg-amber-50 text-amber-700",
      borderColor: "border-l-amber-500",
    },
    overdue: {
      label: "OVERDUE",
      className: "bg-red-50 text-red-700",
      borderColor: "border-l-red-500",
    },
    upcoming: {
      label: "UPCOMING",
      className: "bg-slate-100 text-slate-600",
      borderColor: "border-l-slate-300",
    },
    pending: {
      label: "PENDING",
      className: "bg-slate-100 text-slate-600",
      borderColor: "border-l-slate-300",
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md border-l-4 ${config.borderColor}`}
    >
      {/* Status Badge */}
      <div className="mb-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${config.className}`}
        >
          {config.label}
        </span>
      </div>

      {/* Icon */}
      <div className={`absolute right-5 top-5 ${iconColor} opacity-60 group-hover:opacity-80 transition-opacity`}>
        {icon}
      </div>

      {/* Title */}
      <h3 className="mb-3 pr-16 text-lg font-bold text-slate-900">
        {title}
      </h3>

      {/* Date Info */}
      <div className="mb-4">
        {submittedDate ? (
          <p className="text-sm text-slate-500">Submitted on {submittedDate}</p>
        ) : (
          <p
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              isOverdue
                ? "text-red-600"
                : isUrgent
                ? "text-red-600"
                : "text-slate-500"
            }`}
          >
            {isOverdue && <AlertTriangle size={14} />}
            Due {dueDate}
          </p>
        )}
      </div>

      {/* Description */}
      <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-600">
        {description}
      </p>

      {/* Action Button */}
      <button
        disabled={isLocked}
        className={`w-full rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
          isLocked
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : status === "overdue"
            ? "cursor-pointer bg-red-500 text-white hover:bg-red-600"
            : status === "needs-attention" || status === "pending"
            ? "cursor-pointer bg-[#111827] text-white hover:bg-[#1f2937]"
            : "cursor-pointer border-2 border-slate-200 bg-white text-[#111827] hover:border-[#111827] hover:bg-slate-50"
        }`}
      >
        <span className="inline-flex items-center justify-center gap-2">
          {actionIcon}
          <span>{actionLabel}</span>
        </span>
      </button>
    </div>
  );
}
