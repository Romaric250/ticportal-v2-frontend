"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Lock,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  User,
  Trophy,
  Info,
} from "lucide-react";

export default function HackathonsPage() {
  const [activeEventTab, setActiveEventTab] = useState("upcoming");
  const pathname = usePathname();
  const locale = pathname.split("/")[1];
  const basePath = `/${locale}/student`;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Regional Finals Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-slate-800 p-6 sm:p-8 text-white">
        <div className="relative z-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              ACTIVE STAGE
            </span>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
              QUALIFIED
            </span>
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold">Regional Finals 2024</h1>
          <p className="mb-6 text-base sm:text-lg text-slate-200">
            Your team 'The Code Warriors' has qualified for the regional stage. The theme is
            'Sustainable Cities'. Prepare your pitch deck.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${basePath}/hackathons/regional-finals-2024`}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-[#111827] hover:bg-slate-100 transition-colors"
            >
              Go to Regional Dashboard
              <ArrowRight size={14} className="sm:w-4 sm:h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 bg-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors">
              View Rulebook
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Next Deadline Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-slate-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  NEXT DEADLINE
                </span>
              </div>
            </div>
            <h2 className="mb-2 text-xl sm:text-2xl font-bold text-slate-900">Project Submission</h2>
            <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-slate-600">Regional Finals Pitch Deck & Video</p>

            {/* Countdown Timer */}
            <div className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827]">04</p>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-slate-600">DAYS</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827]">12</p>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-slate-600">HRS</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-4 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111827]">30</p>
                <p className="mt-1 text-[10px] sm:text-xs font-semibold text-slate-600">MINS</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-900">Progress</span>
                <span className="font-semibold text-green-600">80%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[80%] bg-green-500" />
              </div>
            </div>

            <button className="w-full rounded-lg bg-[#111827] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1f2937] transition-colors">
              Continue Submission
            </button>
          </div>

          {/* Hackathon Journey */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Your Hackathon Journey</h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Track your team's progression through the competition stages.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                Region: North-East
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:flex sm:flex-wrap items-start gap-4 sm:gap-6">
              {/* School Level */}
              <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                <div className="mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 size={16} className="sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-1 text-xs sm:text-sm font-semibold text-slate-900">School Level</h3>
                <p className="text-[10px] sm:text-xs font-semibold text-green-600">Qualified</p>
              </div>

              {/* Area Level */}
              <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                <div className="mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 size={16} className="sm:w-5 sm:h-5 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-1 text-xs sm:text-sm font-semibold text-slate-900">Area Level</h3>
                <p className="text-[10px] sm:text-xs font-semibold text-green-600">Qualified</p>
              </div>

              {/* Regional Finals */}
              <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                <div className="mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-[#111827]">
                    <FileText size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
                    <div className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500 border-2 border-white" />
                  </div>
                </div>
                <h3 className="mb-1 text-xs sm:text-sm font-semibold text-slate-900">Regional Finals</h3>
                <p className="mb-1 text-[10px] sm:text-xs font-semibold text-[#111827]">In Progress</p>
                <p className="text-[9px] sm:text-[10px] text-slate-500">Submit project by Oct 24</p>
              </div>

              {/* National Finals */}
              <div className="flex-1 min-w-[120px] sm:min-w-[140px]">
                <div className="mb-2 sm:mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-slate-200">
                    <Lock size={14} className="sm:w-[18px] sm:h-[18px] text-slate-400" />
                  </div>
                </div>
                <h3 className="mb-1 text-xs sm:text-sm font-semibold text-slate-900">National Finals</h3>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">Requires Qualification</p>
              </div>
            </div>
          </div>

          {/* Resources and Events */}
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {/* Learning Materials */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-blue-100">
                <GraduationCap size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">Learning Materials</h3>
              <p className="mb-4 text-xs sm:text-sm text-slate-600">
                Access workshops and guides for the 'Sustainable Cities' theme.
              </p>
              <Link
                href={`${basePath}/learning-path`}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:underline"
              >
                View Materials <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </Link>
            </div>

            {/* Book Mentorship */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              <div className="mb-3 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-purple-100">
                <User size={20} className="sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <h3 className="mb-2 text-base sm:text-lg font-bold text-slate-900">Book Mentorship</h3>
              <p className="mb-4 text-xs sm:text-sm text-slate-600">
                Schedule a 1-on-1 session with a regional technical mentor.
              </p>
              <button className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-purple-600 hover:underline">
                Book Session <ArrowRight size={12} className="sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          </div>

          {/* Other Hackathon Events */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <h2 className="mb-4 text-lg sm:text-xl font-bold text-slate-900">Other Hackathon Events</h2>
            <div className="mb-4 flex gap-2 border-b border-slate-200 overflow-x-auto">
              <button
                onClick={() => setActiveEventTab("upcoming")}
                className={`cursor-pointer whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeEventTab === "upcoming"
                    ? "border-b-2 border-[#111827] text-[#111827]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveEventTab("past")}
                className={`cursor-pointer whitespace-nowrap px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition ${
                  activeEventTab === "past"
                    ? "border-b-2 border-[#111827] text-[#111827]"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Past Archives
              </button>
            </div>

            <div className="space-y-4">
              {/* Winter Code Sprint */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold text-[#111827]">DEC 15</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Winter Code Sprint</h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        OPEN
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  A 48-hour online hackathon focused on AI solutions.
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> Virtual
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} /> Solo or Team
                  </span>
                </div>
                <button className="rounded-lg bg-[#111827] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1f2937] transition-colors">
                  Register Now
                </button>
              </div>

              {/* National Innovation Fair */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold text-[#111827]">JAN 20</p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        National Innovation Fair
                      </h3>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        COMING SOON
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  Showcase for the top 50 teams from regional finals.
                </p>
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> New York, NY
                  </span>
                  <span className="flex items-center gap-1">
                    <Trophy size={14} /> $10K Prize Pool
                  </span>
                </div>
                <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* My Team */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">My Team</h3>
              <Link
                href={`${basePath}/team`}
                className="text-xs sm:text-sm font-semibold text-[#111827] hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-300" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-xs font-semibold text-white">
                  +1
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">The Code Warriors</p>
                <p className="text-xs text-green-600">Online</p>
              </div>
            </div>
          </div>

          {/* Competition Rules */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <h3 className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-wide text-slate-500">
              COMPETITION RULES
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                <FileText size={18} className="sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">Regional Rulebook v2.1</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">PDF - 2.4 MB</p>
                </div>
                <button className="cursor-pointer text-slate-500 hover:text-[#111827] flex-shrink-0">
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                <FileText size={18} className="sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">Pitch Deck Template</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">PPTX - 5.1 MB</p>
                </div>
                <button className="cursor-pointer text-slate-500 hover:text-[#111827] flex-shrink-0">
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">
                <FileText size={18} className="sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">Judging Criteria</p>
                  <p className="text-[10px] sm:text-xs text-slate-500">PDF - 1.2 MB</p>
                </div>
                <button className="cursor-pointer text-slate-500 hover:text-[#111827] flex-shrink-0">
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

