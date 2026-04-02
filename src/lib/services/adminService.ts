import { apiClient } from "../api-client";
import axios from "axios";
import { tokenStorage } from "../api-client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5005/api";

export type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profilePhoto?: string;
  role: "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN";
  school?: string;
  region?: string;
  isVerified: boolean;
  status: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  createdAt: string;
  lastLogin?: string;
  affiliation?: string; // Team name or school
  jurisdiction?: string; // Region/Area
  hasPaid?: boolean; // For students: has confirmed payment
  /** True if any confirmed payment is manual channel (bank/cash/other) or admin manual subscription */
  isManualChannelPaid?: boolean;
  isManualSubscription?: boolean; // For students: metadata.manualSubscription (can be reversed)
};

export type AdminUserResponse = {
  success: true;
  users: AdminUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type AdminStats = {
  totalUsers: number;
  pendingApprovals: number;
  mentorsAndLeads: number;
  unassignedJudges: number;
  totalUsersChange?: number; // Percentage change
};

export type AdminStatsResponse = {
  success: true;
  stats: AdminStats;
};

export type UpdateUserPayload = {
  role?: "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN";
  status?: "ACTIVE" | "PENDING" | "SUSPENDED" | "INACTIVE";
  school?: string;
  region?: string;
  isVerified?: boolean;
};

export type CreateUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN";
  school?: string;
  region?: string;
  password?: string;
};

export type UserFilters = {
  role?: string;
  jurisdiction?: string;
  status?: string;
  search?: string;
  paymentStatus?: "paid" | "not_paid" | "manual_paid";
};

export type RegionStats = {
  region: string;
  total: number;
  paid: number;
  paidManual?: number;
  paidOnline?: number;
  paymentChannel?: "all" | "manual" | "online";
};

export type DashboardStats = {
  usersByRole: { role: string; count: number }[];
  usersByStatus: { status: string; count: number }[];
  usersOverTime: { date: string; users: number }[];
  teamsCount: number;
  activeTeams: number;
};

/**
 * Normalize deliverable data to ensure consistent structure
 */
function normalizeDeliverable(deliverable: any): TeamDeliverable {
  return {
    ...deliverable,
    // Support both team.name and teamName
    teamName: deliverable.team?.name || deliverable.teamName || "Unknown Team",
    // Support legacy status field, map to reviewStatus if needed
    reviewStatus: deliverable.reviewStatus || deliverable.status || "PENDING",
    submissionStatus: deliverable.submissionStatus || (deliverable.content ? "SUBMITTED" : "NOT_SUBMITTED"),
    // Ensure status field exists for backward compatibility
    status: deliverable.reviewStatus || deliverable.status || "PENDING",
  };
}

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const { data } = await apiClient.get<AdminStatsResponse>("/admin/stats");
    return data.stats;
  },

  /**
   * Get dashboard statistics with charts data
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<{ success: true; data: DashboardStats }>("/admin/dashboard-stats");
    console.log("Raw API response for dashboard-stats:", response);
    console.log("Response data:", response.data);
    // Handle both { success: true, data: {...} } and direct {...} structures
    const result = response.data?.data || response.data;
    console.log("Extracted dashboard stats:", result);
    return result;
  },

  /**
   * Get users with pagination and filters
   */
  async getUsers(
    page: number = 1,
    limit: number = 20,
    filters?: UserFilters
  ): Promise<AdminUserResponse> {
    const token = tokenStorage.getAccessToken();
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.role && filters.role !== "All Roles") {
      params.append("role", filters.role);
    }
    if (filters?.jurisdiction && filters.jurisdiction !== "All Areas" && filters.jurisdiction !== "All Regions") {
      params.append("jurisdiction", filters.jurisdiction);
    }
    if (filters?.status && filters.status !== "All Statuses") {
      params.append("status", filters.status);
    }
    if (filters?.paymentStatus) {
      params.append("paymentStatus", filters.paymentStatus);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await axios.get<AdminUserResponse>(
      `${apiBaseUrl}/admin/users?${params.toString()}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error("Failed to fetch users");
  },

  /**
   * Get a single user by ID
   */
  async getUser(userId: string): Promise<AdminUser> {
    const { data } = await apiClient.get<AdminUser>(`/admin/users/${userId}`);
    return data;
  },

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<{ user: AdminUser; plainPassword?: string }> {
    const { data } = await apiClient.post<{ user: AdminUser; plainPassword?: string }>("/admin/users", payload);
    return data;
  },

  /**
   * Send OTP to email for verification before creating new user
   */
  async sendVerificationOtp(email: string): Promise<void> {
    await apiClient.post("/admin/users/send-verification-otp", { email });
  },

  /**
   * Verify OTP and create user
   */
  async verifyAndCreateUser(payload: {
    email: string;
    code: string;
    firstName: string;
    lastName: string;
    role: CreateUserPayload["role"];
    school?: string;
    region?: string;
    password?: string;
  }): Promise<{ user: AdminUser; plainPassword?: string }> {
    const { data } = await apiClient.post<{ user: AdminUser; plainPassword?: string }>(
      "/admin/users/verify-and-create",
      payload
    );
    return data;
  },

  /**
   * Update a user
   */
  async updateUser(userId: string, payload: UpdateUserPayload): Promise<AdminUser> {
    const { data } = await apiClient.put<AdminUser>(`/admin/users/${userId}`, payload);
    return data;
  },

  /**
   * Approve a pending user
   */
  async approveUser(userId: string): Promise<AdminUser> {
    return this.updateUser(userId, { status: "ACTIVE", isVerified: true });
  },

  /**
   * Suspend a user
   */
  async suspendUser(userId: string): Promise<AdminUser> {
    return this.updateUser(userId, { status: "SUSPENDED" });
  },

  /**
   * Delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * Bulk delete users
   */
  async deleteUsers(userIds: string[]): Promise<{ deleted: number; failed: Array<{ userId: string; error: string }> }> {
    const { data } = await apiClient.post<{ deleted: number; failed: Array<{ userId: string; error: string }> }>(
      "/admin/users/bulk-delete",
      { userIds }
    );
    return data;
  },

  /**
   * Get students by region with paid counts (optional payment channel for the `paid` column).
   */
  async getUsersByRegionStats(
    paymentChannel: "all" | "manual" | "online" = "all"
  ): Promise<RegionStats[]> {
    const { data } = await apiClient.get<
      RegionStats[] | { success: boolean; data: RegionStats[] }
    >("/admin/users/by-region-stats", {
      params:
        paymentChannel !== "all"
          ? { paymentChannel }
          : undefined,
    });
    const raw = data as RegionStats[] | { success?: boolean; data?: RegionStats[] };
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === "object" && "data" in raw && Array.isArray(raw.data)) {
      return raw.data;
    }
    return [];
  },

  /**
   * Import users from CSV
   */
  async importUsersCSV(file: File): Promise<{ success: boolean; imported: number; errors: number }> {
    const formData = new FormData();
    formData.append("file", file);
    
    const token = tokenStorage.getAccessToken();
    const response = await axios.post(
      `${apiBaseUrl}/admin/users/import`,
      formData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Get all team deliverables/submissions (admin view) with dual status filtering
   */
  async getTeamDeliverables(filters?: DeliverableFilters): Promise<TeamDeliverable[]> {
    const params = new URLSearchParams();
    
    // New dual status filters
    if (filters?.submissionStatus) {
      params.append("submissionStatus", filters.submissionStatus);
    }
    if (filters?.reviewStatus) {
      params.append("reviewStatus", filters.reviewStatus);
    }
    if (filters?.teamId) {
      params.append("teamId", filters.teamId);
    }
    if (filters?.templateId) {
      params.append("templateId", filters.templateId);
    }
    
    // Legacy filters for backward compatibility
    if (filters?.status && filters.status !== "All Statuses") {
      params.append("status", filters.status);
    }
    if (filters?.hackathon && filters.hackathon !== "All Hackathons") {
      params.append("hackathon", filters.hackathon);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await apiClient.get<{ success: true; data: TeamDeliverable[] } | TeamDeliverable[]>(
      `/admin/deliverables?${params.toString()}`
    );
    // Handle both response formats: { success: true, data: [...] } or direct array
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeDeliverable);
    } else if (response.data?.data) {
      return response.data.data.map(normalizeDeliverable);
    }
    return [];
  },

  /**
   * Approve deliverable
   */
  async approveDeliverable(deliverableId: string): Promise<void> {
    await apiClient.post(`/admin/deliverables/${deliverableId}/approve`);
  },

  /**
   * Reject deliverable
   */
  async rejectDeliverable(deliverableId: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/deliverables/${deliverableId}/reject`, { reason });
  },

  /**
   * Delete deliverable (admin)
   */
  async deleteDeliverable(deliverableId: string): Promise<void> {
    await apiClient.delete(`/admin/deliverables/${deliverableId}`);
  },

  /**
   * Get deliverable templates (admin-created requirements)
   */
  async getDeliverableTemplates(): Promise<DeliverableTemplate[]> {
    const { data } = await apiClient.get<DeliverableTemplate[]>("/deliverable-templates");
    return data;
  },

  /**
   * Create deliverable template
   */
  async createDeliverableTemplate(payload: CreateDeliverableTemplatePayload): Promise<DeliverableTemplate> {
    const { data } = await apiClient.post<DeliverableTemplate>("/admin/deliverable-templates", payload);
    return data;
  },

  /**
   * Update deliverable template
   */
  async updateDeliverableTemplate(
    id: string,
    payload: Partial<CreateDeliverableTemplatePayload>
  ): Promise<DeliverableTemplate> {
    const { data } = await apiClient.put<DeliverableTemplate>(`/admin/deliverable-templates/${id}`, payload);
    return data;
  },

  /**
   * Delete deliverable template
   */
  async deleteDeliverableTemplate(id: string): Promise<void> {
    await apiClient.delete(`/admin/deliverable-templates/${id}`);
  },

  /**
   * Bulk-check Google Drive access for all submitted URL deliverables
   */
  async bulkCheckDeliverableAccess(templateId?: string): Promise<GDriveAccessCheckResult> {
    const params = new URLSearchParams();
    if (templateId) params.append("templateId", templateId);
    const { data } = await apiClient.get<{ success: boolean; data: GDriveAccessCheckResult }>(
      `/admin/deliverables/access-check?${params.toString()}`
    );
    return (data as any).data ?? data;
  },

  /**
   * Check Google Drive access for a single deliverable
   */
  async checkSingleDeliverableAccess(deliverableId: string): Promise<any> {
    const { data } = await apiClient.get(`/admin/deliverables/${deliverableId}/access-check`);
    return (data as any).data ?? data;
  },

  /**
   * Reject a deliverable for access issues (un-submits + emails team)
   */
  async rejectDeliverableForAccess(deliverableId: string): Promise<void> {
    await apiClient.post(`/admin/deliverables/${deliverableId}/reject-access`);
  },

  /**
   * Upload deliverable for a team (admin override)
   */
  async uploadDeliverableForTeam(
    teamId: string,
    payload: {
      templateId: string;
      content?: string;
      contentType: "TEXT" | "FILE" | "URL";
      file?: File | null;
      description?: string;
    }
  ): Promise<TeamDeliverable> {
    let content = payload.content || "";

    if (payload.contentType === "FILE" && payload.file) {
      const { uploadFile } = await import("../uploadthing");
      content = await uploadFile(payload.file);
    }

    const { data } = await apiClient.post<TeamDeliverable>(
      `/admin/teams/${teamId}/deliverables`,
      {
        templateId: payload.templateId,
        contentType: payload.contentType,
        content,
        description: payload.description,
      },
    );

    return data;
  },

  /**
   * Get all teams with pagination and filters
   */
  async getTeams(
    page: number = 1,
    limit: number = 20,
    filters?: {
      search?: string;
      school?: string;
      status?: string;
      region?: string;
      /** Only teams with at least this many required deliverables submitted (1–7). Omit for any. */
      minDeliverablesSubmitted?: number;
      /**
       * When false, server skips deliverable/template scans (fast). Counts are 0.
       * Use for assignment UIs; keep true (default) for grading team lists.
       */
      includeDeliverableStats?: boolean;
    }
  ): Promise<TeamsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.includeDeliverableStats === false) {
      params.append("includeDeliverableStats", "false");
    }

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.school) {
      params.append("school", filters.school);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.region?.trim()) {
      params.append("region", filters.region.trim());
    }
    if (filters?.minDeliverablesSubmitted != null && filters.minDeliverablesSubmitted >= 1) {
      params.append("minDeliverablesSubmitted", String(filters.minDeliverablesSubmitted));
    }

    const { data } = await apiClient.get<TeamsResponse | Team[]>(`/admin/teams?${params.toString()}`, {
      /** Team list can be heavy; avoid 120s default client cap on slow DB. */
      timeout: 300_000,
    });
    if (Array.isArray(data)) {
      return {
        success: true,
        teams: data,
        pagination: {
          page,
          limit,
          total: data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }
    if (data && typeof data === "object" && "teams" in data) {
      return data as TeamsResponse;
    }
    return {
      success: true,
      teams: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  },

  /**
   * Distinct team school names (for filter dropdowns).
   */
  async getDistinctTeamSchools(): Promise<string[]> {
    const { data } = await apiClient.get<{ success?: boolean; schools?: string[] }>("/admin/teams/schools");
    const raw = data as { schools?: string[] } | undefined;
    if (raw && typeof raw === "object" && Array.isArray(raw.schools)) return raw.schools;
    return [];
  },

  /**
   * Get team details by ID
   */
  async getTeam(teamId: string): Promise<Team> {
    const response = await apiClient.get<{ success: true; data: Team }>(`/admin/teams/${teamId}`);
    // Handle both response.data.data and response.data formats
    return response.data?.data || response.data;
  },

  /**
   * Update team (admin override)
   */
  async updateTeam(
    teamId: string,
    payload: {
      name?: string;
      projectTitle?: string;
      description?: string;
    }
  ): Promise<Team> {
    const { data } = await apiClient.put<{ success: true; data: Team }>(`/admin/teams/${teamId}`, payload);
    return data.data;
  },

  /**
   * Create a new team (admin only)
   */
  async createTeam(payload: {
    name: string;
    school: string;
    projectTitle?: string;
    description?: string;
    leadUserId: string;
    memberUserIds?: string[];
  }): Promise<Team> {
    const { data } = await apiClient.post<{ success: true; data: Team }>("/admin/teams", payload);
    return data.data;
  },

  /**
   * Delete team (admin only)
   */
  async deleteTeam(teamId: string): Promise<void> {
    await apiClient.delete(`/admin/teams/${teamId}`);
  },

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    try {
      const response = await apiClient.get<{ success: true; data: TeamMember[] }>(
        `/admin/teams/${teamId}/members`
      );
      // Handle both response.data.data and response.data formats
      const members = response.data?.data || response.data;
      return Array.isArray(members) ? members : [];
    } catch (error) {
      console.error("Error fetching team members:", error);
      return [];
    }
  },

  /**
   * Add member to team
   */
  async addTeamMember(
    teamId: string,
    payload: { userId: string; role: "MEMBER" | "LEAD" }
  ): Promise<TeamMember> {
    const { data } = await apiClient.post<{ success: true; data: TeamMember }>(
      `/admin/teams/${teamId}/members`,
      payload
    );
    return data.data;
  },

  /**
   * Change member role
   */
  async changeMemberRole(
    teamId: string,
    userId: string,
    role: "MEMBER" | "LEAD"
  ): Promise<TeamMember> {
    const { data } = await apiClient.put<{ success: true; data: TeamMember }>(
      `/admin/teams/${teamId}/members/${userId}`,
      { role }
    );
    return data.data;
  },

  /**
   * Remove member from team
   */
  async removeTeamMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/admin/teams/${teamId}/members/${userId}`);
  },

  /**
   * Get all badges (admin view with database details)
   * API returns: { success: true, data: { badges: [...] } }
   * After apiClient interceptor: { badges: [...] }
   */
  async getAllBadges(): Promise<{ badges: AdminBadge[]; total: number }> {
    const { data } = await apiClient.get<{ badges: AdminBadge[] }>("/badges/admin/all");
    // Calculate total from badges array length
    return {
      badges: data.badges || [],
      total: data.badges?.length || 0,
    };
  },

  /**
   * Get specific badge details with award count
   * API returns: { success: true, data: { badge: {...}, awardCount: number } }
   * After apiClient interceptor: { badge: {...}, awardCount: number }
   */
  async getBadgeDetails(badgeId: string): Promise<{ badge: AdminBadge; awardCount: number }> {
    const { data } = await apiClient.get<{ badge: AdminBadge; awardCount: number }>(
      `/badges/admin/badge/${badgeId}`
    );
    return data;
  },

  /**
   * Update badge information
   * API returns: { success: true, message: "...", data: {...} }
   * After apiClient interceptor: { message: "...", data: {...} }
   */
  async updateBadge(badgeId: string, payload: UpdateBadgePayload): Promise<AdminBadge> {
    const { data } = await apiClient.put<{ message: string; data: AdminBadge }>(
      `/badges/admin/${badgeId}`,
      payload
    );
    return data.data;
  },
};

export type TeamMember = {
  id: string;
  teamId: string;
  userId: string;
  role: "MEMBER" | "LEAD";
  joinedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
};

export type Team = {
  id: string;
  name: string;
  school: string;
  /** Team lead region (list endpoints), when available. */
  region?: string | null;
  projectTitle?: string;
  description?: string;
  profileImage?: string;
  /** Set on list endpoints when members are not embedded (lighter payload). */
  memberCount?: number;
  /** Required-template deliverables submitted / total (list endpoints). */
  deliverableSubmitted?: number;
  deliverableTotal?: number;
  /** Reviewer slots filled (max 3 per team for judging). */
  reviewerAssignmentCount?: number;
  members?: Array<{
    id: string;
    userId: string;
    role: "MEMBER" | "LEAD";
    user?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePhoto?: string;
    };
  }>;
  deliverables?: TeamDeliverable[];
  createdAt: string;
};

export type TeamsResponse = {
  success: true;
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number | null;
    totalPages: number | null;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type DeliverableTemplate = {
  id: string;
  title: string;
  description: string;
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION" | "CUSTOM";
  customType?: string;
  contentType: "TEXT" | "FILE" | "URL";
  hackathonId?: string;
  dueDate?: string;
  required: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeliverableTemplatePayload = {
  title: string;
  description: string;
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION" | "CUSTOM";
  customType?: string;
  contentType: "TEXT" | "FILE" | "URL";
  hackathonId?: string;
  dueDate?: string;
  required: boolean;
};

export type TeamDeliverable = {
  id: string;
  teamId: string;
  team?: {
    name: string;
  };
  teamName?: string; // Legacy support
  projectTitle?: string;
  templateId: string;
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION" | "CUSTOM";
  contentType?: "TEXT" | "FILE" | "URL";
  content?: string; // For TEXT or URL content
  fileUrl?: string; // For FILE content (legacy)
  description?: string;
  // Dual status system
  submissionStatus: "NOT_SUBMITTED" | "SUBMITTED";
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  // Legacy status field (deprecated, use reviewStatus)
  status?: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt?: string;
  reviewedAt?: string;
  feedback?: string;
  hackathonId?: string;
  template?: {
    id: string;
    title: string;
    description: string;
    contentType: "TEXT" | "FILE" | "URL";
    dueDate?: string;
    required?: boolean;
    type?: string;
    customType?: string | null;
  };
};

export type GDriveAccessResult = {
  isGoogleDrive: boolean;
  fileId: string | null;
  isFolder: boolean;
  accessible: boolean | null;
  error?: string;
};

export type GDriveAccessCheckItem = {
  deliverableId: string;
  teamId: string;
  teamName: string;
  teamSchool: string;
  teamRegion: string;
  members: Array<{
    name: string;
    email: string;
    phone: string;
    school: string;
    region: string;
    role: string;
  }>;
  templateTitle: string;
  templateId: string;
  content: string;
  contentType: string;
  submissionStatus: string;
  reviewStatus: string;
  accessResult: GDriveAccessResult;
};

export type GDriveAccessCheckResult = {
  stats: {
    total: number;
    googleDriveLinks: number;
    accessible: number;
    notAccessible: number;
    checkFailed: number;
    nonGoogleDrive: number;
  };
  items: GDriveAccessCheckItem[];
};

export type DeliverableFilters = {
  submissionStatus?: "NOT_SUBMITTED" | "SUBMITTED";
  reviewStatus?: "PENDING" | "APPROVED" | "REJECTED";
  teamId?: string;
  templateId?: string;
  status?: string; // Legacy filter support
  hackathon?: string; // Legacy filter support
  search?: string;
};

export type AdminBadge = {
  id: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string | null;
  category: "POINTS" | "SOCIAL" | "ACHIEVEMENT" | "MILESTONE" | "SPECIAL";
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  points: number;
  rarity: number; // 1-100
  criteria: string; // JSON string
};

export type UpdateBadgePayload = {
  name?: string;
  description?: string;
  icon?: string;
  imageUrl?: string | null;
  category?: "POINTS" | "SOCIAL" | "ACHIEVEMENT" | "MILESTONE" | "SPECIAL";
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  points?: number;
  rarity?: number;
  criteria?: string;
};
