"use client";

import { GraduationCap, MessageCircle } from "lucide-react";
import type { Team } from "../../../src/lib/services/teamService";

type Props = {
  team: Team;
  onRequestMentorship: () => void;
  onOpenChat: () => void;
  onTeamUpdate: () => void;
};

export function TeamHeader({ team, onRequestMentorship, onOpenChat }: Props) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">{team.name}</h1>
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

