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

  const getCurrentData = () => {
    if (activeTab === "students") return students;
    if (activeTab === "teams") return teams;
    return schools;
  };

  const pagination = getCurrentPagination();
  const hasMore = pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      {/* Your Rank Section */}
      {userRank && (
        <div className="flex items-center justify-end">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 rounded-lg border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-3 shadow-sm w-full sm:w-auto">
            <BarChart3 size={16} className="sm:w-[18px] sm:h-[18px] text-slate-500 flex-shrink-0" />
            <div className="flex-1 sm:flex-none">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">
                YOUR RANK
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-slate-900">#{userRank.rank}</span>
                {userRank.rankChange !== 0 && (
                  <div
                    className={`flex items-center gap-0.5 ${
                      userRank.rankChange > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {userRank.rankChange > 0 ? (
                      <TrendingUp size={10} className="sm:w-3 sm:h-3" />
                    ) : (
                      <TrendingDown size={10} className="sm:w-3 sm:h-3" />
                    )}
                    <span className="text-[10px] sm:text-xs font-semibold">
                      {userRank.rankChange > 0 ? "+" : ""}
                      {userRank.rankChange}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="sm:ml-4 sm:border-l sm:border-slate-200 sm:pl-4 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-500">TP</p>
              <p className="mt-1 text-base sm:text-lg font-bold text-slate-900">{userRank.totalTP.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

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
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 sm:pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
          />
        </div>
        <button
          onClick={handleSearch}
          className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <Filter size={14} className="sm:w-4 sm:h-4" />
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
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-4 md:gap-6">
              {/* #2 */}
              <div className="flex w-full sm:w-[280px] flex-col items-center">
                <div className="relative mb-4">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-200 to-slate-300">
                    {topStudents[1]?.avatarUrl ? (
                      <img
                        src={topStudents[1].avatarUrl}
                        alt={topStudents[1].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-semibold text-slate-600">
                        {topStudents[1]?.initials || topStudents[1]?.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-200 px-2 sm:px-3 py-0.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-700">#2</span>
                  </div>
                </div>
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
                  <h3 className="text-center text-lg sm:text-xl font-bold text-slate-900">{topStudents[1]?.name}</h3>
                  <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">{topStudents[1]?.school}</p>
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                    <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400" />
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {topStudents[1]?.totalTP.toLocaleString()} TP
                    </span>
                  </div>
                </div>
              </div>

              {/* #1 - Highlighted */}
              <div className="flex w-full sm:w-[320px] flex-col items-center order-first md:order-none">
                <div className="relative mb-4">
                  <div className="flex h-24 w-24 sm:h-36 sm:w-36 items-center justify-center rounded-full border-4 border-amber-400 bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg">
                    {topStudents[0]?.avatarUrl ? (
                      <img
                        src={topStudents[0].avatarUrl}
                        alt={topStudents[0].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-5xl font-semibold text-slate-600">
                        {topStudents[0]?.initials || topStudents[0]?.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 sm:px-4 py-1">
                    <span className="text-sm sm:text-base font-bold text-white">#1</span>
                  </div>
                </div>
                <div className="relative w-full overflow-hidden rounded-2xl bg-[#111827] p-4 sm:p-6 shadow-xl">
                  <Trophy size={60} className="absolute -right-4 -top-4 opacity-10 text-amber-400 sm:w-20 sm:h-20" />
                  <h3 className="relative text-center text-xl sm:text-2xl font-bold text-white">{topStudents[0]?.name}</h3>
                  <p className="relative mt-1 text-center text-xs sm:text-sm text-slate-300">{topStudents[0]?.school}</p>
                  <div className="relative mt-3 sm:mt-4 flex items-center justify-center gap-2">
                    <Star size={18} className="sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg sm:text-xl font-bold text-white">
                      {topStudents[0]?.totalTP.toLocaleString()} TP
                    </span>
                  </div>
                </div>
              </div>

              {/* #3 */}
              <div className="flex w-full sm:w-[280px] flex-col items-center">
                <div className="relative mb-4">
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-full border-2 border-orange-300 bg-gradient-to-br from-slate-200 to-slate-300">
                    {topStudents[2]?.avatarUrl ? (
                      <img
                        src={topStudents[2].avatarUrl}
                        alt={topStudents[2].name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl sm:text-3xl font-semibold text-slate-600">
                        {topStudents[2]?.initials || topStudents[2]?.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-orange-200 px-2 sm:px-3 py-0.5">
                    <span className="text-xs sm:text-sm font-bold text-orange-700">#3</span>
                  </div>
                </div>
                <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-lg">
                  <h3 className="text-center text-lg sm:text-xl font-bold text-slate-900">{topStudents[2]?.name}</h3>
                  <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">{topStudents[2]?.school}</p>
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2">
                    <Star size={16} className="sm:w-[18px] sm:h-[18px] fill-amber-400 text-amber-400" />
                    <span className="text-base sm:text-lg font-bold text-slate-900">
                      {topStudents[2]?.totalTP.toLocaleString()} TP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      RANK
                    </th>
                    {activeTab === "students" && (
                      <>
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
                      </>
                    )}
                    {activeTab === "teams" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          TEAM
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          SCHOOL
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          MEMBERS
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ACTIVITY TREND
                        </th>
                      </>
                    )}
                    {activeTab === "schools" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          SCHOOL
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          STUDENTS
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          TEAMS
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          AVG TP
                        </th>
                        <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          ACTIVITY TREND
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      TOTAL TP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getCurrentData().map((item) => {
                    if (activeTab === "students") {
                      const student = item as LeaderboardStudent;
                      return (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="px-3 sm:px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              {String(student.rank).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {student.avatarUrl ? (
                                <img
                                  src={student.avatarUrl}
                                  alt={student.name}
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-xs sm:text-sm font-semibold text-slate-700 flex-shrink-0">
                                  {student.initials || student.name.split(" ").map((n) => n[0]).join("")}
                                </div>
                              )}
                              <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                                {student.name}
                              </span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{student.school}</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1">
                              {student.badges.slice(0, 3).map((badge, idx) => (
                                <div
                                  key={idx}
                                  className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600"
                                  title={badge}
                                />
                              ))}
                              {student.badges.length > 3 && (
                                <span className="text-xs text-slate-500">+{student.badges.length - 3}</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {getActivityIcon(student.activityTrend)}
                              <span className={`text-sm font-semibold ${getActivityColor(student.activityTrend)}`}>
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
                      );
                    } else if (activeTab === "teams") {
                      const team = item as LeaderboardTeam;
                      return (
                        <tr key={team.id} className="hover:bg-slate-50">
                          <td className="px-3 sm:px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              {String(team.rank).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">{team.name}</span>
                          </td>
                          <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{team.school}</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{team.memberCount} members</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {getActivityIcon(team.activityTrend)}
                              <span className={`text-sm font-semibold ${getActivityColor(team.activityTrend)}`}>
                                {team.activityTrend > 0 ? "+" : ""}
                                {team.activityTrend}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={12} className="sm:w-[14px] sm:h-[14px] fill-amber-400 text-amber-400" />
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {team.totalTP.toLocaleString()} TP
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    } else {
                      const school = item as LeaderboardSchool;
                      return (
                        <tr key={school.id} className="hover:bg-slate-50">
                          <td className="px-3 sm:px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              {String(school.rank).padStart(2, "0")}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className="text-xs sm:text-sm font-semibold text-slate-900">{school.name}</span>
                          </td>
                          <td className="hidden md:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{school.studentCount} students</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{school.teamCount} teams</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <span className="text-sm text-slate-600">{school.averageTP.toFixed(1)} TP</span>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              {getActivityIcon(school.activityTrend)}
                              <span className={`text-sm font-semibold ${getActivityColor(school.activityTrend)}`}>
                                {school.activityTrend > 0 ? "+" : ""}
                                {school.activityTrend}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Star size={12} className="sm:w-[14px] sm:h-[14px] fill-amber-400 text-amber-400" />
                              <span className="text-xs sm:text-sm font-bold text-slate-900">
                                {school.totalTP.toLocaleString()} TP
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-slate-600">
                Showing {getCurrentData().length} of {pagination.total} results
              </p>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
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
      <div className="text-center">
        <p className="text-sm text-slate-500">
          Tip: Complete daily quizzes to boost your TP score by up to 50 points per day.
        </p>
      </div>
    </div>
  );
}
