"use client";

import { GraduationCap, MessageCircle, Settings, Users } from "lucide-react";
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {team.profileImage ? (
            <img
              src={team.profileImage}
              alt={team.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 flex-shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-slate-200 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
              <Users size={24} className="text-slate-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900 truncate">{team.name}</h1>
              {isTeamLead && (
                <button
                  onClick={onEditTeam}
                  className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 flex-shrink-0"
                  title="Edit Team Information"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          {team.description || team.projectTitle || "No description available"}
        </p>
        {team.projectTitle && (
          <p className="text-xs text-slate-500">Project: {team.projectTitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenChat}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-slate-50"
        >
          <MessageCircle size={16} />
          <span>Team Chat</span>
        </button>
        <button
          onClick={onRequestMentorship}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
        >
          <GraduationCap size={16} />
          <span>Request Mentorship</span>
        </button>
      </div>
    </div>
  );
}

