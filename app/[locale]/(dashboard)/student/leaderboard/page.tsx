"use client";

import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { leaderboardService, type LeaderboardStudent, type LeaderboardTeam, type LeaderboardSchool, type UserRank } from "../../../../../src/lib/services/leaderboardService";
import { toast } from "sonner";
import { useAuthStore } from "../../../../../src/state/auth-store";

export default function LeaderboardPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"students" | "teams" | "schools">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // User rank
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  
  // Students
  const [topStudents, setTopStudents] = useState<LeaderboardStudent[]>([]);
  const [students, setStudents] = useState<LeaderboardStudent[]>([]);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsPagination, setStudentsPagination] = useState({ total: 0, totalPages: 1 });
  
  // Teams
  const [topTeams, setTopTeams] = useState<LeaderboardTeam[]>([]);
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [teamsPage, setTeamsPage] = useState(1);
  const [teamsPagination, setTeamsPagination] = useState({ total: 0, totalPages: 1 });
  
  // Schools
  const [topSchools, setTopSchools] = useState<LeaderboardSchool[]>([]);
  const [schools, setSchools] = useState<LeaderboardSchool[]>([]);
  const [schoolsPage, setSchoolsPage] = useState(1);
  const [schoolsPagination, setSchoolsPagination] = useState({ total: 0, totalPages: 1 });

  // Load user rank
  useEffect(() => {
    if (user) {
      loadUserRank();
    }
  }, [user]);

  // Load data when tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load more when page changes
  useEffect(() => {
    if (studentsPage > 1 || teamsPage > 1 || schoolsPage > 1) {
      loadMoreData();
    }
  }, [studentsPage, teamsPage, schoolsPage]);

  const loadUserRank = async () => {
    try {
      const rank = await leaderboardService.getMyRank();
      setUserRank(rank);
    } catch (error: any) {
      console.error("Failed to load user rank:", error);
      // Silent fail - don't show error for user rank
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "students") {
        const [topData, listData] = await Promise.all([
          leaderboardService.getTopStudents(),
          leaderboardService.getStudentsLeaderboard({ page: 1, limit: 20, search: searchQuery || undefined }),
        ]);
        setTopStudents(topData);
        setStudents(listData.data);
        setStudentsPagination(listData.pagination);
        setStudentsPage(1);
      } else if (activeTab === "teams") {
        const [topData, listData] = await Promise.all([
          leaderboardService.getTopTeams(),
          leaderboardService.getTeamsLeaderboard({ page: 1, limit: 20, search: searchQuery || undefined }),
        ]);
        setTopTeams(topData);
        setTeams(listData.data);
        setTeamsPagination(listData.pagination);
        setTeamsPage(1);
      } else if (activeTab === "schools") {
        const [topData, listData] = await Promise.all([
          leaderboardService.getTopSchools(),
          leaderboardService.getSchoolsLeaderboard({ page: 1, limit: 20, search: searchQuery || undefined }),
        ]);
        setTopSchools(topData);
        setSchools(listData.data);
        setSchoolsPagination(listData.pagination);
        setSchoolsPage(1);
      }
    } catch (error: any) {
      console.error("Failed to load leaderboard:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = async () => {
    try {
      setLoadingMore(true);
      
      if (activeTab === "students" && studentsPage > 1) {
        const data = await leaderboardService.getStudentsLeaderboard({
          page: studentsPage,
          limit: 20,
          search: searchQuery || undefined,
        });
        setStudents((prev) => [...prev, ...data.data]);
        setStudentsPagination(data.pagination);
      } else if (activeTab === "teams" && teamsPage > 1) {
        const data = await leaderboardService.getTeamsLeaderboard({
          page: teamsPage,
          limit: 20,
          search: searchQuery || undefined,
        });
        setTeams((prev) => [...prev, ...data.data]);
        setTeamsPagination(data.pagination);
      } else if (activeTab === "schools" && schoolsPage > 1) {
        const data = await leaderboardService.getSchoolsLeaderboard({
          page: schoolsPage,
          limit: 20,
          search: searchQuery || undefined,
        });
        setSchools((prev) => [...prev, ...data.data]);
        setSchoolsPagination(data.pagination);
      }
    } catch (error: any) {
      console.error("Failed to load more data:", error);
      toast.error("Failed to load more results");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleLoadMore = () => {
    if (activeTab === "students") {
      setStudentsPage((prev) => prev + 1);
    } else if (activeTab === "teams") {
      setTeamsPage((prev) => prev + 1);
    } else if (activeTab === "schools") {
      setSchoolsPage((prev) => prev + 1);
    }
  };

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

  const getCurrentPagination = () => {
    if (activeTab === "students") return studentsPagination;
    if (activeTab === "teams") return teamsPagination;
    return schoolsPagination;
  };

  const getCurrentPage = () => {
    if (activeTab === "students") return studentsPage;
    if (activeTab === "teams") return teamsPage;
    return schoolsPage;
  };

  const getCurrentData = () => {
    if (activeTab === "students") return students;
    if (activeTab === "teams") return teams;
    return schools;
  };

  const pagination = getCurrentPagination();
  const currentPage = getCurrentPage();
  const hasMore = currentPage < pagination.totalPages;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Your Rank Section */}
      {userRank && (
        <div className="flex items-center justify-end">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-2 rounded-lg border border-black bg-white px-2 sm:px-3 py-1.5 sm:py-2 shadow-sm w-full sm:w-auto">
            <BarChart3 size={14} className="sm:w-4 sm:h-4 text-slate-500 flex-shrink-0" />
            <div className="flex-1 sm:flex-none">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                YOUR RANK
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-bold text-slate-900">#{userRank.rank || 0}</span>
                {userRank.rankChange !== 0 && (
                  <div
                    className={`flex items-center gap-0.5 ${
                      userRank.rankChange > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {userRank.rankChange > 0 ? (
                      <TrendingUp size={9} className="sm:w-2.5 sm:h-2.5" />
                    ) : (
                      <TrendingDown size={9} className="sm:w-2.5 sm:h-2.5" />
                    )}
                    <span className="text-[9px] sm:text-[10px] font-semibold">
                      {userRank.rankChange > 0 ? "+" : ""}
                      {userRank.rankChange}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:ml-3 sm:border-l sm:border-black sm:pl-3 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-black w-full sm:w-auto">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-500">TP</p>
              <p className="mt-0.5 text-sm sm:text-base font-bold text-slate-900">{(userRank.totalTP || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold transition-colors ${
            activeTab === "students"
              ? "bg-[#111827] text-white border-[#111827]"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          }`}
        >
          <User size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Students</span>
        </button>
        <button
          onClick={() => setActiveTab("teams")}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold transition-colors ${
            activeTab === "teams"
              ? "bg-[#111827] text-white border-black"
              : "bg-white text-slate-700 border-black hover:bg-slate-50"
          }`}
        >
          <Users size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Teams</span>
        </button>
        <button
          onClick={() => setActiveTab("schools")}
          className={`flex items-center gap-1 sm:gap-1.5 rounded-lg border-2 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold transition-colors ${
            activeTab === "schools"
              ? "bg-[#111827] text-white border-black"
              : "bg-white text-slate-700 border-black hover:bg-slate-50"
          }`}
        >
          <School size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Schools</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 text-slate-400 sm:w-4 sm:h-4"
          />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white pl-7 sm:pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#111827] focus:border-[#111827]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="cursor-pointer flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Filter size={12} className="sm:w-3.5 sm:h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Top 3 Students Podium */}
          {activeTab === "students" && topStudents.length >= 3 && (
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-3 md:gap-4">
              {/* #2 */}
              <div className="flex w-full sm:w-[240px] flex-col items-center">
                <div className="relative mb-3">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300">
                    {topStudents[1]?.avatarUrl ? (
                      <img
                        src={topStudents[1].avatarUrl}
                        alt={topStudents[1].name || "User"}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector("span")) {
                            const name = topStudents[1]?.name || "User";
                            const initialsValue = topStudents[1]?.initials;
                            const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                            const initials = (!initialsValue || invalidInitials.includes(initialsValue) || initialsValue.trim() === "") 
                              ? (name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U")
                              : initialsValue;
                            const span = document.createElement("span");
                            span.className = "text-lg sm:text-xl font-semibold text-slate-600";
                            span.textContent = initials;
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-semibold text-slate-600">
                        {(() => {
                          const name = topStudents[1]?.name || "";
                          const initials = topStudents[1]?.initials;
                          const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                          // Check if initials is undefined, null, empty, or invalid strings from backend
                          if (!initials || invalidInitials.includes(initials) || initials.trim() === "") {
                            return name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U";
                          }
                          return initials;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-200 px-2 py-0.5">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">#2</span>
                  </div>
                </div>
                <div className="w-full rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-lg">
                  <h3 className="text-center text-base sm:text-lg font-bold text-slate-900">{topStudents[1]?.name || "Unknown"}</h3>
                  <p className="mt-0.5 text-center text-[10px] sm:text-xs text-slate-500">{topStudents[1]?.school || ""}</p>
                  <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5">
                    <Star size={14} className="sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {topStudents[1]?.totalTP?.toLocaleString() || 0} TP
                    </span>
                  </div>
                </div>
              </div>

              {/* #1 - Highlighted */}
              <div className="flex w-full sm:w-[260px] flex-col items-center order-first md:order-none">
                <div className="relative mb-3">
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
                    {topStudents[0]?.avatarUrl ? (
                      <img
                        src={topStudents[0].avatarUrl}
                        alt={topStudents[0].name || "User"}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector("span")) {
                            const name = topStudents[0]?.name || "User";
                            const initialsValue = topStudents[0]?.initials;
                            const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                            const initials = (!initialsValue || invalidInitials.includes(initialsValue) || initialsValue.trim() === "") 
                              ? (name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U")
                              : initialsValue;
                            const span = document.createElement("span");
                            span.className = "text-xl sm:text-2xl font-semibold text-slate-600";
                            span.textContent = initials;
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-semibold text-slate-600">
                        {(() => {
                          const name = topStudents[0]?.name || "";
                          const initials = topStudents[0]?.initials;
                          const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                          // Check if initials is undefined, null, empty, or invalid strings from backend
                          if (!initials || invalidInitials.includes(initials) || initials.trim() === "") {
                            return name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U";
                          }
                          return initials;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-2.5 sm:px-3 py-0.5">
                    <span className="text-xs sm:text-sm font-bold text-white">#1</span>
                  </div>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl bg-[#111827] p-3 sm:p-4 shadow-xl">
                  <Trophy size={40} className="absolute -right-2 -top-2 opacity-10 text-amber-400 sm:w-16 sm:h-16" />
                  <h3 className="relative text-center text-lg sm:text-xl font-bold text-white">{topStudents[0]?.name || "Unknown"}</h3>
                  <p className="relative mt-0.5 text-center text-[10px] sm:text-xs text-slate-300">{topStudents[0]?.school || ""}</p>
                  <div className="relative mt-2 sm:mt-3 flex items-center justify-center gap-1.5">
                    <Star size={16} className="sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    <span className="text-base sm:text-lg font-bold text-white">
                      {topStudents[0]?.totalTP?.toLocaleString() || 0} TP
                    </span>
                  </div>
                </div>
              </div>

              {/* #3 */}
              <div className="flex w-full sm:w-[240px] flex-col items-center">
                <div className="relative mb-3">
                  <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300">
                    {topStudents[2]?.avatarUrl ? (
                      <img
                        src={topStudents[2].avatarUrl}
                        alt={topStudents[2].name || "User"}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector("span")) {
                            const name = topStudents[2]?.name || "User";
                            const initialsValue = topStudents[2]?.initials;
                            const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                            const initials = (!initialsValue || invalidInitials.includes(initialsValue) || initialsValue.trim() === "") 
                              ? (name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U")
                              : initialsValue;
                            const span = document.createElement("span");
                            span.className = "text-lg sm:text-xl font-semibold text-slate-600";
                            span.textContent = initials;
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-lg sm:text-xl font-semibold text-slate-600">
                        {(() => {
                          const name = topStudents[2]?.name || "";
                          const initials = topStudents[2]?.initials;
                          const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "NULL"];
                          // Check if initials is undefined, null, empty, or invalid strings from backend
                          if (!initials || invalidInitials.includes(initials) || initials.trim() === "") {
                            return name ? name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2) || "U" : "U";
                          }
                          return initials;
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full bg-orange-200 px-2 py-0.5 border border-black">
                    <span className="text-[10px] sm:text-xs font-bold text-orange-700">#3</span>
                  </div>
                </div>
                <div className="w-full rounded-xl border border-slate-200 bg-white p-3 sm:p-4 shadow-lg">
                  <h3 className="text-center text-base sm:text-lg font-bold text-slate-900">{topStudents[2]?.name || "Unknown"}</h3>
                  <p className="mt-0.5 text-center text-[10px] sm:text-xs text-slate-500">{topStudents[2]?.school || ""}</p>
                  <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5">
                    <Star size={14} className="sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      {topStudents[2]?.totalTP?.toLocaleString() || 0} TP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-900 bg-[#111827] text-white border-r border-slate-300">
                      RANK
                    </th>
                    {activeTab === "students" && (
                      <>
                        <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          STUDENT
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          SCHOOL
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          BADGES
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ACTIVITY TREND
                        </th>
                      </>
                    )}
                    {activeTab === "teams" && (
                      <>
                        <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          TEAM
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          SCHOOL
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          MEMBERS
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ACTIVITY TREND
                        </th>
                      </>
                    )}
                    {activeTab === "schools" && (
                      <>
                        <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          SCHOOL
                        </th>
                        <th className="hidden md:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          STUDENTS
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          TEAMS
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          AVG TP
                        </th>
                        <th className="hidden lg:table-cell px-3 sm:px-4 py-2 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ACTIVITY TREND
                        </th>
                      </>
                    )}
                    <th className="px-3 sm:px-4 py-2 sm:py-2.5 text-right text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                      TOTAL TP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {getCurrentData().map((item) => {
                    if (activeTab === "students") {
                      const student = item as LeaderboardStudent;
                      const studentName = student.name || "Unknown";
                      // Helper function to get initials - handles "undefined", "NUNDEFINED", "null" strings from backend
                      const getInitials = (name: string, initials?: string | null): string => {
                        // Check if initials is undefined, null, empty, or invalid strings from backend
                        const invalidInitials = ["undefined", "null", "NUNDEFINED", "UNDEFINED", "null", "NULL"];
                        if (!initials || invalidInitials.includes(initials) || initials.trim() === "") {
                          if (name && name.trim()) {
                            const generated = name.split(" ").map((n) => n?.[0] || "").filter(Boolean).join("").toUpperCase().slice(0, 2);
                            return generated || "U";
                          }
                          return "U";
                        }
                        return initials;
                      };
                      const studentInitials = getInitials(studentName, student.initials);
                      return (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 bg-[#111827] text-white border-r border-slate-300">
                            <span className="text-xs sm:text-sm font-bold">
                              {String(student.rank || 0).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={studentName}
                                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full object-cover flex-shrink-0"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    const parent = target.parentElement;
                                    if (parent && !parent.querySelector(".avatar-fallback")) {
                                      const fallback = document.createElement("div");
                                      fallback.className = "avatar-fallback flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[10px] sm:text-xs font-semibold text-slate-700 flex-shrink-0";
                                      fallback.textContent = studentInitials;
                                      parent.insertBefore(fallback, target.nextSibling);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[10px] sm:text-xs font-semibold text-slate-700 flex-shrink-0">
                                  {studentInitials}
                                </div>
                              )}
                              <span className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate">
                                {studentName}
                              </span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{student.school || ""}</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1">
                              {student.badges?.slice(0, 3).map((badge, idx) => (
                                <div
                                  key={idx}
                                  className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-black border border-black"
                                  title={badge}
                                />
                              ))}
                              {student.badges && student.badges.length > 3 && (
                                <span className="text-[10px] text-slate-500">+{student.badges.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1">
                              {getActivityIcon(student.activityTrend || 0)}
                              <span className={`text-[11px] sm:text-xs font-semibold ${getActivityColor(student.activityTrend || 0)}`}>
                                {student.activityTrend > 0 ? "+" : ""}
                                {student.activityTrend || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={10} className="sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                                {(student.totalTP || 0).toLocaleString()} TP
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    } else if (activeTab === "teams") {
                      const team = item as LeaderboardTeam;
                      return (
                        <tr key={team.id} className="hover:bg-slate-50">
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 bg-[#111827] text-white border-r border-slate-300">
                            <span className="text-xs sm:text-sm font-bold">
                              {String(team.rank || 0).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-900">{team.name || "Unknown"}</span>
                          </td>
                          <td className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{team.school || ""}</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{team.memberCount || 0} members</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1">
                              {getActivityIcon(team.activityTrend || 0)}
                              <span className={`text-[11px] sm:text-xs font-semibold ${getActivityColor(team.activityTrend || 0)}`}>
                                {team.activityTrend > 0 ? "+" : ""}
                                {team.activityTrend || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={10} className="sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                                {(team.totalTP || 0).toLocaleString()} TP
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      const school = item as LeaderboardSchool;
                      return (
                        <tr key={school.id} className="hover:bg-slate-50">
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 bg-[#111827] text-white border-r border-slate-300">
                            <span className="text-xs sm:text-sm font-bold">
                              {String(school.rank || 0).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-900">{school.name || "Unknown"}</span>
                          </td>
                          <td className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{school.studentCount || 0} students</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{school.teamCount || 0} teams</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <span className="text-[11px] sm:text-xs text-slate-600">{(school.averageTP || 0).toFixed(1)} TP</span>
                          </td>
                          <td className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-2.5">
                            <div className="flex items-center gap-1">
                              {getActivityIcon(school.activityTrend || 0)}
                              <span className={`text-[11px] sm:text-xs font-semibold ${getActivityColor(school.activityTrend || 0)}`}>
                                {school.activityTrend > 0 ? "+" : ""}
                                {school.activityTrend || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={10} className="sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] sm:text-xs font-bold text-slate-900">
                                {(school.totalTP || 0).toLocaleString()} TP
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 border-t border-slate-200 px-3 sm:px-4 py-2 sm:py-3">
              <p className="text-[10px] sm:text-xs text-slate-600">
                Showing {getCurrentData().length} of {pagination.total} results
              </p>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer Tip */}
      <div className="text-center pt-2">
        <p className="text-[10px] sm:text-xs text-slate-500">
          Tip: Complete daily quizzes to boost your TP score by up to 50 points per day.
        </p>
      </div>
    </div>
  );
}
