"use client";

import { Eye, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
import { type TeamDeliverable } from "@/src/lib/services/adminService";

interface DeliverableSubmissionsTabProps {
  deliverables: TeamDeliverable[];
  loading: boolean;
  filters: {
    submissionStatus?: string;
    reviewStatus?: string;
    status?: string;
    hackathon?: string;
    search?: string;
  };
  onFilterChange: (filters: {
    submissionStatus?: string;
    reviewStatus?: string;
    status?: string;
    hackathon?: string;
    search?: string;
  }) => void;
  onView: (deliverable: TeamDeliverable) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
}

export function DeliverableSubmissionsTab({
  deliverables,
  loading,
  filters,
  onFilterChange,
  onView,
  onApprove,
  onReject,
  onDelete,
}: DeliverableSubmissionsTabProps) {
  const getStatusIcon = (reviewStatus: string) => {
    switch (reviewStatus) {
      case "APPROVED":
        return <CheckCircle size={16} className="text-emerald-500" />;
      case "REJECTED":
        return <XCircle size={16} className="text-red-500" />;
      case "PENDING":
        return <Clock size={16} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getDisplayStatus = (deliverable: TeamDeliverable) => {
    if (deliverable.submissionStatus === "NOT_SUBMITTED") {
      return { text: "Not Submitted", color: "text-slate-500", icon: null };
    }
    // If submitted, show review status
    switch (deliverable.reviewStatus) {
      case "APPROVED":
        return { text: "Approved", color: "text-emerald-600", icon: <CheckCircle size={16} className="text-emerald-500" /> };
      case "REJECTED":
        return { text: "Rejected", color: "text-red-600", icon: <XCircle size={16} className="text-red-500" /> };
      case "PENDING":
        return { text: "Pending Review", color: "text-amber-600", icon: <Clock size={16} className="text-amber-500" /> };
      default:
        return { text: "Pending", color: "text-slate-500", icon: <Clock size={16} className="text-slate-400" /> };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by team name, project title..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-4 text-sm focus:border-[#111827] focus:outline-none"
          />
        </div>
        <select
          value={filters.submissionStatus || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, submissionStatus: e.target.value === "ALL" ? undefined : e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option value="ALL">All Submissions</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="NOT_SUBMITTED">Not Submitted</option>
        </select>
        <select
          value={filters.reviewStatus || "ALL"}
          onChange={(e) => onFilterChange({ ...filters, reviewStatus: e.target.value === "ALL" ? undefined : e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option value="ALL">All Review Status</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={filters.hackathon}
          onChange={(e) => onFilterChange({ ...filters, hackathon: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option>All Hackathons</option>
        </select>
      </div>

      {/* Deliverables Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Deliverable
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
                    <p className="mt-2 text-sm text-slate-400">Loading...</p>
                  </td>
                </tr>
              ) : deliverables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                deliverables.map((deliverable) => {
                  const displayStatus = getDisplayStatus(deliverable);
                  const canReview = deliverable.submissionStatus === "SUBMITTED" && deliverable.reviewStatus === "PENDING";
                  
                  return (
                    <tr key={deliverable.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-slate-900">
                            {deliverable.team?.name || deliverable.teamName || "Unknown Team"}
                          </div>
                          {deliverable.projectTitle && (
                            <div className="text-xs text-slate-500 mt-0.5">{deliverable.projectTitle}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {deliverable.template?.title || deliverable.type || "N/A"}
                        </div>
                        {deliverable.template?.description && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {deliverable.template.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {deliverable.submissionStatus === "SUBMITTED" && deliverable.submittedAt ? (
                          <div>
                            <div>{new Date(deliverable.submittedAt).toLocaleDateString()}</div>
                            <div className="text-xs text-slate-400">
                              {new Date(deliverable.submittedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not submitted</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {displayStatus.icon}
                            <span className={`text-sm font-medium ${displayStatus.color}`}>
                              {displayStatus.text}
                            </span>
                          </div>
                          {deliverable.submissionStatus === "SUBMITTED" && deliverable.reviewStatus !== "PENDING" && deliverable.reviewedAt && (
                            <div className="text-xs text-slate-400">
                              Reviewed: {new Date(deliverable.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {deliverable.submissionStatus === "SUBMITTED" && (
                            <button
                              onClick={() => onView(deliverable)}
                              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {canReview && (
                            <>
                              <button
                                onClick={() => onApprove(deliverable.id)}
                                className="cursor-pointer rounded bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt("Rejection reason:");
                                  if (reason) onReject(deliverable.id, reason);
                                }}
                                className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {deliverable.submissionStatus === "SUBMITTED" && (
                            <button
                              onClick={() => onDelete(deliverable.id)}
                              className="cursor-pointer rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

