"use client";

import { useState, useEffect } from "react";
import {
  Rocket,
  Users,
  Trophy,
  Lightbulb,
  Award,
  Eye,
  Heart,
  Share2,
  CheckCircle,
  Circle,
  Lock,
  Code,
  Palette,
  Leaf,
  Loader2,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { portfolioService, type PortfolioData } from "@/src/lib/services/portfolioService";

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
};

const formatHours = (hours: number) => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${Math.round(hours)}h`;
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat().format(num);
};

const getBadgeColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    emerald: "bg-emerald-50 text-emerald-700",
    pink: "bg-pink-50 text-pink-700",
    slate: "bg-slate-50 text-slate-400",
  };
  return colorMap[color] || "bg-slate-50 text-slate-400";
};

const getPhaseIcon = (icon: string, status: string) => {
  const isCompleted = status === "completed";
  const isPending = status === "pending";
  
  if (icon === "check") {
    return <CheckCircle size={20} className={isCompleted ? "text-white" : "text-slate-400"} />;
  }
  if (icon === "users") {
    return <Users size={20} className={isCompleted ? "text-white" : isPending ? "text-slate-400" : "text-slate-700"} />;
  }
  if (icon === "rocket") {
    return <Rocket size={20} className={isCompleted ? "text-white" : isPending ? "text-slate-400" : "text-slate-700"} />;
  }
  if (icon === "trophy") {
    return <Trophy size={20} className={isCompleted ? "text-white" : "text-slate-400"} />;
  }
  return <CheckCircle size={20} className={isCompleted ? "text-white" : "text-slate-400"} />;
};

const getPhaseStatusBadge = (status: string, completedAt?: string) => {
  if (status === "completed" && completedAt) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
        Completed - {formatDate(completedAt)}
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
        In Progress
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
      Pending
    </span>
  );
};

const getPhaseCircleClass = (status: string) => {
  if (status === "completed") {
    return "bg-slate-700";
  }
  if (status === "in_progress") {
    return "border-2 border-slate-700 bg-white";
  }
  return "border-2 border-slate-300 bg-white";
};

export default function StudentPortfolioPage() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      const portfolio = await portfolioService.getPortfolio();
      setData(portfolio);
    } catch (err: any) {
      console.error("Failed to load portfolio data:", err);
      setError(err?.response?.data?.message || "Failed to load portfolio data");
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
          <p className="text-sm text-slate-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-sm font-medium text-red-600">{error || "Failed to load portfolio"}</p>
          <button
            onClick={loadPortfolioData}
            className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { profile, hackathonJourney, featuredProject, certifications, badges, mentorFeedback, skills } = data;

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">My Portfolio</h1>
            <p className="text-xs text-slate-500 mt-0.5">Showcasing your achievements & journey</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-900 hover:text-white hover:shadow-lg">
            <Share2 size={16} className="transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">Share Portfolio</span>
          </button>
        </div>
      </div>

      {/* Portfolio Content - for PDF export */}
      <div id="portfolio-content" className="space-y-6">
        {/* Profile Header - Hero Section */}
        <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 shadow-xl sm:p-8">
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gradient-to-br from-slate-900/10 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gradient-to-tr from-slate-900/10 to-transparent blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />
          
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 blur-lg opacity-30"></div>
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-slate-900/10"
                  />
                ) : (
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold border-4 border-white shadow-2xl ring-4 ring-slate-900/10">
                    {profile.initials}
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1 rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 border-2 border-white px-3 py-1 shadow-xl">
                  <Trophy className="h-3 w-3 text-white" />
                  <span className="text-[10px] font-bold text-white">Level {profile.level}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="mb-2">
                  <h2 className="text-2xl sm:text-3xl font-bold truncate bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{profile.name}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    {profile.grade ? `Grade ${profile.grade}` : ""}{profile.grade && profile.school ? " · " : ""}{profile.school || ""}
                  </p>
                </div>
                {profile.bio && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 line-clamp-2">{profile.bio}</p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="group/stat flex items-center gap-2.5 rounded-xl bg-white border-2 border-slate-200 px-3.5 py-2.5 shadow-sm hover:border-slate-900 hover:shadow-md transition-all">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex-shrink-0 shadow-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total XP</p>
                      <p className="text-sm font-bold text-slate-900">{formatNumber(profile.totalXP)}</p>
                    </div>
                  </div>
                  <div className="group/stat flex items-center gap-2.5 rounded-xl bg-white border-2 border-slate-200 px-3.5 py-2.5 shadow-sm hover:border-slate-900 hover:shadow-md transition-all">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex-shrink-0 shadow-md">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Global Rank</p>
                      <p className="text-sm font-bold text-slate-900">#{profile.globalRank}</p>
                    </div>
                  </div>
                  <div className="group/stat flex items-center gap-2.5 rounded-xl bg-white border-2 border-slate-200 px-3.5 py-2.5 shadow-sm hover:border-slate-900 hover:shadow-md transition-all">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex-shrink-0 shadow-md">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Hours</p>
                      <p className="text-sm font-bold text-slate-900">{formatHours(profile.hoursLogged)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hackathon Journey */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Hackathon Journey</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your path to innovation</p>
                </div>
              </div>
            </div>
            <div className="relative space-y-6">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200" />
              
              {hackathonJourney.map((phase, index) => {
                const isLast = index === hackathonJourney.length - 1;
                const isCompleted = phase.status === "completed";
                return (
                  <div key={phase.id} className="relative flex gap-4 group/item">
                    <div className="flex flex-col items-center z-10">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all group-hover/item:scale-110 ${
                        isCompleted 
                          ? "bg-gradient-to-br from-slate-900 to-slate-700 ring-4 ring-slate-900/20" 
                          : phase.status === "in_progress"
                          ? "bg-white border-2 border-slate-900 ring-4 ring-slate-900/10"
                          : "bg-white border-2 border-slate-300 ring-2 ring-slate-200"
                      }`}>
                        {getPhaseIcon(phase.icon, phase.status)}
                      </div>
                      {!isLast && <div className="mt-2 h-16 w-0.5 bg-gradient-to-b from-slate-300 to-slate-200" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{phase.phase}</span>
                        {getPhaseStatusBadge(phase.status, phase.completedAt)}
                      </div>
                      <p className="mb-3 text-sm leading-relaxed text-slate-600">{phase.description}</p>
                      {phase.tags && phase.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {phase.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="rounded-lg bg-gradient-to-r from-slate-900 to-slate-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {phase.teamMembers && phase.teamMembers.length > 0 && (
                        <div className="mb-3 flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <div className="flex -space-x-2">
                            {phase.teamMembers.map((member) => (
                              <div
                                key={member.id}
                                className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-700 shadow-md hover:z-10 hover:scale-110 transition-transform"
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
                          </div>
                        </div>
                      )}
                      {phase.status === "in_progress" && phase.progress > 0 && (
                        <>
                          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-slate-900 to-slate-700 transition-all shadow-sm"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs font-medium text-slate-500">{phase.progress}% complete</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Project */}
          {featuredProject ? (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-0 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
                      <Lightbulb className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Featured Project</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Your standout work</p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="group/image relative h-48 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 overflow-hidden shadow-xl">
                    {featuredProject.thumbnailUrl || featuredProject.imageUrl ? (
                      <img
                        src={featuredProject.thumbnailUrl || featuredProject.imageUrl}
                        alt={featuredProject.title}
                        className="h-full w-full object-cover transition-transform group-hover/image:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                        <Code className="h-16 w-16 text-white/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-1 text-[11px] font-bold text-slate-900 shadow-lg">
                      {featuredProject.category}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{featuredProject.title}</h3>
                      <p className="text-sm leading-relaxed text-slate-600">{featuredProject.description}</p>
                    </div>
                    <div className="flex items-center gap-5 text-sm text-slate-600">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                        <Eye className="h-4 w-4 text-slate-700" />
                        <span className="font-bold text-slate-900">{formatNumber(featuredProject.views)}</span>
                        <span className="text-xs text-slate-500">Views</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
                        <Heart className="h-4 w-4 text-slate-700" />
                        <span className="font-bold text-slate-900">{formatNumber(featuredProject.likes)}</span>
                        <span className="text-xs text-slate-500">Likes</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button className="group/btn cursor-pointer rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        View Case Study
                        <ChevronRight className="inline-block h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                      </button>
                      {featuredProject.tags.map((tag, index) => (
                        <span key={index} className="rounded-lg bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
                  <Lightbulb className="h-5 w-5 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Featured Project</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200">
                  <Code className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No featured project yet</p>
                <p className="text-xs text-slate-400 mt-1">Complete a project to feature it here</p>
              </div>
            </div>
          )}

          {/* Certifications */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Certifications</h2>
            </div>
            {certifications.length > 0 ? (
              <div className="space-y-3">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3.5">
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {cert.icon === "check" ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 flex-shrink-0">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 flex-shrink-0">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-slate-900">{cert.title}</h3>
                        <p className="mt-0.5 text-[10px] text-slate-500 uppercase tracking-wide">Issued by {cert.issuer}</p>
                        <p className="mt-1 text-[11px] text-slate-600">{cert.description}</p>
                      </div>
                    </div>
                    {cert.certificateUrl && (
                      <button className="cursor-pointer w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-900 hover:bg-slate-50 transition whitespace-nowrap">
                        View Certificate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GraduationCap className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500">No certifications yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trophy Case */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Trophy Case</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your badges & awards</p>
                </div>
              </div>
              <button className="cursor-pointer text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors">
                VIEW ALL
              </button>
            </div>
            {badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className={`group/badge relative flex flex-col items-center gap-2 rounded-xl p-3.5 text-[10px] font-semibold transition-all hover:scale-110 hover:z-10 ${
                      badge.locked 
                        ? "bg-slate-100 text-slate-500 border-2 border-slate-200" 
                        : `${getBadgeColorClass(badge.color)} border-2 border-transparent hover:border-slate-900 shadow-sm`
                    }`}
                    title={badge.name}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md ${
                      badge.locked ? "bg-slate-200" : "bg-gradient-to-br from-slate-900 to-slate-700"
                    }`}>
                      <Trophy className={`h-5 w-5 ${badge.locked ? "text-slate-400" : "text-white"}`} />
                    </div>
                    <span className="text-center leading-tight px-1">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Trophy className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No badges yet</p>
                <p className="text-xs text-slate-400 mt-1">Earn badges by completing milestones</p>
              </div>
            )}
          </div>

          {/* Mentor Feedback */}
          {mentorFeedback.length > 0 ? (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Mentor Feedback</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Words from your mentors</p>
                </div>
              </div>
              <div className="space-y-4">
                {mentorFeedback.map((feedback) => (
                  <div key={feedback.id} className="group/feedback relative rounded-xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm hover:border-slate-900 hover:shadow-md transition-all">
                    <div className="absolute top-3 left-3 text-4xl text-slate-900/5 font-serif">&quot;</div>
                    <p className="relative mb-4 pl-6 text-sm leading-relaxed text-slate-700 italic">&quot;{feedback.feedback}&quot;</p>
                    <div className="flex items-center gap-3 border-t border-slate-200 pt-3">
                      {feedback.mentor.avatarUrl ? (
                        <img
                          src={feedback.mentor.avatarUrl}
                          alt={feedback.mentor.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-sm">
                          {feedback.mentor.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{feedback.mentor.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {feedback.mentor.title}{feedback.mentor.company ? `, ${feedback.mentor.company}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
                  <MessageSquare className="h-5 w-5 text-slate-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Mentor Feedback</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No mentor feedback yet</p>
                <p className="text-xs text-slate-400 mt-1">Receive feedback from mentors here</p>
              </div>
            </div>
          )}

          {/* Core Skills */}
          {skills.length > 0 ? (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Core Skills</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Your expertise areas</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="group/skill inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-default"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200">
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Core Skills</h2>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-500">No skills added yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your skills to showcase expertise</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      {/* End of portfolio-content div */}
    </div>
  );
}
