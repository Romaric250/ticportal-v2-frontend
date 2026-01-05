"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, UserPlus } from "lucide-react";
import { teamService, type Team, type TeamJoinRequest } from "../../../src/lib/services/teamService";
import { useAuthStore } from "../../../src/state/auth-store";
import { toast } from "sonner";
import { ConfirmModal } from "./ConfirmModal";

type Props = {
  team: Team;
  onUpdate: () => void;
};

export function PendingRequests({ team, onUpdate }: Props) {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<TeamJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    requestId: string;
    userName: string;
    action: "accept" | "reject";
  }>({
    isOpen: false,
    requestId: "",
    userName: "",
    action: "accept",
  });

  // Check if current user is team lead
  const currentUserMember = team.members?.find((m) => m.userId === user?.id);
  const isTeamLead = currentUserMember?.role === "LEAD";

  useEffect(() => {
    if (!isTeamLead) {
      setLoading(false);
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const teamRequests = await teamService.getTeamJoinRequests(team.id);
        // Only show pending requests
        const pending = teamRequests.filter((r) => r.status === "PENDING");
        setRequests(pending);
      } catch (error) {
        console.error("Error fetching join requests:", error);
        toast.error("Failed to load join requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [team.id, isTeamLead]);

  const handleAccept = async () => {
    if (!confirmAction.requestId) return;

    try {
      setProcessingRequest(confirmAction.requestId);
      await teamService.updateJoinRequest(team.id, confirmAction.requestId, {
        action: "accept",
      });
      toast.success("Join request accepted");
      setConfirmAction({ isOpen: false, requestId: "", userName: "", action: "accept" });
      // Refresh requests and team data
      const teamRequests = await teamService.getTeamJoinRequests(team.id);
      const pending = teamRequests.filter((r) => r.status === "PENDING");
      setRequests(pending);
      onUpdate(); // Refresh team data to show new member
    } catch (error: any) {
      console.error("Error accepting request:", error);
      toast.error(error?.message || "Failed to accept request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async () => {
    if (!confirmAction.requestId) return;

    try {
      setProcessingRequest(confirmAction.requestId);
      await teamService.updateJoinRequest(team.id, confirmAction.requestId, {
        action: "reject",
      });
      toast.success("Join request rejected");
      setConfirmAction({ isOpen: false, requestId: "", userName: "", action: "reject" });
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== confirmAction.requestId));
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      toast.error(error?.message || "Failed to reject request");
    } finally {
      setProcessingRequest(null);
    }
  };

  if (!isTeamLead) {
    return null; // Don't show for non-leads
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[#111827]" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              PENDING REQUESTS
            </h2>
            {requests.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {requests.length}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-500">
            No pending requests
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const userName = request.user
                ? `${request.user.firstName} ${request.user.lastName}`
                : "Unknown User";

              return (
                <div
                  key={request.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
                >
                  {request.user?.profilePhoto ? (
                    <img
                      src={request.user.profilePhoto}
                      alt={userName}
                      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                    {request.user?.email && (
                      <p className="text-xs text-slate-500 truncate">{request.user.email}</p>
                    )}
                    {request.message && (
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {request.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setConfirmAction({
                          isOpen: true,
                          requestId: request.id,
                          userName,
                          action: "accept",
                        })
                      }
                      disabled={processingRequest === request.id}
                      className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={14} />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setConfirmAction({
                          isOpen: true,
                          requestId: request.id,
                          userName,
                          action: "reject",
                        })
                      }
                      disabled={processingRequest === request.id}
                      className="cursor-pointer rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <X size={14} />
                          <span>Reject</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmAction.isOpen && confirmAction.action === "accept"}
        onClose={() => {
          if (!processingRequest) {
            setConfirmAction({ isOpen: false, requestId: "", userName: "", action: "accept" });
          }
        }}
        onConfirm={handleAccept}
        title="Accept Join Request"
        message={`Are you sure you want to accept ${confirmAction.userName}'s request to join the team?`}
        confirmText="Accept"
        variant="default"
        loading={processingRequest === confirmAction.requestId}
      />

      <ConfirmModal
        isOpen={confirmAction.isOpen && confirmAction.action === "reject"}
        onClose={() => {
          if (!processingRequest) {
            setConfirmAction({ isOpen: false, requestId: "", userName: "", action: "reject" });
          }
        }}
        onConfirm={handleReject}
        title="Reject Join Request"
        message={`Are you sure you want to reject ${confirmAction.userName}'s request to join the team?`}
        confirmText="Reject"
        variant="danger"
        loading={processingRequest === confirmAction.requestId}
      />
    </>
  );
}

