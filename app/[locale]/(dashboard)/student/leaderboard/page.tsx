"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  User,
  Users,
  School,
} from "lucide-react";

type Student = {
  rank: number;
  name: string;
  school: string;
  badges: string[];
  activityTrend: number;
  totalTP: number;
  avatar?: string;
  initials?: string;
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [searchQuery, setSearchQuery] = useState("");

  const topStudents: Student[] = [
    {
      rank: 1,
      name: "Alex Chen",
      school: "Tech High Global",
      badges: ["trophy"],
      activityTrend: 15,
      totalTP: 2450,
    },
    {
      rank: 2,
      name: "Maria Rodriguez",
      school: "Valley School",
      badges: ["trophy"],
      activityTrend: 12,
      totalTP: 2100,
    },
    {
      rank: 3,
      name: "James Smith",
      school: "Central Academy",
      badges: ["trophy"],
      activityTrend: 8,
      totalTP: 1980,
    },
  ];

  const students: Student[] = [
    {
      rank: 4,
      name: "Sarah Jenkins",
      school: "Riverdale High",
      badges: ["trophy", "figures"],
      activityTrend: 12,
      totalTP: 1850,
    },
    {
      rank: 5,
      name: "Michael Chang",
      school: "Northside Prep",
      badges: ["purple"],
      activityTrend: 5,
      totalTP: 1720,
    },
    {
      rank: 6,
      name: "Emma Lewis",
      school: "Westview High",
      badges: ["lightning", "trophy"],
      activityTrend: 0,
      totalTP: 1680,
      initials: "EL",
    },
    {
      rank: 7,
      name: "David Kim",
      school: "Tech High Global",
      badges: ["swirl"],
      activityTrend: -2,
      totalTP: 1645,
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.school.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActivityIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const getActivityColor = (trend: number) => {
    if (trend > 0) return "text-emerald-600";
    if (trend < 0) return "text-red-600";
    return "text-slate-500";
  };

  return (
    <div className="space-y-6">
      {/* Your Rank Section */}
      <div className="flex items-center justify-end">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 shadow-sm w-full sm:w-auto">
          <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px] text-slate-500 flex-shrink-0" />
          <div className="flex-1 sm:flex-none">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
              YOUR RANK
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900">#142</span>
              <div className="flex items-center gap-0.5 text-emerald-600">
                <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                <span className="text-[10px] sm:text-xs font-semibold">+3</span>
              </div>
            </div>
          </div>
          <div className="sm:ml-4 sm:border-l sm:border-slate-200 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">TP</p>
            <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">850</p>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "students"
              ? "bg-[#111827] text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <User size={14} className="sm:w-4 sm:h-4" />
          <span>Students</span>
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "teams"
              ? "bg-[#111827] text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Users size={14} className="sm:w-4 sm:h-4" />
          <span>Teams</span>
        </button>
        <button
          onClick={() => setActiveTab("schools")}
          className={`flex items-center gap-1.5 sm:gap-2 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors ${
            activeTab === "schools"
              ? "bg-[#111827] text-white"
              : "bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <School size={14} className="sm:w-4 sm:h-4" />
          <span>Schools</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 sm:w-[18px] sm:h-[18px]"
          />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 sm:pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
          />
        </div>
        <button className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
          <Filter size={14} className="sm:w-4 sm:h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Top 3 Students */}
      {activeTab === "students" && (
        <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-6">
          {/* #2 - Maria Rodriguez */}
          <div className="flex w-full sm:w-[280px] flex-col items-center">
            <div className="relative mb-4">
              <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300">
                <User size={40} className="sm:w-14 sm:h-14 text-slate-600" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-200 px-2 sm:px-3 py-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-700">#2</span>
              </div>
            </div>
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
              <h3 className="text-center text-lg sm:text-xl font-bold text-slate-900">Maria Rodriguez</h3>
              <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">Valley School</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400" />
                <span className="text-base sm:text-lg font-bold text-slate-900">2,100 TP</span>
              </div>
            </div>
          </div>

          {/* #1 - Alex Chen (Highlighted) */}
          <div className="flex w-full sm:w-[320px] flex-col items-center order-first md:order-none">
            <div className="relative mb-4">
              <div className="flex h-24 w-24 sm:h-36 sm:w-36 items-center justify-center rounded-full border-4 border-amber-400 bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
                <User size={48} className="sm:w-[72px] sm:h-[72px] text-slate-600" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 sm:px-4 py-1">
                <span className="text-sm sm:text-base font-bold text-white">#1</span>
              </div>
            </div>
            <div className="relative w-full overflow-hidden rounded-2xl bg-[#111827] p-4 sm:p-6 shadow-xl">
              <Trophy size={60} className="absolute -right-4 -top-4 opacity-10 text-amber-400 sm:w-20 sm:h-20" />
              <h3 className="relative text-center text-xl sm:text-2xl font-bold text-white">Alex Chen</h3>
              <p className="relative mt-1 text-center text-xs sm:text-sm text-slate-300">Tech High Global</p>
              <div className="relative mt-3 sm:mt-4 flex items-center justify-center gap-2">
                <Star size={18} className="sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                <span className="text-lg sm:text-xl font-bold text-white">2,450 TP</span>
              </div>
            </div>
          </div>

          {/* #3 - James Smith */}
          <div className="flex w-full sm:w-[280px] flex-col items-center">
            <div className="relative mb-4">
              <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-orange-300 bg-gradient-to-br from-slate-200 to-slate-300">
                <User size={40} className="sm:w-14 sm:h-14 text-slate-600" />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-200 px-2 sm:px-3 py-0.5">
                <span className="text-xs sm:text-sm font-bold text-orange-700">#3</span>
              </div>
            </div>
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
              <h3 className="text-center text-lg sm:text-xl font-bold text-slate-900">James Smith</h3>
              <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">Central Academy</p>
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400" />
                <span className="text-base sm:text-lg font-bold text-slate-900">1,980 TP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {activeTab === "students" && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    RANK
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    STUDENT
                  </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      SCHOOL
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      BADGES
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ACTIVITY TREND
                    </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    TOTAL TP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <tr key={student.rank} className="hover:bg-slate-50">
                    <td className="px-3 sm:px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">
                        {String(student.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {student.avatar ? (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex-shrink-0" />
                        ) : (
                          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs sm:text-sm font-semibold text-slate-700 flex-shrink-0">
                            {student.initials || student.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        )}
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{student.name}</span>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                      <span className="text-sm text-slate-600">{student.school}</span>
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1">
                        {student.badges.map((badge, idx) => (
                          <div
                            key={idx}
                            className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getActivityIcon(student.activityTrend)}
                        <span
                          className={`text-sm font-semibold ${getActivityColor(
                            student.activityTrend
                          )}`}
                        >
                          {student.activityTrend > 0 ? "+" : ""}
                          {student.activityTrend}%
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Star size={12} className="sm:w-[14px] sm:h-[14px] fill-amber-400 text-amber-400" />
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {student.totalTP.toLocaleString()} TP
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 sm:px-6 py-4">
            <p className="text-xs sm:text-sm text-slate-600">Showing 1 to 7 of 452 results</p>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition">
                &lt;
              </button>
              <button className="cursor-pointer rounded-lg bg-[#111827] px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-white">
                1
              </button>
              <button className="hidden sm:inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition">
                2
              </button>
              <button className="hidden sm:inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition">
                3
              </button>
              <span className="hidden sm:inline-block px-2 text-xs sm:text-sm text-slate-500">...</span>
              <button className="hidden sm:inline-block cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition">
                50
              </button>
              <button className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition">
                &gt;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teams and Schools tabs placeholder */}
      {(activeTab === "teams" || activeTab === "schools") && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-slate-600">
            {activeTab === "teams" ? "Teams leaderboard coming soon..." : "Schools leaderboard coming soon..."}
          </p>
        </div>
      )}

      {/* Footer Tip */}
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Tip: Complete daily quizzes to boost your TP score by up to 50 points per day.
        </p>
      </div>
    </div>
  );
}

