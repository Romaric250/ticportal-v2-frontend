"use client";

import { useState, useEffect } from "react";
import { TeamHeader } from "../../../../../components/dashboard/team/TeamHeader";
import { TeamMetrics } from "../../../../../components/dashboard/team/TeamMetrics";
import { TeamDeliverables } from "../../../../../components/dashboard/team/TeamDeliverables";
import { TeamMembers } from "../../../../../components/dashboard/team/TeamMembers";
import { PendingRequests } from "../../../../../components/dashboard/team/PendingRequests";
import { AssignedMentor } from "../../../../../components/dashboard/team/AssignedMentor";
import { TeamChatModal } from "../../../../../components/dashboard/team/TeamChatModal";
import { RequestMentorshipModal } from "../../../../../components/dashboard/team/RequestMentorshipModal";
import { AddMemberModal } from "../../../../../components/dashboard/team/AddMemberModal";
import { EditTeamModal } from "../../../../../components/dashboard/team/EditTeamModal";
import { teamService, type Team, type TeamJoinRequest } from "../../../../../src/lib/services/teamService";
import { useAuthStore } from "../../../../../src/state/auth-store";
import { toast } from "sonner";
import { Loader2, Clock, Users } from "lucide-react";

export default function TeamPage() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<TeamJoinRequest[]>([]);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const myTeams = await teamService.getMyTeams();
        if (myTeams.length === 0) {
          // No team, check for pending requests
          const requests = await teamService.getMyJoinRequests();
          setPendingRequests(Array.isArray(requests) ? requests : []);
          setTeam(null);
          return;
        }
        // Get the first team (or you could get by ID if needed)
        // myTeams already includes unreadCount from the API response
        const firstTeam = myTeams[0];
        const teamData = await teamService.getTeamById(firstTeam.id);
        // Use unreadCount from myTeams if available, otherwise fetch it
        if (firstTeam.unreadCount !== undefined) {
          setTeam({ ...teamData, unreadCount: firstTeam.unreadCount });
        } else {
          // Fallback: fetch unread count separately
          try {
            const unreadCount = await teamService.getTeamUnreadCount(teamData.id);
            setTeam({ ...teamData, unreadCount });
          } catch (error) {
            // If unread count fetch fails, use the team data as-is
            console.warn("Failed to fetch unread count:", error);
            setTeam(teamData);
          }
        }
        setPendingRequests([]);
      } catch (error: any) {
        console.error("Error fetching team:", error);
        toast.error("Failed to load team data");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const handleTeamUpdate = async () => {
    if (!team) return;
    try {
      const updatedTeam = await teamService.getTeamById(team.id);
      // Refresh unread count
      try {
        const unreadCount = await teamService.getTeamUnreadCount(team.id);
        setTeam({ ...updatedTeam, unreadCount });
      } catch (error) {
        console.warn("Failed to refresh unread count:", error);
        setTeam(updatedTeam);
      }
    } catch (error) {
      console.error("Error refreshing team:", error);
    }
  };

  // Refresh unread count periodically (every 30 seconds)
  useEffect(() => {
    if (!team) return;

    const refreshUnreadCount = async () => {
      try {
        const unreadCount = await teamService.getTeamUnreadCount(team.id);
        setTeam((prev) => (prev ? { ...prev, unreadCount } : null));
      } catch (error) {
        console.warn("Failed to refresh unread count:", error);
      }
    };

    // Refresh immediately, then every 30 seconds
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [team?.id]);

  // Refresh unread count when chat modal closes (messages were marked as read)
  const handleChatClose = () => {
    setShowChatModal(false);
    // Refresh unread count after a short delay to allow backend to process
    setTimeout(() => {
      if (team) {
        teamService
          .getTeamUnreadCount(team.id)
          .then((unreadCount) => {
            setTeam((prev) => (prev ? { ...prev, unreadCount } : null));
          })
          .catch((error) => {
            console.warn("Failed to refresh unread count after chat close:", error);
          });
      }
    }, 500);
  };

  // Note: We removed the socket listener here to avoid interfering with the chat modal's socket connection
  // Unread count will be refreshed periodically (every 30 seconds) and when chat modal closes

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-6">
        {/* No Team State */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">No Team Yet</h2>
            <p className="text-sm text-slate-600 max-w-md">You're not part of any team yet. Join an existing team or create your own to start collaborating.</p>
          </div>
        </div>

        {/* Pending Join Requests */}
        {pendingRequests.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pending Join Requests</h2>
                <p className="text-xs text-slate-500 mt-0.5">Waiting for team responses</p>
              </div>
              <span className="ml-auto rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {pendingRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-slate-200 bg-white p-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {request.team?.profileImage ? (
                      <img
                        src={request.team.profileImage}
                        alt={request.team.name}
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm">{request.team?.name || "Unknown Team"}</h3>
                      {request.team?.projectTitle && (
                        <p className="mt-1 text-xs text-slate-600">{request.team.projectTitle}</p>
                      )}
                      {request.message && (
                        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{request.message}</p>
                      )}
                      <div className="mt-2.5 flex items-center gap-3 text-xs">
                        <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-amber-700 font-semibold">
                          {request.status}
                        </span>
                        <span className="text-slate-500">
                          Sent: {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingRequests.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mx-auto">
              <Clock className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">You don't have any pending join requests.</p>
            <p className="text-xs text-slate-400 mt-1">Create a team or request to join an existing one.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900">
      <TeamHeader 
        team={team}
        onRequestMentorship={() => setShowMentorshipModal(true)}
        onOpenChat={() => setShowChatModal(true)}
        onTeamUpdate={handleTeamUpdate}
        onEditTeam={() => setShowEditTeamModal(true)}
      />
      <TeamMetrics team={team} />
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Left Column */}
        <div className="space-y-6">
          <TeamDeliverables team={team} />
          <TeamMembers 
            team={team}
            onAddMember={() => setShowAddMemberModal(true)}
            onMemberUpdate={handleTeamUpdate}
          />
          <PendingRequests team={team} onUpdate={handleTeamUpdate} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <AssignedMentor team={team} />
        </div>
      </div>

      {/* Modals */}
      {showMentorshipModal && (
        <RequestMentorshipModal 
          team={team}
          onClose={() => setShowMentorshipModal(false)} 
        />
      )}
      {showAddMemberModal && (
        <AddMemberModal 
          team={team}
          onClose={() => setShowAddMemberModal(false)}
          onMemberAdded={handleTeamUpdate}
        />
      )}
      {showChatModal && (
        <TeamChatModal 
          team={team}
          onClose={handleChatClose} 
        />
      )}
      {showEditTeamModal && team && (
        <EditTeamModal 
          team={team}
          onClose={() => setShowEditTeamModal(false)}
          onTeamUpdated={handleTeamUpdate}
        />
      )}
    </div>
  );
}

