import { apiClient } from "../api-client";

export type Team = {
  id: string;
  name: string;
  squadId: string;
  projectTitle?: string;
  description?: string;
  profileImage?: string;
  createdAt: string;
  members?: TeamMember[];
  squad?: {
    id: string;
    name: string;
  };
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
};


