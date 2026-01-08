"use client";

import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { type TeamDeliverable } from "../../../../src/lib/services/adminService";

interface DeliverableSubmissionsTabProps {
  deliverables: TeamDeliverable[];
  loading: boolean;
  filters: {
    status: string;
    hackathon: string;
    search: string;
  };
  onFilterChange: (filters: { status: string; hackathon: string; search: string }) => void;
  onView: (deliverable: TeamDeliverable) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

export function DeliverableSubmissionsTab({
  deliverables,
  loading,
  filters,
  onFilterChange,
  onView,
  onApprove,
  onReject,
}: DeliverableSubmissionsTabProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
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
          value={filters.status}
          onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
        >
          <option>All Statuses</option>
          <option>PENDING</option>
          <option>APPROVED</option>
          <option>REJECTED</option>
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
                deliverables.map((deliverable) => (
                  <tr key={deliverable.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{deliverable.teamName}</div>
                      <div className="text-xs text-slate-500">{deliverable.projectTitle}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{deliverable.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(deliverable.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(deliverable.status)}
                        <span className="text-sm text-slate-700">{deliverable.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onView(deliverable)}
                          className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                        {deliverable.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => onApprove(deliverable.id)}
                              className="cursor-pointer rounded bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                const reason = prompt("Rejection reason:");
                                if (reason) onReject(deliverable.id, reason);
                              }}
                              className="cursor-pointer rounded bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

