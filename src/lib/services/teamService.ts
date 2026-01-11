import { apiClient, tokenStorage } from "../api-client";
import axios from "axios";

export type TeamDeliverable = {
  id: string;
  teamId: string;
  templateId: string; // Reference to deliverable template
  content: string; // File URL, external URL, or text content (empty initially)
  contentType?: "FILE" | "URL" | "TEXT";
  description?: string;
  // Dual status system
  submissionStatus: "NOT_SUBMITTED" | "SUBMITTED";
  reviewStatus: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt?: string;
  feedback?: string;
  reviewedAt?: string;
  template: {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    contentType: "FILE" | "URL" | "TEXT";
    required: boolean;
  };
  // Legacy fields for backward compatibility
  status?: "PENDING" | "APPROVED" | "REJECTED"; // Deprecated, use reviewStatus
  type?: "PROPOSAL" | "PROTOTYPE" | "FINAL_SUBMISSION" | "DOCUMENTATION" | "CUSTOM";
  fileUrl?: string;
  hackathonId?: string;
};

export type DeliverableDeadlineStatus = {
  passed: boolean;
  dueDate: string;
  timeRemaining: string;
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

export type Team = {
  id: string;
  name: string;
  school: string;
  projectTitle?: string;
  description?: string;
  profileImage?: string;
  createdAt: string;
  members?: TeamMember[];
  unreadCount?: number; // Unread message count (included in /teams/my response)
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

export type CreateTeamPayload = {
  name: string;
  school: string;
  projectTitle?: string;
  description?: string;
  profileImage?: string; // Base64 data URL
};

export type UpdateTeamPayload = {
  name?: string;
  projectTitle?: string;
  description?: string;
  profileImage?: string; // Base64 data URL
};

export type AddMemberPayload = {
  userId: string;
  role: "MEMBER" | "LEAD";
};

export type UpdateMemberRolePayload = {
  role: "MEMBER" | "LEAD";
};

export type TeamChatMessage = {
  id: string;
  message: string;
  attachments?: string[];
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  createdAt: string;
};

export type SendChatMessagePayload = {
  message: string;
  attachments?: string[];
};

export type TeamJoinRequest = {
  id: string;
  teamId: string;
  userId: string;
  message?: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  team?: {
    id: string;
    name: string;
    school?: string;
    profileImage?: string;
    projectTitle?: string;
  };
};

export type RequestToJoinPayload = {
  message?: string;
};

export type UpdateJoinRequestPayload = {
  action: "accept" | "reject";
};

export const teamService = {
  /**
   * Get all teams (paginated)
   */
  async getAllTeams(page: number = 1, limit: number = 20) {
    const { data } = await apiClient.get<{
      data: Team[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/teams?page=${page}&limit=${limit}`);
    return data;
  },

  /**
   * Get teams the authenticated user belongs to
   */
  async getMyTeams(): Promise<Team[]> {
    const { data } = await apiClient.get<Team[]>("/teams/my");
    return data;
  },

  /**
   * Get team by ID
   */
  async getTeamById(id: string): Promise<Team> {
    const { data } = await apiClient.get<Team>(`/teams/${id}`);
    return data;
  },

  /**
   * Create a new team
   */
  async createTeam(payload: CreateTeamPayload): Promise<Team> {
    const { data } = await apiClient.post<Team>("/teams", payload);
    return data;
  },

  /**
   * Update team details (only team leads)
   */
  async updateTeam(teamId: string, payload: UpdateTeamPayload): Promise<Team> {
    const { data } = await apiClient.put<Team>(`/teams/${teamId}`, payload);
    return data;
  },

  /**
   * Delete a team (only team leads, cannot delete teams with submissions)
   */
  async deleteTeam(teamId: string): Promise<void> {
    await apiClient.delete(`/teams/${teamId}`);
  },

  /**
   * Add a member to the team (only team leads)
   */
  async addMember(teamId: string, payload: AddMemberPayload): Promise<TeamMember> {
    const { data } = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, payload);
    return data;
  },

  /**
   * Update member role (only team leads)
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    payload: UpdateMemberRolePayload
  ): Promise<TeamMember> {
    const { data } = await apiClient.put<TeamMember>(
      `/teams/${teamId}/members/${memberId}/role`,
      payload
    );
    return data;
  },

  /**
   * Remove a member from the team
   */
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
  },

  /**
   * Get team chat messages
   */
  async getTeamChats(teamId: string, page: number = 1, limit: number = 50) {
    const { data } = await apiClient.get<{
      data: TeamChatMessage[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/teams/${teamId}/chats?page=${page}&limit=${limit}`);
    return data;
  },

  /**
   * Send a chat message
   */
  async sendChatMessage(teamId: string, payload: SendChatMessagePayload): Promise<TeamChatMessage> {
    const { data } = await apiClient.post<TeamChatMessage>(`/teams/${teamId}/chats`, payload);
    return data;
  },

  /**
   * Search teams (for joining)
   */
  async searchTeams(query: string, page: number = 1, limit: number = 20) {
    // The API returns { success: true, data: Team[], pagination: {...} }
    // The apiClient interceptor extracts response.data.data, so we need to get the raw response
    // Use axios directly to bypass the interceptor's data extraction
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
    
    const token = tokenStorage.getAccessToken();
    const response = await axios.get(`${apiBaseUrl}/teams/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    });
    
    // Handle the response format: { success: true, data: Team[], pagination: {...} }
    const responseData = response.data;
    if (responseData?.success && responseData?.data) {
      return {
        data: responseData.data,
        pagination: responseData.pagination || {
          page,
          limit,
          total: responseData.data.length,
          totalPages: 1,
        },
      };
    }
    
    // Fallback if structure is different
    return {
      data: Array.isArray(responseData) ? responseData : (responseData?.data || []),
      pagination: responseData?.pagination || {
        page,
        limit,
        total: Array.isArray(responseData) ? responseData.length : (responseData?.data?.length || 0),
        totalPages: 1,
      },
    };
  },

  /**
   * Request to join a team
   */
  async requestToJoin(teamId: string, payload?: RequestToJoinPayload): Promise<TeamJoinRequest> {
    const { data } = await apiClient.post<TeamJoinRequest>(
      `/teams/${teamId}/join-request`,
      payload || {}
    );
    return data;
  },

  /**
   * Get my pending join requests
   */
  async getMyJoinRequests(): Promise<TeamJoinRequest[]> {
    const { data } = await apiClient.get<TeamJoinRequest[]>("/teams/join-requests/my");
    // The interceptor should extract the array, but handle both cases
    if (Array.isArray(data)) {
      return data;
    }
    // If interceptor didn't extract (shouldn't happen), try to get data.data
    if (data && typeof data === "object" && "data" in data) {
      const nestedData = (data as { data: unknown }).data;
      if (Array.isArray(nestedData)) {
        return nestedData;
      }
    }
    // Fallback: return empty array
    console.warn("Unexpected response format from getMyJoinRequests:", data);
    return [];
  },

  /**
   * Get join requests for a team (team leads only)
   */
  async getTeamJoinRequests(teamId: string): Promise<TeamJoinRequest[]> {
    const { data } = await apiClient.get<TeamJoinRequest[]>(`/teams/${teamId}/join-requests`);
    return data;
  },

  /**
   * Accept or reject a join request (team leads only)
   */
  async updateJoinRequest(
    teamId: string,
    requestId: string,
    payload: UpdateJoinRequestPayload
  ): Promise<TeamJoinRequest> {
    const { data } = await apiClient.post<TeamJoinRequest>(
      `/teams/${teamId}/join-requests/${requestId}`,
      payload
    );
    return data;
  },

  /**
   * Get total unread message count across all teams
   */
  async getTotalUnreadCount(): Promise<number> {
    const { data } = await apiClient.get<{ totalUnread: number }>("/teams/chats/total-unread");
    return data.totalUnread;
  },

  /**
   * Get unread count for a specific team
   */
  async getTeamUnreadCount(teamId: string): Promise<number> {
    const { data } = await apiClient.get<{ unreadCount: number }>(`/teams/${teamId}/chats/unread-count`);
    return data.unreadCount;
  },

  /**
   * Get unread counts for all teams (dictionary of teamId -> count)
   */
  async getUnreadCounts(): Promise<Record<string, number>> {
    const { data } = await apiClient.get<Record<string, number>>("/teams/chats/unread-counts");
    return data;
  },

  /**
   * Mark messages as read for a team
   * @param teamId - Team ID
   * @param messageIds - Optional array of specific message IDs to mark as read. If omitted, marks all as read.
   */
  async markMessagesAsRead(teamId: string, messageIds?: string[]): Promise<{ markedCount: number }> {
    const { data } = await apiClient.post<{ markedCount: number }>(
      `/teams/${teamId}/chats/mark-read`,
      messageIds ? { messageIds } : {}
    );
    return data;
  },

  /**
   * Get team deliverables (new API structure)
   */
  async getTeamDeliverables(teamId: string): Promise<TeamDeliverable[]> {
    const { data } = await apiClient.get<{ success: boolean; data: TeamDeliverable[] }>(
      `/deliverables/team/${teamId}`
    );
    const deliverables = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
    // Normalize deliverables to ensure consistent structure
    return deliverables.map((deliverable: any) => ({
      ...deliverable,
      submissionStatus: deliverable.submissionStatus || (deliverable.content && deliverable.content.length > 0 ? "SUBMITTED" : "NOT_SUBMITTED"),
      reviewStatus: deliverable.reviewStatus || deliverable.status || "PENDING",
      status: deliverable.reviewStatus || deliverable.status || "PENDING", // Legacy support
    }));
  },

  /**
   * Get single deliverable details
   */
  async getDeliverableDetails(deliverableId: string, teamId: string): Promise<TeamDeliverable> {
    const { data } = await apiClient.get<{ success: boolean; data: TeamDeliverable }>(
      `/deliverables/${deliverableId}?teamId=${teamId}`
    );
    return data.data || data;
  },

  /**
   * Check deadline status for a deliverable
   */
  async checkDeadline(deliverableId: string): Promise<DeliverableDeadlineStatus> {
    const { data } = await apiClient.get<{ success: boolean; data: DeliverableDeadlineStatus }>(
      `/deliverables/${deliverableId}/deadline`
    );
    return data.data || data;
  },

  /**
   * Submit or update deliverable (handles both first submission and updates)
   */
  async submitDeliverable(
    deliverableId: string,
    payload: {
      teamId: string;
      content: string; // File URL, external URL, or text content
      contentType: "FILE" | "URL" | "TEXT";
      description?: string;
    }
  ): Promise<TeamDeliverable> {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: TeamDeliverable }>(
      `/deliverables/${deliverableId}/submit`,
      payload
    );
    return data.data;
  },

  /**
   * Upload file for deliverable (helper to upload file first, then submit)
   */
  async uploadFileForDeliverable(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const token = tokenStorage.getAccessToken();
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
    const response = await axios.post<{ url: string }>(
      `${apiBaseUrl}/upload`, // Assuming there's an upload endpoint
      formData,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.url;
  },

  /**
   * Get available deliverable templates for team (legacy - may not be needed with new structure)
   */
  async getAvailableDeliverableTemplates(): Promise<DeliverableTemplate[]> {
    const { data } = await apiClient.get<DeliverableTemplate[]>("/teams/deliverable-templates");
    return data;
  },

  /**
   * Delete a deliverable submission
   */
  async deleteDeliverable(deliverableId: string, teamId: string): Promise<void> {
    await apiClient.delete(`/deliverables/${deliverableId}`, {
      data: { teamId },
    });
  },
};

