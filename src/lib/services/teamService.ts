import { apiClient, tokenStorage } from "../api-client";
import axios from "axios";

export type Team = {
  id: string;
  name: string;
  school: string;
  projectTitle?: string;
  description?: string;
  profileImage?: string;
  createdAt: string;
  members?: TeamMember[];
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
    profileImage?: string;
  };
};

export type RequestToJoinPayload = {
  message?: string;
};

export type UpdateJoinRequestPayload = {
  status: "ACCEPTED" | "REJECTED";
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
    return data;
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
};


