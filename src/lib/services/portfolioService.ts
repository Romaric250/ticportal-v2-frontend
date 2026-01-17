import { apiClient } from "../api-client";

export type PortfolioProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  school?: string;
  grade?: number;
  level: number;
  levelTitle: string;
  totalXP: number;
  globalRank: number;
  hoursLogged: number;
  bio?: string;
};

export type HackathonJourneyPhase = {
  id: string;
  phase: string;
  status: "completed" | "in_progress" | "pending";
  completedAt?: string;
  startedAt?: string;
  description: string;
  tags?: string[];
  icon: string;
  progress: number;
  modulesCompleted?: number;
  totalModules?: number;
  teamMembers?: Array<{
    id: string;
    name: string;
    avatarUrl?: string;
    initials: string;
  }>;
};

export type FeaturedProject = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  imageUrl?: string;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  hackathonId?: string;
  hackathonName?: string;
  teamId?: string;
  teamName?: string;
} | null;

export type Certification = {
  id: string;
  title: string;
  issuer: string;
  description: string;
  issuedAt: string;
  certificateUrl?: string | null;
  icon: string;
  type: string;
};

export type PortfolioBadge = {
  id: string;
  badgeId: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: string | null;
  locked: boolean;
  points: number;
  category: string;
  tier: string;
};

export type MentorFeedback = {
  id: string;
  mentor: {
    id: string;
    name: string;
    avatarUrl?: string;
    title?: string;
    company?: string;
  };
  feedback: string;
  createdAt: string;
  rating?: number;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: string;
};

export type PortfolioData = {
  profile: PortfolioProfile;
  hackathonJourney: HackathonJourneyPhase[];
  featuredProject: FeaturedProject;
  certifications: Certification[];
  badges: PortfolioBadge[];
  mentorFeedback: MentorFeedback[];
  skills: Skill[];
};

export const portfolioService = {
  async getPortfolio(): Promise<PortfolioData> {
    const response = await apiClient.get<{ success: boolean; data: PortfolioData }>("/portfolio");
    return response.data as unknown as PortfolioData;
  },
};
