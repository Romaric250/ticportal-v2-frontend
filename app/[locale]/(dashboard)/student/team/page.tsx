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
        const teamData = await teamService.getTeamById(myTeams[0].id);
        setTeam(teamData);
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
      setTeam(updatedTeam);
    } catch (error) {
      console.error("Error refreshing team:", error);
    }
  };

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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users size={20} className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">My Team Status</h2>
          </div>
          <p className="text-slate-600">You are not part of any team yet.</p>
        </div>

        {/* Pending Join Requests */}
        {pendingRequests.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Pending Join Requests</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {pendingRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start gap-4">
                    {request.team?.profileImage ? (
                      <img
                        src={request.team.profileImage}
                        alt={request.team.name}
                        className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <Users size={24} className="text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900">{request.team?.name || "Unknown Team"}</h3>
                      {request.team?.projectTitle && (
                        <p className="mt-1 text-sm text-slate-600">{request.team.projectTitle}</p>
                      )}
                      {request.message && (
                        <p className="mt-2 text-sm text-slate-500">{request.message}</p>
                      )}
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <span>Status: <span className="font-semibold text-amber-600">{request.status}</span></span>
                        <span>
                          Sent: {new Date(request.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        {request.status === "PENDING" ? "Pending" : request.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pendingRequests.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <p className="text-slate-500">You don't have any pending join requests.</p>
            <p className="text-sm text-slate-400 mt-2">Create a team or request to join an existing one.</p>
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
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
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
        <div>
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
          onClose={() => setShowChatModal(false)} 
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

