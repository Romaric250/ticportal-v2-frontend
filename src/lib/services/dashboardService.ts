import { apiClient } from "../api-client";

export type DashboardUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
};

export type LevelProgress = {
  percentage: number;
  currentPoints: number;
  nextLevelPoints: number;
  pointsNeeded: number;
  nextLevelName: string;
};

export type DashboardStats = {
  totalTP: number;
  tpToday: number;
  currentLevel: number;
  levelName: string;
  dayStreak: number;
  levelProgress: LevelProgress;
};

export type NextUpModule = {
  moduleId: string;
  pathId: string;
  pathName: string;
  title: string;
  description: string; // Can be plain text or TipTap JSON string
  category: string;
  status: "in_progress" | "completed" | "not_started";
  progress: number;
  lastAccessed: string | null;
  thumbnailUrl?: string | null;
  estimatedTime?: string;
  modulesCompleted: number;
  totalModules: number;
};

export type TeamMember = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  role?: string;
};

export type DashboardTeam = {
  id: string;
  name: string;
  initials: string;
  phase: string;
  memberCount: number;
  description: string;
  members: TeamMember[];
};

export type UpcomingDeadline = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  dueDate: string;
  variant: "danger" | "info" | "purple";
  type: string;
  priority: "high" | "medium" | "low";
  hackathonId?: string;
  mentorId?: string;
};

export type RecentBadge = {
  id: string;
  badgeId: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string | null;
  points: number;
  locked: boolean;
};

export type BadgeStats = {
  totalBadges: number;
  totalPoints: number;
};

export type DashboardOverview = {
  user: DashboardUser;
  stats: DashboardStats;
  nextUp: NextUpModule | null;
  team: DashboardTeam | null;
  upcomingDeadlines: UpcomingDeadline[];
  recentBadges: RecentBadge[];
  badgeStats: BadgeStats;
};

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const response = await apiClient.get<{ success: boolean; data: DashboardOverview }>(
      "/dashboard/overview"
    );
    return response.data as unknown as DashboardOverview;
  },
};
