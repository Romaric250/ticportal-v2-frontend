"use client";

import { Users, Plus, Crown } from "lucide-react";
import { useState } from "react";
import { teamService, type Team, type TeamMember } from "../../../src/lib/services/teamService";
import { useAuthStore } from "../../../src/state/auth-store";
import { toast } from "sonner";
import { X } from "lucide-react";

type Props = {
  team: Team;
  onAddMember: () => void;
  onMemberUpdate: () => void;
};

export function TeamMembers({ team, onAddMember, onMemberUpdate }: Props) {
  const { user } = useAuthStore();
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  
  // Check if current user is team lead
  const currentUserMember = team.members?.find((m) => m.userId === user?.id);
  const isTeamLead = currentUserMember?.role === "LEAD";

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      setRemovingMember(memberId);
      await teamService.removeMember(team.id, memberId);
      toast.success("Member removed successfully");
      onMemberUpdate();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error?.message || "Failed to remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: "MEMBER" | "LEAD") => {
    try {
      await teamService.updateMemberRole(team.id, memberId, { role: newRole });
      toast.success("Member role updated successfully");
      onMemberUpdate();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error?.message || "Failed to update role");
    }
  };

  if (!team.members || team.members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#111827]" />
            <h2 className="text-sm font-semibold text-slate-900">Members</h2>
          </div>
          {isTeamLead && (
            <button
              onClick={onAddMember}
              className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
        <p className="py-4 text-center text-sm text-slate-500">No members yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#111827]" />
          <h2 className="text-sm font-semibold text-slate-900">Members</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {team.members.length}
          </span>
        </div>
        {isTeamLead && (
          <button
            onClick={onAddMember}
            className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {team.members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            isTeamLead={isTeamLead}
            isCurrentUser={member.userId === user?.id}
            onRemove={handleRemoveMember}
            onUpdateRole={handleUpdateRole}
            removing={removingMember === member.id}
          />
        ))}
      </div>
    </div>
  );
}

type MemberCardProps = {
  member: TeamMember;
  isTeamLead: boolean;
  isCurrentUser: boolean;
  onRemove: (memberId: string, memberName: string) => void;
  onUpdateRole: (memberId: string, newRole: "MEMBER" | "LEAD") => void;
  removing: boolean;
};

function MemberCard({ member, isTeamLead, isCurrentUser, onRemove, onUpdateRole, removing }: MemberCardProps) {
  const memberName = member.user
    ? `${member.user.firstName} ${member.user.lastName}`
    : "Unknown User";
  const isLead = member.role === "LEAD";
  const canRemove = isTeamLead && !isCurrentUser; // Team leads can remove others, members can remove themselves

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
      {member.user?.profilePhoto ? (
        <img
          src={member.user.profilePhoto}
          alt={memberName}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
          {memberName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{memberName}</p>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          {isLead && <Crown size={14} className="text-amber-500" />}
          <span>{isLead ? "Team Lead" : "Member"}</span>
        </div>
      </div>
      {canRemove && (
        <div className="flex items-center gap-2">
          {isTeamLead && !isCurrentUser && (
            <button
              onClick={() => onUpdateRole(member.id, isLead ? "MEMBER" : "LEAD")}
              className="cursor-pointer text-xs text-slate-600 hover:text-slate-900"
              title={isLead ? "Remove lead role" : "Make team lead"}
            >
              {isLead ? "Demote" : "Promote"}
            </button>
          )}
          <button
            onClick={() => onRemove(member.id, memberName)}
            disabled={removing}
            className="cursor-pointer rounded-full p-1 text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Remove member"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {isCurrentUser && !isTeamLead && (
        <button
          onClick={() => onRemove(member.id, memberName)}
          disabled={removing}
          className="cursor-pointer text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Leave
        </button>
      )}
    </div>
  );
}

