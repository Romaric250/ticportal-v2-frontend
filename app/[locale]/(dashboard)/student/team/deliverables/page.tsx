"use client";

import { useState, useEffect } from "react";
import { FileText, Eye, Edit2, Trash2, Upload, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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
      toast.error("Could not load deliverables. Please refresh the page.");
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

      const reviewStatus = selectedDeliverable.reviewStatus || selectedDeliverable.status || "PENDING";
      const isResubmit = reviewStatus === "REJECTED";
      toast.success(isResubmit ? "Deliverable resubmitted successfully" : (isUpdate ? "Deliverable updated successfully" : "Deliverable submitted successfully"));
      setShowSubmitModal(false);
      setSelectedDeliverable(null);
      setIsUpdate(false);
      loadData();
    } catch (error: any) {
      const msg = error?.message || "";
      if (msg && !msg.includes("status code") && !msg.includes("Request failed")) {
        toast.error(msg);
      } else {
        toast.error("Something went wrong while submitting. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSubmit = (deliverable: TeamDeliverable) => {
    setSelectedDeliverable(deliverable);
    // If reviewStatus is REJECTED, treat it as an update (resubmission)
    const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
    setIsUpdate(reviewStatus === "REJECTED");
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
      toast.error("Could not delete submission. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const getDisplayStatus = (deliverable: TeamDeliverable) => {
    if (deliverable.submissionStatus === "NOT_SUBMITTED") {
      return { text: "Not Submitted", color: "text-red-600", icon: <AlertCircle size={14} className="text-red-500" /> };
    }
    // If submitted, show review status
    const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
    switch (reviewStatus) {
      case "APPROVED":
        return { text: "Approved", color: "text-emerald-600", icon: <CheckCircle size={14} className="text-emerald-500" /> };
      case "REJECTED":
        return { text: "Rejected", color: "text-red-600", icon: <XCircle size={14} className="text-red-500" /> };
      case "PENDING":
        return { text: "Pending Review", color: "text-amber-600", icon: <Clock size={14} className="text-amber-500" /> };
      default:
        return { text: "Pending", color: "text-slate-500", icon: <Clock size={14} className="text-slate-400" /> };
    }
  };

  // Show loading skeleton while verifying team status
  if (loading) {
    return (
      <div className="p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm animate-pulse overflow-hidden">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded-md bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
              <div className="mb-4 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-slate-200" />
                <div className="h-6 w-20 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-9 w-24 rounded-lg bg-slate-200" />
                <div className="h-9 w-9 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Only show "must be in team" after loading is complete
  if (!team) {
    return (
      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-16 px-6 shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <FileText size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">You must be in a team to view deliverables</p>
          <p className="mt-2 text-xs text-slate-500 text-center">Join or create a team first to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 p-5 sm:p-6">
      {deliverables.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <FileText size={28} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">No deliverables assigned yet</p>
          <p className="mt-1 text-xs text-slate-500">Check back later or contact your coordinator</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {deliverables.map((deliverable) => {
            const isSubmitted = deliverable.submissionStatus === "SUBMITTED" || (deliverable.content && deliverable.content.length > 0);
            const canSubmit = !deadlineStatuses[deliverable.id]?.passed;
            const reviewStatus = deliverable.reviewStatus || deliverable.status || "PENDING";
            const canUpdate = isSubmitted && canSubmit && reviewStatus === "PENDING";
            const canResubmit = reviewStatus === "REJECTED" && canSubmit;
            const canDelete = isSubmitted && canSubmit && (reviewStatus === "PENDING" || reviewStatus === "REJECTED");
            const displayStatus = getDisplayStatus(deliverable);
            const statusAccent = displayStatus.text === "Approved" ? "border-l-4 border-l-emerald-500" :
              displayStatus.text === "Rejected" ? "border-l-4 border-l-red-500" :
              displayStatus.text === "Pending Review" ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-slate-300";

            return (
              <div
                key={deliverable.id}
                className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300/80 ${statusAccent}`}
              >
                <div className="mb-3 flex items-center gap-2 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0 flex-1 flex items-center gap-2 overflow-hidden">
                    <h3 className="text-sm font-semibold text-slate-900 truncate" title={deliverable.template.title}>
                      {deliverable.template.title}
                    </h3>
                    {deliverable.template.required && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        Required
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-950 px-2 py-0.5 text-[10px] font-medium text-white">
                    Content type: {deliverable.template.contentType}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    displayStatus.text === "Approved" ? "bg-emerald-50 text-emerald-700" :
                    displayStatus.text === "Rejected" ? "bg-red-50 text-red-700" :
                    displayStatus.text === "Pending Review" ? "bg-amber-50 text-amber-700" :
                    displayStatus.text === "Not Submitted" ? "bg-slate-100 text-slate-600" : "bg-slate-100 text-slate-600"
                  }`}>
                    {displayStatus.icon}
                    {displayStatus.text}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {isSubmitted && (
                    <button
                      onClick={() => handleOpenView(deliverable)}
                      className="cursor-pointer rounded-md bg-slate-900 p-1.5 text-white transition-colors hover:bg-slate-800"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                  )}
                  {canResubmit && (
                    <button
                      onClick={() => handleOpenSubmit(deliverable)}
                      className="cursor-pointer flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      <Upload size={10} />
                      Resubmit
                    </button>
                  )}
                  {!isSubmitted && canSubmit && !canResubmit && (
                    <button
                      onClick={() => handleOpenSubmit(deliverable)}
                      className="cursor-pointer flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-slate-800"
                    >
                      <Upload size={10} />
                      Submit
                    </button>
                  )}
                  {canUpdate && (
                    <button
                      onClick={() => handleOpenUpdate(deliverable)}
                      className="cursor-pointer rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Update"
                    >
                      <Edit2 size={12} />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleOpenDelete(deliverable)}
                      className="cursor-pointer rounded-md border border-red-200 bg-white p-1.5 text-red-600 transition-colors hover:bg-red-50"
                      title="Delete Submission"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                  {!canSubmit && !isSubmitted && (
                    <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">Deadline Passed</span>
                  )}
                </div>
              </div>
            );
          })}
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
