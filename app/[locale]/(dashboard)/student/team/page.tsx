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
import { teamService, type Team } from "../../../../../src/lib/services/teamService";
import { useAuthStore } from "../../../../../src/state/auth-store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function TeamPage() {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const myTeams = await teamService.getMyTeams();
        if (myTeams.length === 0) {
          // No team, redirect or show message
          toast.error("You are not part of any team");
          return;
        }
        // Get the first team (or you could get by ID if needed)
        const teamData = await teamService.getTeamById(myTeams[0].id);
        setTeam(teamData);
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
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-slate-600">You are not part of any team yet.</p>
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
    </div>
  );
}

