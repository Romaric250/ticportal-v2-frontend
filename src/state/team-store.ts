import { createPersistedStore } from "./store-config";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "leader" | "member";
  avatar?: string;
  online?: boolean;
};

export type Team = {
  id: string;
  name: string;
  tagline?: string;
  members: TeamMember[];
  mentor?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string; // ISO string for serialization
};

type TeamState = {
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  addMember: (member: TeamMember) => void;
  removeMember: (memberId: string) => void;
  updateMember: (memberId: string, updates: Partial<TeamMember>) => void;
  setMentor: (mentor: Team["mentor"]) => void;
};

/**
 * Team store with persistence
 * Team data persists across page refreshes
 */
export const useTeamStore = createPersistedStore<TeamState>(
  "tic-team",
  (set) => ({
    currentTeam: null,
    setCurrentTeam: (team) => set({ currentTeam: team }),
    addMember: (member) =>
      set((state) => {
        if (!state.currentTeam) return state;
        return {
          currentTeam: {
            ...state.currentTeam,
            members: [...state.currentTeam.members, member],
          },
        };
      }),
    removeMember: (memberId) =>
      set((state) => {
        if (!state.currentTeam) return state;
        return {
          currentTeam: {
            ...state.currentTeam,
            members: state.currentTeam.members.filter((m) => m.id !== memberId),
          },
        };
      }),
    updateMember: (memberId, updates) =>
      set((state) => {
        if (!state.currentTeam) return state;
        return {
          currentTeam: {
            ...state.currentTeam,
            members: state.currentTeam.members.map((m) =>
              m.id === memberId ? { ...m, ...updates } : m
            ),
          },
        };
      }),
    setMentor: (mentor) =>
      set((state) => {
        if (!state.currentTeam) return state;
        return {
          currentTeam: {
            ...state.currentTeam,
            mentor,
          },
        };
      }),
  }),
  {
    partialize: (state) => ({ currentTeam: state.currentTeam }),
  }
);

