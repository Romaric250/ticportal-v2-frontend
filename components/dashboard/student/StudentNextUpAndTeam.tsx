import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import type { NextUpModule, DashboardTeam } from "@/src/lib/services/dashboardService";
import { parseTipTapToPlainText } from "@/src/utils/parseTipTapContent";

type Props = {
  nextUp: NextUpModule | null;
  team: DashboardTeam | null;
};

const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  } catch {
    return "recently";
  }
};

export function StudentNextUpAndTeam({ nextUp, team }: Props) {
  const router = useRouter();
  const locale = useLocale();

  const handleViewAllModules = () => {
    router.push(`/${locale}/student/learning-path`);
  };

  const handleResumeLearning = () => {
    if (nextUp?.pathId) {
      router.push(`/${locale}/student/learning-path`);
    }
  };

  const handleTeamChat = () => {
    if (team?.id) {
      router.push(`/${locale}/student/team`);
    }
  };

  const handleTeamBoard = () => {
    if (team?.id) {
      router.push(`/${locale}/student/team`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 text-sm font-semibold text-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <span>Next up for you</span>
        <button
          onClick={handleViewAllModules}
          className="cursor-pointer text-left text-xs font-medium text-[#111827] hover:underline sm:text-center"
        >
          View all modules
        </button>
        <span className="hidden text-slate-800 sm:inline">My team</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        {/* Next up card */}
        {nextUp ? (
          <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300 sm:p-5">
            <div className="grid gap-4 md:grid-cols-[220px,minmax(0,1fr)]">
              <div className="relative h-32 overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 sm:h-40">
                {nextUp.thumbnailUrl ? (
                  <img
                    src={nextUp.thumbnailUrl}
                    alt={nextUp.title}
                    className="h-full w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-4xl">📚</div>
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-md">
                  {nextUp.category}
                </span>
              </div>
              <div className="flex flex-col justify-between gap-3 text-sm">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className={`rounded-full px-2 py-0.5 font-semibold text-xs ${
                      nextUp.status === "in_progress" 
                        ? "bg-blue-100 text-blue-700" 
                        : nextUp.status === "completed" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {nextUp.status === "in_progress" ? "In progress" : nextUp.status === "completed" ? "Completed" : "Not started"}
                    </span>
                    {nextUp.lastAccessed && <span>Last accessed {formatTimeAgo(nextUp.lastAccessed)}</span>}
                  </div>
                  <h2 className="text-base font-bold text-slate-900">
                    {nextUp.title.trim()}
                  </h2>
                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                    {parseTipTapToPlainText(nextUp.description, 150)}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleResumeLearning}
                    className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all"
                  >
                    Resume learning
                  </button>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Progress</span>
                      <span className="font-semibold">{nextUp.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-slate-700 transition-all"
                        style={{ width: `${nextUp.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              No active learning module
            </div>
          </div>
        )}

        {/* Team card */}
        {team ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex h-full flex-col justify-between gap-3 rounded-xl bg-slate-50 px-4 py-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#111827] to-slate-500 text-base font-semibold text-white">
                  {team.initials}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-semibold text-slate-900">
                    {team.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {team.phase} · {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {team.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center -space-x-3">
                  {team.members.slice(0, 3).map((member, index) => (
                    <div
                      key={member.id}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-700 sm:h-12 sm:w-12"
                      title={member.name}
                    >
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        member.initials
                      )}
                    </div>
                  ))}
                  {team.members.length > 3 && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-semibold text-slate-600 shadow-sm sm:h-12 sm:w-12">
                      +{team.members.length - 3}
                    </div>
                  )}
                </div>
                <div className="flex flex-row gap-2 text-xs sm:flex-col">
                  <button
                    onClick={handleTeamChat}
                    className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]"
                  >
                    Chat
                  </button>
                  <button
                    onClick={handleTeamBoard}
                    className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 font-semibold text-[#111827] hover:border-[#111827]"
                  >
                    Board
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-center py-8 text-sm text-slate-500">
              No team assigned
            </div>
          </div>
        )}
      </div>
    </>
  );
}


