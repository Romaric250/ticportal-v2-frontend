"use client";

import {
  Rocket,
  Users,
  Trophy,
  Lightbulb,
  Award,
  Eye,
  Heart,
  Share2,
  Download,
  CheckCircle,
  Circle,
  Lock,
  Code,
  Palette,
  Leaf,
} from "lucide-react";

export default function StudentPortfolioPage() {
  return (
    <div className="space-y-6">
      {/* Profile Header - Dark Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-slate-800 p-4 sm:p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
                <div className="absolute -bottom-1 -right-1 rounded-full bg-white px-2 py-0.5">
                  <span className="text-[10px] font-bold text-[#111827]">Level 3 Finalist</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">Jane Doe</h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-300">Grade 11, Lincoln High School</p>
                <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-amber-500/20 flex-shrink-0">
                      <Circle size={14} className="sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">TOTAL XP</p>
                      <p className="text-xs sm:text-sm font-bold">4,250</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-500/20 flex-shrink-0">
                      <Trophy size={14} className="sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">GLOBAL RANK</p>
                      <p className="text-xs sm:text-sm font-bold">#42</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-slate-500/20 flex-shrink-0">
                      <Circle size={14} className="sm:w-4 sm:h-4 fill-slate-400 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-slate-400">HOURS</p>
                      <p className="text-xs sm:text-sm font-bold">124h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm">
                <Share2 size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Share Portfolio</span>
                <span className="sm:hidden">Share</span>
              </button>
              <button className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 transition backdrop-blur-sm">
                <Download size={14} className="sm:w-4 sm:h-4" />
                <span>Resume</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Hackathon Journey */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Rocket size={20} className="text-[#111827]" />
              <h2 className="text-lg font-semibold text-slate-900">Hackathon Journey</h2>
            </div>
            <div className="space-y-6">
              {/* Bootcamp Phase */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827]">
                    <CheckCircle size={20} className="text-white" />
                  </div>
                  <div className="mt-2 h-16 w-px bg-slate-200" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Bootcamp Phase</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#111827]">
                      Completed - Oct 22
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-slate-600">
                    Completed 5 core modules on Design Thinking and Problem Identification.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Design Thinking
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Ideation
                    </span>
                  </div>
                </div>
              </div>

              {/* Team Formation */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827]">
                    <Users size={20} className="text-white" />
                  </div>
                  <div className="mt-2 h-16 w-px bg-slate-200" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Team Formation</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#111827]">
                      Completed - Nov 05
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-slate-600">
                    Formed &apos;Team Hydro&apos; with 3 peers. Defined roles and project roadmap.
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Summit Finalist */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#111827] bg-white">
                    <Rocket size={20} className="text-[#111827]" />
                  </div>
                  <div className="mt-2 h-16 w-px bg-slate-200" />
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Summit Finalist</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#111827]">
                      In Progress
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    Developing MVP and Pitch Deck. Preparing for final presentation to judges.
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[65%] rounded-full bg-[#111827]" />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">65% complete</p>
                </div>
              </div>

              {/* Final Awards */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-white">
                    <Trophy size={20} className="text-slate-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">Final Awards</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                      Pending
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">The big day. Presentation and scoring.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Project */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6 flex items-center gap-2">
              <Lightbulb size={20} className="text-[#111827]" />
              <h2 className="text-lg font-semibold text-slate-900">Featured Project</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
              <div className="relative h-48 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-32 w-24 rounded-lg border-2 border-blue-300 bg-white/80 p-2">
                    <div className="h-full w-full rounded bg-gradient-to-b from-blue-200 via-blue-100 to-emerald-100" />
                  </div>
                </div>
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                  Environment
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Eco-Water Filter System</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    A low-cost, biodegradable filtration system designed for rural communities. Uses
                    locally sourced materials like coconut charcoal and sand to filter 99.9% of
                    pathogens.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Eye size={16} />
                    <span className="font-semibold">1.2K Views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart size={16} />
                    <span className="font-semibold">234 Likes</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition">
                    View Case Study
                  </button>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Environment
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    Hardware
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-4 sm:mb-6 flex items-center gap-2">
              <Award size={20} className="text-[#111827]" />
              <h2 className="text-lg font-semibold text-slate-900">Certifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-[#111827] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Entrepreneurship 101</h3>
                    <p className="mt-0.5 text-xs text-slate-500">ISSUED BY TIC SUMMIT</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Fundamental concepts of business modeling and value proposition design.
                    </p>
                  </div>
                </div>
                <button className="cursor-pointer w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition whitespace-nowrap">
                  View Certificate
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-purple-100 flex-shrink-0">
                    <Trophy size={16} className="sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">Top Finalist 2024</h3>
                    <p className="mt-0.5 text-xs text-slate-500">ISSUED BY TIC SUMMIT</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Awarded for reaching the final round among top 5% of global participants.
                    </p>
                  </div>
                </div>
                <button className="cursor-pointer w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-[#111827] hover:bg-slate-50 transition whitespace-nowrap">
                  View Certificate
                </button>
              </div>
            </div>
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
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 rounded-full bg-amber-50 p-4">
                <Lightbulb size={24} className="text-amber-500" />
                <span className="text-[10px] font-semibold text-slate-700">Innovator</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-full bg-blue-50 p-4">
                <Code size={24} className="text-blue-500" />
                <span className="text-[10px] font-semibold text-slate-700">Top Coder</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-full bg-purple-50 p-4">
                <Users size={24} className="text-purple-500" />
                <span className="text-[10px] font-semibold text-slate-700">Team Lead</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-full bg-emerald-50 p-4">
                <Leaf size={24} className="text-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-700">Eco Warrior</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-full bg-pink-50 p-4">
                <Palette size={24} className="text-pink-500" />
                <span className="text-[10px] font-semibold text-slate-700">Creative</span>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-full bg-slate-100 p-4">
                <Lock size={24} className="text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-500">Locked</span>
              </div>
            </div>
          </div>

          {/* Mentor Feedback */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Mentor Feedback</h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              &quot;Jane showed incredible leadership during the sprint phase. Her ability to
              synthesize complex data into actionable insights was key to the team&apos;s
              success.&quot;
            </p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Alex Thompson</p>
                <p className="text-xs text-slate-500">Lead Mentor, TechStar</p>
              </div>
            </div>
          </div>

          {/* Core Skills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Core Skills</h2>
            <div className="flex flex-wrap gap-2">
              {["User Research", "Prototyping", "Public Speaking", "Python", "Team Management"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
