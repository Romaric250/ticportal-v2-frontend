import { apiClient } from "../api-client";

export type LeaderboardStudent = {
  id: string;
  userId: string;
  rank: number;
  name: string;
  school: string;
  avatarUrl: string | null;
  initials: string;
  totalTP: number;
  badges: string[];
  activityTrend: number;
  rankChange: number;
  email?: string;
};

export type LeaderboardTeam = {
  id: string;
  teamId: string;
  rank: number;
  name: string;
  school: string;
  totalTP: number;
  memberCount: number;
  activityTrend: number;
  rankChange: number;
  members?: Array<{
    id: string;
    name: string;
    avatarUrl: string | null;
  }>;
};

export type LeaderboardSchool = {
  id: string;
  rank: number;
  name: string;
  totalTP: number;
  studentCount: number;
  teamCount: number;
  activityTrend: number;
  rankChange: number;
  averageTP: number;
};

export type UserRank = {
  userId: string;
  rank: number;
  totalTP: number;
  rankChange: number;
  previousRank?: number;
  tpChange?: number;
  percentile?: number;
};

export type PaginationResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const leaderboardService = {
  /**
   * Get current user's rank and statistics
   */
  async getMyRank(): Promise<UserRank> {
    const { data } = await apiClient.get<UserRank>("/leaderboard/me");
    return data;
  },

  /**
   * Get students leaderboard with pagination and filters
   */
  async getStudentsLeaderboard(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school?: string;
    minTP?: number;
    maxTP?: number;
  }): Promise<PaginationResponse<LeaderboardStudent>> {
    const { data } = await apiClient.get<{
      students: LeaderboardStudent[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/leaderboard/students", { params });
    return {
      data: data.students,
      pagination: data.pagination,
    };
  },

  /**
   * Get top 3 students for podium display
   */
  async getTopStudents(): Promise<LeaderboardStudent[]> {
    const { data } = await apiClient.get<LeaderboardStudent[]>("/leaderboard/students/top");
    return data;
  },

  /**
   * Get teams leaderboard with pagination and filters
   */
  async getTeamsLeaderboard(params?: {
    page?: number;
    limit?: number;
    search?: string;
    school?: string;
  }): Promise<PaginationResponse<LeaderboardTeam>> {
    const { data } = await apiClient.get<{
      teams: LeaderboardTeam[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/leaderboard/teams", { params });
    return {
      data: data.teams,
      pagination: data.pagination,
    };
  },

  /**
   * Get top 3 teams for podium display
   */
  async getTopTeams(): Promise<LeaderboardTeam[]> {
    const { data } = await apiClient.get<LeaderboardTeam[]>("/leaderboard/teams/top");
    return data;
  },

  /**
   * Get schools leaderboard with pagination and filters
   */
  async getSchoolsLeaderboard(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginationResponse<LeaderboardSchool>> {
    const { data } = await apiClient.get<{
      schools: LeaderboardSchool[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>("/leaderboard/schools", { params });
    return {
      data: data.schools,
      pagination: data.pagination,
    };
  },

  /**
   * Get top 3 schools for podium display
   */
  async getTopSchools(): Promise<LeaderboardSchool[]> {
    const { data } = await apiClient.get<LeaderboardSchool[]>("/leaderboard/schools/top");
    return data;
  },
};
