"use client";

import { Users, Plus, Crown, X } from "lucide-react";
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
              onClick={() => onUpdateRole(member.id, memberName, member.role)}
              className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937] transition"
              title={isLead ? "Remove lead role" : "Make team lead"}
            >
              {isLead ? "Demote" : "Promote"}
            </button>
          )}
          <button
            onClick={() => onRemove(member.id, memberName, false)}
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
          onClick={() => onRemove(member.id, memberName, true)}
          disabled={removing}
          className="cursor-pointer text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          Leave
        </button>
      )}
    </div>
  );
}

