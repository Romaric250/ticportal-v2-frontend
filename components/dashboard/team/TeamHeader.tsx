"use client";

import { GraduationCap, MessageCircle, Settings, Users, ChevronRight } from "lucide-react";
import { useAuthStore } from "../../../src/state/auth-store";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
  onRequestMentorship: () => void;
  onOpenChat: () => void;
  onTeamUpdate: () => void;
  onEditTeam: () => void;
};

export function TeamHeader({ team, onRequestMentorship, onOpenChat, onEditTeam }: Props) {
  const { user } = useAuthStore();
  
  // Check if current user is a team lead
  const isTeamLead = team.members?.some(
    (member) => member.userId === user?.id && member.role === "LEAD"
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            {team.profileImage ? (
              <img
                src={team.profileImage}
                alt={team.name}
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-slate-900 flex items-center justify-center text-white text-lg sm:text-xl font-bold border-2 border-slate-200">
                <Users className="h-8 w-8 sm:h-9 sm:w-9" />
              </div>
            )}
            {isTeamLead && (
              <div className="absolute -bottom-1 -right-1 rounded-lg bg-slate-900 border border-slate-900 px-2 py-0.5 shadow-sm">
                <span className="text-[9px] font-bold text-white">Lead</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold truncate text-slate-900">{team.name}</h1>
              {isTeamLead && (
                <button
                  onClick={onEditTeam}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all flex-shrink-0"
                  title="Edit Team Information"
                >
                  <Settings size={16} />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-1">
              {team.description || team.projectTitle || "No description available"}
            </p>
            {team.projectTitle && team.description && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="rounded-lg bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {team.projectTitle}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={onOpenChat}
            className="relative inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-all"
          >
            <MessageCircle size={16} />
            <span>Team Chat</span>
            {team.unreadCount !== undefined && team.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {team.unreadCount > 99 ? "99+" : team.unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onRequestMentorship}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-all"
          >
            <GraduationCap size={16} />
            <span>Request Mentorship</span>
          </button>
        </div>
      </div>
    </div>
  );
}

