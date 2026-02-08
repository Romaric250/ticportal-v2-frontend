import { apiClient } from "../api-client";
import axios from "axios";
import { tokenStorage } from "../api-client";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

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
    if (filters?.jurisdiction && filters.jurisdiction !== "All Areas") {
      params.append("jurisdiction", filters.jurisdiction);
    }
    if (filters?.status && filters.status !== "All Statuses") {
      params.append("status", filters.status);
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
  async createUser(payload: CreateUserPayload): Promise<AdminUser> {
    const { data } = await apiClient.post<AdminUser>("/admin/users", payload);
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
    const token = tokenStorage.getAccessToken();

    // If contentType is FILE, convert to base64 and upload first
    if (payload.contentType === "FILE" && payload.file) {
      // Convert file to base64 data URL
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to convert file to base64"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(payload.file!);
      });

      // Upload file to get URL
      const uploadResponse = await axios.post<{
        success: boolean;
        data: {
          url: string;
          key: string;
          name: string;
          size: number;
        };
      }>(
        `${apiBaseUrl}/f/upload`,
        {
          file: base64Data,
          fileName: payload.file.name,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      // Now submit the deliverable with the file URL
      const response = await axios.post<TeamDeliverable>(
        `${apiBaseUrl}/admin/teams/${teamId}/deliverables`,
        {
          templateId: payload.templateId,
          contentType: payload.contentType,
          content: uploadResponse.data.data.url,
          description: payload.description,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } else {
      // For TEXT or URL, use JSON
      const response = await axios.post<TeamDeliverable>(
        `${apiBaseUrl}/admin/teams/${teamId}/deliverables`,
        {
          templateId: payload.templateId,
          content: payload.content || "",
          contentType: payload.contentType,
          description: payload.description,
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    }
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
    }
  ): Promise<TeamsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.school) {
      params.append("school", filters.school);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }

    const { data } = await apiClient.get<TeamsResponse>(`/admin/teams?${params.toString()}`);
    return data;
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
  projectTitle?: string;
  description?: string;
  profileImage?: string;
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
  createdAt: string;
};

export type TeamsResponse = {
  success: true;
  teams: Team[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
  };
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
