"use client";

import { Users, Plus, X } from "lucide-react";
import { useState } from "react";
import { teamService, type Team, type TeamMember } from "../../../src/lib/services/teamService";
import { useAuthStore } from "../../../src/state/auth-store";
import { toast } from "sonner";
import { ConfirmModal } from "./ConfirmModal";

type Props = {
  team: Team;
  onAddMember: () => void;
  onMemberUpdate: () => void;
};

export function TeamMembers({ team, onAddMember, onMemberUpdate }: Props) {
  const { user } = useAuthStore();
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    isLeaving: boolean;
  }>({
    isOpen: false,
    memberId: "",
    memberName: "",
    isLeaving: false,
  });
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    newRole: "MEMBER" | "LEAD";
  }>({
    isOpen: false,
    memberId: "",
    memberName: "",
    newRole: "MEMBER",
  });
  
  // Check if current user is team lead
  const currentUserMember = team.members?.find((m) => m.userId === user?.id);
  const isTeamLead = currentUserMember?.role === "LEAD";

  const handleRemoveClick = (memberId: string, memberName: string, isLeaving: boolean) => {
    setConfirmRemove({
      isOpen: true,
      memberId,
      memberName,
      isLeaving,
    });
  };

  const handleRemoveConfirm = async () => {
    try {
      setRemovingMember(confirmRemove.memberId);
      await teamService.removeMember(team.id, confirmRemove.memberId);
      toast.success(confirmRemove.isLeaving ? "You have left the team" : "Member removed successfully");
      setConfirmRemove({ isOpen: false, memberId: "", memberName: "", isLeaving: false });
      onMemberUpdate();
    } catch (error: any) {
      console.error("Error removing member:", error);
      toast.error(error?.message || "Failed to remove member");
    } finally {
      setRemovingMember(null);
    }
  };

  const handleRoleChangeClick = (memberId: string, memberName: string, currentRole: "MEMBER" | "LEAD") => {
    const newRole = currentRole === "MEMBER" ? "LEAD" : "MEMBER";
    setConfirmRoleChange({
      isOpen: true,
      memberId,
      memberName,
      newRole,
    });
  };

  const handleRoleChangeConfirm = async () => {
    try {
      setUpdatingRole(confirmRoleChange.memberId);
      await teamService.updateMemberRole(team.id, confirmRoleChange.memberId, {
        role: confirmRoleChange.newRole,
      });
      toast.success(
        confirmRoleChange.newRole === "LEAD"
          ? "Member promoted to team lead"
          : "Member demoted to regular member"
      );
      setConfirmRoleChange({ isOpen: false, memberId: "", memberName: "", newRole: "MEMBER" });
      onMemberUpdate();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast.error(error?.message || "Failed to update role");
    } finally {
      setUpdatingRole(null);
    }
  };

  if (!team.members || team.members.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
          </div>
          {isTeamLead && (
            <button
              onClick={onAddMember}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all"
            >
              <Plus size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">No members yet</p>
        </div>
      </div>
    );
  }

  return (
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all">
        <div className="relative mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
              <p className="text-xs text-slate-500 mt-0.5">{team.members.length} {team.members.length === 1 ? "member" : "members"}</p>
            </div>
            <span className="ml-2 rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
              {team.members.length}
            </span>
          </div>
          {isTeamLead && (
            <button
              onClick={onAddMember}
              className="group/add cursor-pointer rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all"
            >
              <Plus size={16} className="transition-transform group-hover/add:rotate-90" />
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
            onRemove={handleRemoveClick}
            onUpdateRole={handleRoleChangeClick}
            removing={removingMember === member.id}
          />
        ))}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, memberId: "", memberName: "", isLeaving: false })}
        onConfirm={handleRemoveConfirm}
        title={confirmRemove.isLeaving ? "Leave Team" : "Remove Member"}
        message={
          confirmRemove.isLeaving
            ? "Are you sure you want to leave this team? You will need to be re-invited to rejoin."
            : `Are you sure you want to remove ${confirmRemove.memberName} from the team? This action cannot be undone.`
        }
        confirmText={confirmRemove.isLeaving ? "Leave Team" : "Remove Member"}
        variant="danger"
        loading={removingMember === confirmRemove.memberId}
      />

      <ConfirmModal
        isOpen={confirmRoleChange.isOpen}
        onClose={() => {
          if (!updatingRole) {
            setConfirmRoleChange({ isOpen: false, memberId: "", memberName: "", newRole: "MEMBER" });
          }
        }}
        onConfirm={handleRoleChangeConfirm}
        title={confirmRoleChange.newRole === "LEAD" ? "Promote to Team Lead" : "Demote to Member"}
        message={
          confirmRoleChange.newRole === "LEAD"
            ? `Are you sure you want to promote ${confirmRoleChange.memberName} to team lead? They will have full control over the team.`
            : `Are you sure you want to demote ${confirmRoleChange.memberName} from team lead to regular member?`
        }
        confirmText={confirmRoleChange.newRole === "LEAD" ? "Promote" : "Demote"}
        variant="default"
        loading={updatingRole === confirmRoleChange.memberId}
      />
    </div>
  );
}

type MemberCardProps = {
  member: TeamMember;
  isTeamLead: boolean;
  isCurrentUser: boolean;
  onRemove: (memberId: string, memberName: string, isLeaving: boolean) => void;
  onUpdateRole: (memberId: string, memberName: string, currentRole: "MEMBER" | "LEAD") => void;
  removing: boolean;
};

function MemberCard({ member, isTeamLead, isCurrentUser, onRemove, onUpdateRole, removing }: MemberCardProps) {
  const memberName = member.user
    ? `${member.user.firstName} ${member.user.lastName}`
    : "Unknown User";
  const isLead = member.role === "LEAD";
  const canRemove = isTeamLead && !isCurrentUser; // Team leads can remove others, members can remove themselves

  return (
    <div className="group/item flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50 transition-colors">
      {member.user?.profilePhoto ? (
        <img
          src={member.user.profilePhoto}
          alt={memberName}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover border border-slate-200"
        />
      ) : (
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold border border-slate-200">
          {memberName.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-slate-900 truncate">{memberName}</p>
          {isLead && (
            <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
              Lead
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <span>{isLead ? "Team Lead" : "Member"}</span>
        </div>
      </div>
      {canRemove && (
        <div className="flex items-center gap-2">
          {isTeamLead && !isCurrentUser && (
            <button
              onClick={() => onUpdateRole(member.id, memberName, member.role)}
              className="cursor-pointer rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              title={isLead ? "Remove lead role" : "Make team lead"}
            >
              {isLead ? "Demote" : "Promote"}
            </button>
          )}
          <button
            onClick={() => onRemove(member.id, memberName, false)}
            disabled={removing}
            className="cursor-pointer rounded-lg p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
            title="Remove member"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {isCurrentUser && !isTeamLead && (
        <button
          onClick={() => onRemove(member.id, memberName, true)}
          disabled={removing}
          className="cursor-pointer rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:border-red-500 hover:bg-red-50 disabled:opacity-50 transition-all"
        >
          Leave
        </button>
      )}
    </div>
  );
}

