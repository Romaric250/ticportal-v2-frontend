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

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getStats(): Promise<AdminStats> {
    const { data } = await apiClient.get<AdminStatsResponse>("/admin/stats");
    return data.stats;
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
};

