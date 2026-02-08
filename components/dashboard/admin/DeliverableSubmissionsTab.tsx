"use client";

import { useState } from "react";
import { Eye, CheckCircle, XCircle, Clock, Trash2, Users, Loader2, X } from "lucide-react";
import { type TeamDeliverable } from "@/src/lib/services/adminService";

interface DeliverableSubmissionsTabProps {
  deliverables: TeamDeliverable[];
  loading: boolean;
  templates: any[];
  filters: {
    submissionStatus?: string;
    reviewStatus?: string;
    status?: string;
    hackathon?: string;
    search?: string;
    templateId?: string;
  };
  onFilterChange: (filters: {
    submissionStatus?: string;
    reviewStatus?: string;
    status?: string;
    hackathon?: string;
    search?: string;
    templateId?: string;
  }) => void;
  onView: (deliverable: TeamDeliverable) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onDelete: (id: string) => void;
}

export function DeliverableSubmissionsTab({
  deliverables,
  loading,
  templates,
  filters,
  onFilterChange,
  onView,
  onApprove,
  onReject,
  onDelete,
}: DeliverableSubmissionsTabProps) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<TeamDeliverable | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleRejectClick = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleDeleteClick = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDeleteModal(true);
  };

  const confirmReject = () => {
    if (selectedDeliverable && rejectionReason.trim()) {
      onReject(selectedDeliverable.id, rejectionReason.trim());
      setShowRejectModal(false);
      setSelectedDeliverable(null);
      setRejectionReason("");
    }
  };

  const confirmDelete = () => {
    if (selectedDeliverable) {
      onDelete(selectedDeliverable.id);
      setShowDeleteModal(false);
      setSelectedDeliverable(null);
    }
  };

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
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by team name, project title..."
              value={filters.search || ""}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-4 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <select
            value={filters.submissionStatus || "ALL"}
            onChange={(e) => onFilterChange({ ...filters, submissionStatus: e.target.value === "ALL" ? undefined : e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All Submissions</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="NOT_SUBMITTED">Not Submitted</option>
          </select>
          <select
            value={filters.reviewStatus || "ALL"}
            onChange={(e) => onFilterChange({ ...filters, reviewStatus: e.target.value === "ALL" ? undefined : e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All Review Status</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            value={filters.hackathon || ""}
            onChange={(e) => onFilterChange({ ...filters, hackathon: e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option>All Hackathons</option>
          </select>
          <select
            value={filters.templateId || "ALL"}
            onChange={(e) => onFilterChange({ ...filters, templateId: e.target.value === "ALL" ? undefined : e.target.value })}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="ALL">All Deliverables</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deliverables Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Team
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Deliverable
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 size={28} className="mx-auto animate-spin text-slate-400" />
                    <p className="mt-2 text-sm text-slate-500">Loading submissions...</p>
                  </td>
                </tr>
              ) : deliverables.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-sm font-medium text-slate-500">No submissions found</p>
                    <p className="mt-1 text-xs text-slate-400">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                deliverables.map((deliverable) => {
                  const displayStatus = getDisplayStatus(deliverable);
                  const canReview = deliverable.submissionStatus === "SUBMITTED" && deliverable.reviewStatus === "PENDING";
                  
                  return (
                    <tr key={deliverable.id} className="transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                            <Users size={18} className="text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {deliverable.team?.name || deliverable.teamName || "Unknown Team"}
                            </div>
                            {deliverable.projectTitle && (
                              <div className="mt-0.5 text-xs text-slate-500">{deliverable.projectTitle}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {deliverable.template?.title || deliverable.type || "N/A"}
                        </div>
                        {deliverable.template?.description && (
                          <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            {deliverable.template.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {deliverable.submissionStatus === "SUBMITTED" && deliverable.submittedAt ? (
                          <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1">
                            <span className="text-xs font-medium text-white">
                              {new Date(deliverable.submittedAt).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-white/70">
                              {new Date(deliverable.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                            <Clock size={12} className="text-red-600" />
                            Not Submitted
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {deliverable.submissionStatus === "NOT_SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              <Clock size={12} className="text-red-600" />
                              Not Submitted
                            </span>
                          ) : deliverable.reviewStatus === "APPROVED" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                              <CheckCircle size={12} className="text-emerald-600" />
                              Approved
                            </span>
                          ) : deliverable.reviewStatus === "REJECTED" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              <XCircle size={12} className="text-red-600" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                              <Clock size={12} className="text-amber-600" />
                              Pending Review
                            </span>
                          )}
                          {deliverable.submissionStatus === "SUBMITTED" && deliverable.reviewStatus !== "PENDING" && deliverable.reviewedAt && (
                            <div className="text-xs text-slate-400">
                              Reviewed: {new Date(deliverable.reviewedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {deliverable.submissionStatus === "SUBMITTED" && (
                            <button
                              onClick={() => onView(deliverable)}
                              className="rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          {canReview && (
                            <>
                              <button
                                onClick={() => onApprove(deliverable.id)}
                                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectClick(deliverable)}
                                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {deliverable.submissionStatus === "SUBMITTED" && (
                            <button
                              onClick={() => handleDeleteClick(deliverable)}
                              className="rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800"
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

      {/* Reject Modal */}
      {showRejectModal && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Reject Submission</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedDeliverable(null);
                  setRejectionReason("");
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">Team</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedDeliverable.team?.name || selectedDeliverable.teamName || "Unknown Team"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedDeliverable.template?.title || selectedDeliverable.type || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm transition-colors focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedDeliverable(null);
                    setRejectionReason("");
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim()}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Delete Submission</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDeliverable(null);
                }}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">Team</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedDeliverable.team?.name || selectedDeliverable.teamName || "Unknown Team"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedDeliverable.template?.title || selectedDeliverable.type || "N/A"}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Are you sure you want to delete this submission? This action cannot be undone and will permanently remove the submission from the system.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDeliverable(null);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete Submission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

