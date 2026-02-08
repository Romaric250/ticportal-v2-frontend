import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BookOpen, Users, MessageSquare, LayoutDashboard, ChevronRight, Play, Clock } from "lucide-react";
import type { NextUpModule, DashboardTeam } from "@/src/lib/services/dashboardService";

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
      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-slate-900" />
          <span className="text-sm font-bold text-slate-900">Next Up</span>
        </div>
        <button
          onClick={handleViewAllModules}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
        >
          View all modules
          <ChevronRight className="h-3 w-3" />
        </button>
        <div className="hidden items-center gap-1.5 sm:flex">
          <Users className="h-4 w-4 text-slate-900" />
          <span className="text-sm font-bold text-slate-900">My Team</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)]">
        {/* Next up card */}
        {nextUp ? (
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-slate-300">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 md:w-48 md:flex-shrink-0">
                {nextUp.thumbnailUrl ? (
                  <img
                    src={nextUp.thumbnailUrl}
                    alt={nextUp.title}
                    className="h-full w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white/80" />
                  </div>
                )}
                <span className="absolute left-3 top-3 rounded-lg bg-white/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 shadow-md">
                  {nextUp.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      nextUp.status === "in_progress" 
                        ? "bg-blue-50 text-blue-700" 
                        : nextUp.status === "completed" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-slate-100 text-slate-700"
                    }`}>
                      {nextUp.status === "in_progress" ? "In Progress" : nextUp.status === "completed" ? "Completed" : "Not Started"}
                    </span>
                    {nextUp.lastAccessed && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(nextUp.lastAccessed)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {nextUp.title.trim()}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {nextUp.pathName} · {nextUp.modulesCompleted}/{nextUp.totalModules} modules
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Progress</span>
                    <span className="font-bold text-slate-900">{nextUp.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{ width: `${nextUp.progress}%` }}
                    />
                  </div>
                  <button
                    onClick={handleResumeLearning}
                    className="group/btn flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-slate-800"
                  >
                    <Play className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    Resume Learning
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center gap-2 text-center">
              <BookOpen className="h-8 w-8 text-slate-400" />
              <p className="text-sm text-slate-500">No active learning module</p>
            </div>
          </div>
        )}

        {/* Team card */}
        {team ? (
          <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-slate-300 sm:p-5">
            <div className="flex h-full flex-col justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-sm">
                    {team.initials}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-xs font-bold text-slate-900">
                      {team.name}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      {team.phase} · {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                  {team.description}
                </p>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center -space-x-1.5">
                    {team.members.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-700 shadow-sm"
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
                    {team.members.length > 4 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-semibold text-white shadow-sm">
                        +{team.members.length - 4}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={handleTeamChat}
                    className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-50"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Chat
                  </button>
                  <button
                    onClick={handleTeamBoard}
                    className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition-all hover:border-slate-900 hover:bg-slate-50"
                  >
                    <LayoutDashboard className="h-3 w-3" />
                    Board
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Users className="h-6 w-6 text-slate-400" />
              <p className="text-xs text-slate-500">No team assigned</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


