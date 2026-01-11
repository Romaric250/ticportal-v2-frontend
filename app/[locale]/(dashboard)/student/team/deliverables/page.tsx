"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { teamService, type TeamDeliverable, type DeliverableDeadlineStatus } from "../../../../../../src/lib/services/teamService";
import { toast } from "sonner";
import { DeliverableCard } from "../../../../../../components/dashboard/student/DeliverableCard";
import { SubmitDeliverableModal } from "../../../../../../components/dashboard/student/SubmitDeliverableModal";

export default function StudentTeamDeliverablesPage() {
  const [deliverables, setDeliverables] = useState<TeamDeliverable[]>([]);
  const [deadlineStatuses, setDeadlineStatuses] = useState<Record<string, DeliverableDeadlineStatus>>({});
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((deliverable) => (
            <DeliverableCard
              key={deliverable.id}
              deliverable={deliverable}
              deadlineStatus={deadlineStatuses[deliverable.id]}
              onSubmit={() => handleOpenSubmit(deliverable)}
              onUpdate={() => handleOpenUpdate(deliverable)}
            />
          ))}
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
    </div>
  );
}
