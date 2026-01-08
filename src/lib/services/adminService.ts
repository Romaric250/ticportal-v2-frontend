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
    const { data } = await apiClient.get<{ success: true; data: DashboardStats }>("/admin/dashboard-stats");
    return data.data;
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
   * Get team deliverables (admin view)
   */
  async getTeamDeliverables(filters?: {
    status?: string;
    hackathon?: string;
    search?: string;
  }): Promise<TeamDeliverable[]> {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== "All Statuses") {
      params.append("status", filters.status);
    }
    if (filters?.hackathon && filters.hackathon !== "All Hackathons") {
      params.append("hackathon", filters.hackathon);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const { data } = await apiClient.get<TeamDeliverable[]>(
      `/admin/teams/deliverables?${params.toString()}`
    );
    return data;
  },

  /**
   * Approve deliverable
   */
  async approveDeliverable(deliverableId: string): Promise<void> {
    await apiClient.post(`/admin/teams/deliverables/${deliverableId}/approve`);
  },

  /**
   * Reject deliverable
   */
  async rejectDeliverable(deliverableId: string, reason: string): Promise<void> {
    await apiClient.post(`/admin/teams/deliverables/${deliverableId}/reject`, { reason });
  },

  /**
   * Get deliverable templates (admin-created requirements)
   */
  async getDeliverableTemplates(): Promise<DeliverableTemplate[]> {
    const { data } = await apiClient.get<DeliverableTemplate[]>("/admin/deliverable-templates");
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
      file: File;
      description?: string;
    }
  ): Promise<TeamDeliverable> {
    const formData = new FormData();
    formData.append("templateId", payload.templateId);
    formData.append("file", payload.file);
    if (payload.description) {
      formData.append("description", payload.description);
    }

    const token = tokenStorage.getAccessToken();
    const response = await axios.post<TeamDeliverable>(
      `${apiBaseUrl}/admin/teams/${teamId}/deliverables`,
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
    const { data } = await apiClient.get<{ success: true; data: Team }>(`/admin/teams/${teamId}`);
    return data.data;
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
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION";
  hackathonId?: string;
  dueDate?: string;
  required: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateDeliverableTemplatePayload = {
  title: string;
  description: string;
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION";
  hackathonId?: string;
  dueDate?: string;
  required: boolean;
};

export type TeamDeliverable = {
  id: string;
  teamId: string;
  teamName: string;
  projectTitle: string;
  type: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION";
  fileUrl: string;
  description?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  feedback?: string;
  hackathonId?: string;
};

