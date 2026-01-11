"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, Edit2, Trash2, Upload, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { teamService, type TeamDeliverable, type DeliverableDeadlineStatus } from "../../../../../../src/lib/services/teamService";
import { toast } from "sonner";
import { SubmitDeliverableModal } from "../../../../../../components/dashboard/student/SubmitDeliverableModal";
import { ViewDeliverableModal } from "../../../../../../components/dashboard/student/ViewDeliverableModal";
import { DeleteDeliverableModal } from "../../../../../../components/dashboard/student/DeleteDeliverableModal";

export default function StudentTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [deadlineStatuses, setDeadlineStatuses] = useState<Record<string, DeliverableDeadlineStatus>>({});
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<TeamDeliverable | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const myTeams = await teamService.getMyTeams();
      if (myTeams.length > 0) {
        setTeam(myTeams[0]);
        const teamDeliverables = await teamService.getTeamDeliverables(myTeams[0].id);
        setDeliverables(teamDeliverables);

        // Load deadline statuses for all deliverables
        const statuses: Record<string, DeliverableDeadlineStatus> = {};
        await Promise.all(
          teamDeliverables.map(async (deliverable) => {
            try {
              const status = await teamService.checkDeadline(deliverable.id);
              statuses[deliverable.id] = status;
            } catch (error) {
              console.error(`Failed to load deadline for ${deliverable.id}:`, error);
            }
          })
        );
        setDeadlineStatuses(statuses);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load deliverables");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: { content: string; contentType: "FILE" | "URL" | "TEXT"; description?: string; file?: File }) => {
    if (!selectedDeliverable || !team) return;

    try {
      setSubmitting(true);

      // For FILE type, we need to upload the file first
      let content = data.content;
      if (data.contentType === "FILE" && data.file) {
        // Upload file using the uploadFileForDeliverable method
        const fileUrl = await teamService.uploadFileForDeliverable(data.file);
        content = fileUrl;
      } else if (data.contentType === "FILE" && !content) {
        throw new Error("Please select a file to upload");
      }

      await teamService.submitDeliverable(selectedDeliverable.id, {
        teamId: team.id,
        content,
        contentType: data.contentType,
        description: data.description,
      });

      toast.success(isUpdate ? "Deliverable updated successfully" : "Deliverable submitted successfully");
      setShowSubmitModal(false);
      setSelectedDeliverable(null);
      setIsUpdate(false);
      loadData();
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error(error?.response?.data?.message || "Deadline has passed. Cannot submit or update.");
      } else {
        toast.error(error?.message || "Failed to submit deliverable");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubmit = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setIsUpdate(false);
    setShowSubmitModal(true);
  };

  const handleOpenUpdate = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setIsUpdate(true);
    setShowSubmitModal(true);
  };

  const handleOpenView = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowViewModal(true);
  };

  const handleOpenDelete = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedDeliverable || !team) return;

    try {
      setDeleting(true);
      await teamService.deleteDeliverable(selectedDeliverable.id, team.id);
      toast.success("Submission deleted successfully");
      setShowDeleteModal(false);
      setSelectedDeliverable(null);
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete submission");
    } finally {
      setDeleting(false);
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
        return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  const getDisplayStatus = (deliverable: TeamDeliverable) => {
    if (deliverable.submissionStatus === "NOT_SUBMITTED") {
      return { text: "Not Submitted", color: "text-slate-500", icon: <AlertCircle size={16} className="text-slate-400" /> };
    }
    // If submitted, show review status
    const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
    switch (reviewStatus) {
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

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderContentPreview = (deliverable: TeamDeliverable) => {
    if (!deliverable.content) {
      return <span className="text-slate-400 italic">No content</span>;
    }

    if (deliverable.contentType === "FILE" || deliverable.contentType === "URL") {
      return (
        <a
          href={deliverable.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1 max-w-xs truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {truncateText(deliverable.content, 50)}
          <ExternalLink size={12} />
        </a>
      );
    }

    if (deliverable.contentType === "TEXT") {
      return (
        <span className="text-slate-700 max-w-md line-clamp-2" title={deliverable.content}>
          {truncateText(deliverable.content, 100)}
        </span>
      );
    }

    // Fallback for legacy fileUrl
    if (deliverable.fileUrl) {
      return (
        <a
          href={deliverable.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-flex items-center gap-1 max-w-xs truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {truncateText(deliverable.fileUrl, 50)}
          <ExternalLink size={12} />
        </a>
      );
    }

    return <span className="text-slate-400 italic">No content</span>;
  };

  if (!team) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">You must be in a team to view deliverables</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Team Deliverables</h1>
        <p className="mt-1 text-sm text-slate-600">
          View required deliverables and submit your team's work.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
          <p className="mt-4 text-sm text-slate-500">Loading deliverables...</p>
        </div>
      ) : deliverables.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No deliverables assigned yet</p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Deliverable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Content Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {deliverables.map((deliverable) => {
                  const isSubmitted = deliverable.submissionStatus === "SUBMITTED" || (deliverable.content && deliverable.content.length > 0);
                  const canSubmit = !deadlineStatuses[deliverable.id]?.passed;
                  const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
                  const canUpdate = isSubmitted && canSubmit && reviewStatus === "PENDING";
                  const canDelete = isSubmitted && canSubmit && (reviewStatus === "PENDING" || reviewStatus === "REJECTED");
                  const deadlineStatus = deadlineStatuses[deliverable.id];
                  const displayStatus = getDisplayStatus(deliverable);

                  return (
                    <tr key={deliverable.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{deliverable.template.title}</h3>
                              {deliverable.template.required && (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 line-clamp-2">{deliverable.template.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          <FileText size={12} />
                          {deliverable.template.contentType}
                        </span>
                      </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {displayStatus.icon}
                        <span className={`text-sm font-medium ${displayStatus.color}`}>
                          {displayStatus.text}
                        </span>
                      </div>
                    </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {deliverable.template.dueDate && (
                            <p className="text-sm text-slate-900">
                              {new Date(deliverable.template.dueDate).toLocaleDateString()}
                            </p>
                          )}
                          {deadlineStatus && (
                            <p className={`text-xs font-medium ${
                              deadlineStatus.passed ? "text-red-600" : "text-emerald-600"
                            }`}>
                              {deadlineStatus.passed ? "Passed" : deadlineStatus.timeRemaining}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-md">
                          {isSubmitted && deliverable.submittedAt && (
                            <p className="text-xs text-slate-500">
                              {new Date(deliverable.submittedAt).toLocaleString()}
                            </p>
                          )}
                          {renderContentPreview(deliverable)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isSubmitted && (
                            <button
                              onClick={() => handleOpenView(deliverable)}
                              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          )}
                          
                          {!isSubmitted && canSubmit && (
                            <button
                              onClick={() => handleOpenSubmit(deliverable)}
                              className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937] transition-colors flex items-center gap-1.5"
                            >
                              <Upload size={14} />
                              Submit
                            </button>
                          )}

                          {canUpdate && (
                            <button
                              onClick={() => handleOpenUpdate(deliverable)}
                              className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                              title="Update"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => handleOpenDelete(deliverable)}
                              className="cursor-pointer rounded-lg border border-red-300 bg-white px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Submission"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}

                          {!canSubmit && !isSubmitted && (
                            <span className="text-xs font-medium text-red-600">Deadline Passed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showSubmitModal && selectedDeliverable && (
        <SubmitDeliverableModal
          deliverable={selectedDeliverable}
          isUpdate={isUpdate}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedDeliverable(null);
            setIsUpdate(false);
          }}
          onSubmit={handleSubmit}
          loading={submitting}
        />
      )}

      {showViewModal && selectedDeliverable && (
        <ViewDeliverableModal
          deliverable={selectedDeliverable}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDeliverable(null);
          }}
        />
      )}

      {showDeleteModal && selectedDeliverable && (
        <DeleteDeliverableModal
          deliverable={selectedDeliverable}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedDeliverable(null);
          }}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  );
}
