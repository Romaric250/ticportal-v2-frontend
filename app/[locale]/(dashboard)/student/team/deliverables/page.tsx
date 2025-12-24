"use client";

import { useState } from "react";
import { Check, Clock, Star, AlertTriangle, Eye, Info, Lock, ChevronDown, Filter } from "lucide-react";
import Link from "next/link";

export default function DeliverablesPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due-date");

  const filters = [
    { id: "all", label: "All", icon: <Check size={14} /> },
    { id: "pending", label: "Pending", icon: <Clock size={14} /> },
    { id: "graded", label: "Graded", icon: <Star size={14} /> },
    { id: "overdue", label: "Overdue", icon: <AlertTriangle size={14} /> },
  ];

  return (
    <div className="space-y-6 text-slate-900">
      {/* Breadcrumbs */}
      <nav className="text-xs text-slate-500">
        <Link href="/student" className="hover:text-slate-700">
          Home
        </Link>
        {" / "}
        <Link href="/student/team" className="hover:text-slate-700">
          My Team
        </Link>
        {" / "}
        <span className="text-slate-900">Deliverables</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Deliverables</h1>
          <p className="mt-2 text-sm text-slate-600">
            Track your team&apos;s submission progress. Keep up the momentum to reach the finals!
          </p>
        </div>

        {/* Overall Progress Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:w-64">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            OVERALL PROGRESS
          </p>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-900">65%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[65%] rounded-full bg-[#111827]" />
            </div>
            <p className="mt-2 text-xs text-[#111827]">Next Deadline: 2 days</p>
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
              className={`cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeFilter === filter.id
                  ? "bg-[#111827] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter.icon}
              <span>{filter.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-[#111827]"
          >
            <option value="due-date">Sort by: Due Date</option>
            <option value="status">Sort by: Status</option>
            <option value="title">Sort by: Title</option>
          </select>
        </div>
      </div>

      {/* Deliverables Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DeliverableCard
          status="graded"
          title="Project Proposal"
          submittedDate="Oct 12"
          description="Initial draft of the team solution outlining the problem statement..."
          actionLabel="View Feedback"
          actionIcon={<Eye size={14} />}
          icon={<GraduationCap size={20} />}
        />
        <DeliverableCard
          status="needs-attention"
          title="Prototype Demo"
          dueDate="2 days"
          isUrgent
          description="A 3-minute video walkthrough of the MVP demonstrating core features..."
          actionLabel="Submit Work"
          actionIcon={<Info size={14} />}
          icon={<Settings size={20} />}
        />
        <DeliverableCard
          status="overdue"
          title="Market Research"
          dueDate="yesterday"
          isOverdue
          description="Detailed survey results and competitor analysis matrix. Require..."
          actionLabel="Late Submission"
          actionIcon={<AlertCircle size={14} />}
          icon={<BarChart size={20} />}
        />
        <DeliverableCard
          status="upcoming"
          title="Final Codebase"
          dueDate="Nov 15"
          description="Complete source code repository link with README documentation..."
          actionLabel="Locked"
          actionIcon={<Lock size={14} />}
          isLocked
          icon={<Code size={20} />}
        />
        <DeliverableCard
          status="graded"
          title="Team Formation"
          submittedDate="Sep 20"
          description="Registration of all team members, roles assignment, and mentor..."
          actionLabel="View Details"
          actionIcon={<Eye size={14} />}
          icon={<Users size={20} />}
        />
        <DeliverableCard
          status="pending"
          title="Pitch Deck"
          dueDate="Nov 05"
          description="The visual presentation slides used during the final pitch to judges."
          actionLabel="Start Draft"
          actionIcon={<Info size={14} />}
          icon={<BarChart size={20} />}
        />
      </div>
    </div>
  );
}

import {
  GraduationCap,
  Settings,
  BarChart,
  Code,
  Users,
  AlertCircle,
} from "lucide-react";

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
      className={`relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm border-l-4 ${config.borderColor}`}
    >
      {/* Status Badge */}
      <div className="mb-3">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${config.className}`}
        >
          {config.label}
        </span>
      </div>

      {/* Icon */}
      <div className="absolute right-4 top-4 text-slate-300">{icon}</div>

      {/* Title */}
      <h3 className="mb-2 pr-12 text-base font-semibold text-slate-900">
        {title}
      </h3>

      {/* Date Info */}
      <div className="mb-3">
        {submittedDate ? (
          <p className="text-xs text-slate-500">Submitted on {submittedDate}</p>
        ) : (
          <p
            className={`text-xs ${
              isOverdue ? "text-red-600" : isUrgent ? "text-red-600" : "text-slate-500"
            }`}
          >
            {isOverdue && <AlertTriangle size={12} className="mr-1 inline" />}
            Due {dueDate}
          </p>
        )}
      </div>

      {/* Description */}
      <p className="mb-4 line-clamp-2 text-xs text-slate-600">{description}</p>

      {/* Action Button */}
      <button
        disabled={isLocked}
        className={`w-full rounded-lg px-4 py-2 text-xs font-semibold transition ${
          isLocked
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : status === "overdue"
            ? "cursor-pointer bg-red-500 text-white hover:bg-red-600"
            : status === "needs-attention" || status === "pending"
            ? "cursor-pointer bg-[#111827] text-white hover:bg-[#1f2937]"
            : "cursor-pointer border border-slate-200 bg-white text-[#111827] hover:bg-slate-50"
        }`}
      >
        <span className="inline-flex items-center gap-1.5">
          {actionIcon}
          <span>{actionLabel}</span>
        </span>
      </button>
    </div>
  );
}

