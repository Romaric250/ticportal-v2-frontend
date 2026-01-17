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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Portfolio</h1>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-400 transition-all">
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Portfolio Content - for PDF export */}
      <div id="portfolio-content" className="space-y-6 bg-white p-6 sm:p-8">
        {/* Profile Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-xl sm:text-2xl font-bold border-2 border-slate-200">
                    {profile.initials}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white border border-slate-200 px-2 py-0.5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-700">Level {profile.level} {profile.levelTitle}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold truncate text-slate-900">{profile.name}</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  {profile.grade ? `Grade ${profile.grade}` : ""}{profile.grade && profile.school ? ", " : ""}{profile.school || ""}
                </p>
                {profile.bio && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{profile.bio}</p>
                )}
                <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                      <Circle size={16} className="fill-slate-600 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-500">TOTAL XP</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{formatNumber(profile.totalXP)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                      <Trophy size={16} className="text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-500">GLOBAL RANK</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">#{profile.globalRank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 flex-shrink-0">
                      <Circle size={16} className="fill-slate-600 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-500">HOURS</p>
                      <p className="text-xs sm:text-sm font-bold text-slate-900">{formatHours(profile.hoursLogged)}</p>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6 flex items-center gap-2">
              <Rocket size={20} className="text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-900">Hackathon Journey</h2>
            </div>
            <div className="space-y-6">
              {hackathonJourney.map((phase, index) => {
                const isLast = index === hackathonJourney.length - 1;
                return (
                  <div key={phase.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getPhaseCircleClass(phase.status)}`}>
                        {getPhaseIcon(phase.icon, phase.status)}
                      </div>
                      {!isLast && <div className="mt-2 h-16 w-px bg-slate-200" />}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{phase.phase}</span>
                        {getPhaseStatusBadge(phase.status, phase.completedAt)}
                      </div>
                      <p className="mb-2 text-sm text-slate-600">{phase.description}</p>
                      {phase.tags && phase.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {phase.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {phase.teamMembers && phase.teamMembers.length > 0 && (
                        <div className="mt-2 flex gap-2">
                          {phase.teamMembers.map((member) => (
                            <div
                              key={member.id}
                              className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700"
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
                      )}
                      {phase.status === "in_progress" && phase.progress > 0 && (
                        <>
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#111827] transition-all"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{phase.progress}% complete</p>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-4 sm:mb-6 flex items-center gap-2">
                <Lightbulb size={20} className="text-[#111827]" />
                <h2 className="text-lg font-semibold text-slate-900">Featured Project</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
                <div className="relative h-48 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                  {featuredProject.thumbnailUrl || featuredProject.imageUrl ? (
                    <img
                      src={featuredProject.thumbnailUrl || featuredProject.imageUrl}
                      alt={featuredProject.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-32 w-24 rounded-lg border-2 border-blue-300 bg-white/80 p-2">
                        <div className="h-full w-full rounded bg-gradient-to-b from-blue-200 via-blue-100 to-emerald-100" />
                      </div>
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                    {featuredProject.category}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{featuredProject.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{featuredProject.description}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Eye size={16} />
                      <span className="font-semibold">{formatNumber(featuredProject.views)} Views</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart size={16} />
                      <span className="font-semibold">{formatNumber(featuredProject.likes)} Likes</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition">
                      View Case Study
                    </button>
                    {featuredProject.tags.map((tag, index) => (
                      <span key={index} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <div className="mb-4 sm:mb-6 flex items-center gap-2">
                <Lightbulb size={20} className="text-[#111827]" />
                <h2 className="text-lg font-semibold text-slate-900">Featured Project</h2>
              </div>
              <p className="text-sm text-slate-500 py-8 text-center">No featured project yet</p>
            </div>
          )}

          {/* Certifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6 flex items-center gap-2">
              <Award size={20} className="text-[#111827]" />
              <h2 className="text-lg font-semibold text-slate-900">Certifications</h2>
            </div>
            {certifications.length > 0 ? (
              <div className="space-y-4">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      {cert.icon === "check" ? (
                        <CheckCircle size={20} className="sm:w-6 sm:h-6 text-[#111827] flex-shrink-0" />
                      ) : (
                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
                          <Trophy size={16} className="sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-slate-900">{cert.title}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">ISSUED BY {cert.issuer}</p>
                        <p className="mt-1 text-xs text-slate-600">{cert.description}</p>
                      </div>
                    </div>
                    {cert.certificateUrl && (
                      <button className="cursor-pointer w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition whitespace-nowrap">
                        View Certificate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No certifications yet</p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Trophy Case */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Trophy Case</h2>
              <button className="cursor-pointer text-xs font-semibold text-[#111827] hover:underline">
                VIEW ALL
              </button>
            </div>
            {badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {badges.slice(0, 6).map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex flex-col items-center gap-2 rounded-full p-4 text-[10px] font-semibold ${
                      badge.locked ? "bg-slate-100 text-slate-500" : getBadgeColorClass(badge.color)
                    }`}
                    title={badge.name}
                  >
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-center leading-tight">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-8 text-center">No badges yet</p>
            )}
          </div>

          {/* Mentor Feedback */}
          {mentorFeedback.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Mentor Feedback</h2>
              {mentorFeedback.map((feedback) => (
                <div key={feedback.id} className="mb-4 last:mb-0">
                  <p className="mb-4 text-sm leading-relaxed text-slate-600">&quot;{feedback.feedback}&quot;</p>
                  <div className="flex items-center gap-3">
                    {feedback.mentor.avatarUrl ? (
                      <img
                        src={feedback.mentor.avatarUrl}
                        alt={feedback.mentor.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-semibold text-slate-700">
                        {feedback.mentor.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{feedback.mentor.name}</p>
                      <p className="text-xs text-slate-500">
                        {feedback.mentor.title}{feedback.mentor.company ? `, ${feedback.mentor.company}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Mentor Feedback</h2>
              <p className="text-sm text-slate-500 py-4 text-center">No mentor feedback yet</p>
            </div>
          )}

          {/* Core Skills */}
          {skills.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Core Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Core Skills</h2>
              <p className="text-sm text-slate-500 py-4 text-center">No skills added yet</p>
            </div>
          )}
        </div>
      </div>
      </div>
      {/* End of portfolio-content div */}
    </div>
  );
}
