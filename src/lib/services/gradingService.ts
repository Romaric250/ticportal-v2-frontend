import { apiClient } from "../api-client";

export type GradingRubric = {
  id: string;
  name: string;
  description: string | null;
  sections: unknown;
  maxScore: number;
  isActive: boolean;
};

export type ReviewerRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isReviewer: boolean;
  region?: string | null;
  school?: string | null;
};

export type PendingTeam = {
  teamId: string;
  teamName: string;
  projectTitle: string | null;
  assignmentCount: number;
  gradeCount: number;
  submittedCount: number;
  hasFinal: boolean;
  status: string;
  score1: number | null;
  score2: number | null;
  score3: number | null;
  canFinalize: boolean;
};

export type ReviewerDashboardData = {
  reviewer: { id: string; name: string; email: string };
  assignedTeams: Array<{
    teamId: string;
    teamName: string;
    projectTitle: string | null;
    deliverables: Array<{
      id: string;
      type: string;
      contentType: string;
      content: string;
      submissionStatus: string;
      templateTitle?: string;
    }>;
    grade: {
      id: string;
      status: string;
      sectionScores: unknown;
      totalScore: number | null;
      feedback?: string | null;
    } | null;
    pairedReviewer: { name: string; submitted: boolean } | null;
    otherReviewers?: { name: string; submitted: boolean }[];
  }>;
  stats: { totalAssigned: number; completed: number; pending: number };
};

export type GradingReportReviewer = {
  reviewerId: string;
  reviewerName: string;
  email: string;
  totalScore: number | null;
  status: string;
  feedback: string | null;
};

export type GradingReportTeamRow = {
  teamId: string;
  teamName: string;
  school: string;
  region?: string | null;
  projectTitle: string | null;
  assignmentCount: number;
  /** Stored when admin finalizes (optional). */
  finalScore: number | null;
  reviewerAverageScore: number | null;
  publishedAt: string | null;
  /** Live ranking order: 1 = highest final. */
  rank: number;
  score1?: number | null;
  score2?: number | null;
  score3?: number | null;
  /** Computed 0–100 total (weighted rubric avg + LB); use for display as Final. */
  blendFinal?: number | null;
  normalizedLeaderboard?: number;
  rawLeaderboardPoints?: number;
  leaderboardWeightPercent?: number;
  /** Wtd rev: unweighted Rev avg × (100−w)% — must sum with LB pts to equal Final when both reviews are in. */
  reviewerContributionPoints?: number | null;
  /** Points toward final 0–100 from leaderboard (normalized LB × w%). */
  leaderboardContributionPoints?: number;
  reviewers: GradingReportReviewer[];
};

export type GradingReportPayload = {
  teams: GradingReportTeamRow[];
  generatedAt: string;
};

export type GradingReportTeamDetail = {
  teamId: string;
  teamName: string;
  teamSchool: string;
  projectTitle: string | null;
  description: string | null;
  createdAt: string;
  members: Array<{
    role: string;
    joinedAt: string;
    userId: string;
    name: string;
    email: string;
    school: string | null;
    region: string | null;
    country: string | null;
    grade: string | null;
  }>;
};

export type LeaderboardTeamReportRow = {
  rank: number;
  teamId: string;
  teamName: string;
  rawLeaderboardPoints: number;
  /** Normalized leaderboard 0–100 (input to the blend). */
  normalizedLeaderboard: number;
  leaderboardPointsMax: number;
  leaderboardWeightPercent: number;
  score1: number | null;
  score2: number | null;
  score3: number | null;
  region?: string | null;
  reviewerAverageScore: number | null;
  /** Blended 0–100 (final when set, else live preview). */
  blendFinal: number | null;
  reviewerContributionPoints: number | null;
  leaderboardContributionPoints: number;
  finalGrade: {
    finalScore: number;
    reviewerAverageScore: number;
    leaderboardScoreNormalized: number;
    leaderboardWeightPercent: number;
    publishedAt: string | null;
  } | null;
};

export type LeaderboardTeamsPageResponse = {
  teams: LeaderboardTeamReportRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

/**
 * apiClient usually unwraps `{ success, data }`, but when `data` is `null` the interceptor leaves the full body.
 * Normalize both shapes.
 */
function unwrap<T>(r: { data: unknown }): T {
  const d = r.data as { success?: boolean; data?: T } | T;
  if (d && typeof d === "object" && !Array.isArray(d) && "success" in d && Object.prototype.hasOwnProperty.call(d, "data")) {
    return (d as { data: T }).data as T;
  }
  return d as T;
}

export const gradingService = {
  getRubric: () => apiClient.get("/grading/rubric").then((r) => unwrap<GradingRubric | null>(r)),

  saveRubric: (payload: {
    name: string;
    description?: string | null;
    sections: unknown;
    maxScore?: number;
    rubricId?: string | null;
  }) => apiClient.post("/grading/rubric", payload).then((r) => unwrap<GradingRubric>(r)),

  setReviewer: (userId: string, isReviewer: boolean) =>
    apiClient.post(`/admin/users/${userId}/reviewer`, { isReviewer }).then((r) => unwrap<unknown>(r)),

  listReviewers: () => apiClient.get("/admin/users/reviewers").then((r) => unwrap<ReviewerRow[]>(r)),

  reviewerWorkload: () => apiClient.get("/admin/reviewers/workload").then((r) => unwrap<unknown[]>(r)),

  pendingGrades: () => apiClient.get("/admin/teams/pending-grades").then((r) => unwrap<PendingTeam[]>(r)),

  autoAssign: (body?: {
    excludeReviewerIds?: string[];
    teamIds?: string[];
    sendMail?: boolean;
    excludeReviewersSameRegionAsTeam?: boolean;
  }) =>
    apiClient
      .post(
        "/admin/assignments/auto",
        body ?? {},
        /** Auto-assign can touch many teams; avoid client abort before the server finishes. */
        { timeout: 300_000 }
      )
      .then((r) =>
        unwrap<{
          assigned: number;
          teams?: { teamId: string; reviewerIds: string[] }[];
          skipped?: { teamId: string; reason: string }[];
          errors?: { teamId: string; teamName: string | null; message: string }[];
          warnings?: { teamId: string; teamName: string | null; message: string }[];
        }>(r)
      ),

  bulkAssignSameReviewers: (body: {
    teamIds: string[];
    reviewerIds: string[];
    sendMail?: boolean;
    rejectReviewersFromTeamRegion?: boolean;
  }) =>
    apiClient
      .post("/admin/assignments/bulk-same-reviewers", body, { timeout: 300_000 })
      .then((r) =>
        unwrap<{
          assigned: number;
          teams: { teamId: string; reviewerIds: string[] }[];
          errors: { teamId: string; message: string }[];
          warnings?: { teamId: string; message: string }[];
        }>(r)
      ),

  manualAssign: (assignments: { teamId: string; reviewerIds: string[] }[], sendMail?: boolean) =>
    apiClient
      .post("/admin/assignments/manual", { assignments, sendMail })
      .then((r) =>
        unwrap<{
          assigned: number;
          teams: { teamId: string; reviewerIds: string[] }[];
          warnings?: { teamId: string; message: string }[];
        }>(r)
      ),

  unassignReviewer: (
    teamId: string,
    reviewerId: string,
    opts?: { replacementReviewerId?: string | null; sendMail?: boolean }
  ) =>
    apiClient
      .post("/admin/assignments/unassign", {
        teamId,
        reviewerId,
        replacementReviewerId: opts?.replacementReviewerId,
        sendMail: opts?.sendMail,
      })
      .then((r) => unwrap<unknown>(r)),

  /** Reviewers currently assigned to a team (0–3 rows). Used to pre-fill manual assign. */
  assignmentsForTeam: (teamId: string) =>
    apiClient
      .get(`/admin/assignments/team/${encodeURIComponent(teamId)}`)
      .then(
        (r) =>
          unwrap<
            { reviewerId: string; firstName: string; lastName: string; email: string }[]
          >(r)
      ),

  listAssignments: () => apiClient.get("/admin/assignments").then((r) => unwrap<unknown>(r)),

  reviewerAssignments: () => apiClient.get("/reviewer/assignments").then((r) => unwrap<unknown>(r)),

  submitGrade: (teamId: string, sectionScores: Record<string, unknown>, feedback?: string | null) =>
    apiClient
      .post(`/grading/teams/${teamId}/submit`, { sectionScores, feedback: feedback ?? null })
      .then((r) => unwrap<unknown>(r)),

  getTeamReviews: (teamId: string) =>
    apiClient.get(`/grading/teams/${teamId}/reviews`).then((r) => unwrap<unknown>(r)),

  finalize: (teamId: string) =>
    apiClient.post(`/grading/teams/${teamId}/finalize`).then((r) =>
      unwrap<{
        finalScore: number;
        reviewerAverageScore: number;
        scoreDifferenceWarning?: string | null;
      }>(r)
    ),

  publish: (teamId: string) => apiClient.post(`/grading/teams/${teamId}/publish`).then((r) => unwrap<unknown>(r)),

  leaderboardConfigGet: () =>
    apiClient
      .get("/admin/leaderboard/config")
      .then((r) =>
        unwrap<{
          id: string;
          leaderboardScorePercent: number;
          leaderboardPointsMax?: number | null;
          maxTeamsPerReviewer?: number | null;
        }>(r)
      ),

  leaderboardConfigPost: (payload: {
    leaderboardScorePercent?: number;
    leaderboardPointsMax?: number;
    maxTeamsPerReviewer?: number | null;
  }) => apiClient.post("/admin/leaderboard/config", payload).then((r) => unwrap<unknown>(r)),

  leaderboardTeams: (params?: { page?: number; limit?: number; region?: string }) =>
    apiClient
      .get("/admin/leaderboard/teams", { params })
      .then((r) => unwrap<LeaderboardTeamsPageResponse>(r)),

  finalizeBulk: (teamIds: string[]) =>
    apiClient
      .post("/admin/grading/finalize-bulk", { teamIds })
      .then((r) => unwrap<{ succeeded: string[]; failed: { teamId: string; message: string }[] }>(r)),

  leaderboardApply: (teamId?: string) =>
    apiClient.post("/admin/leaderboard/apply", teamId ? { teamId } : {}).then((r) => unwrap<unknown>(r)),

  reviewerDashboard: () =>
    apiClient.get("/reviewer/dashboard").then((r) => unwrap<ReviewerDashboardData>(r)),

  /** Reports can exceed the default 120s client cap on large datasets; keep a higher ceiling so a slow 200 still resolves. */
  gradingReports: (params?: { region?: string }) =>
    apiClient
      .get("/admin/grading/reports", { params, timeout: 300_000 })
      .then((r) => unwrap<GradingReportPayload>(r)),

  gradingReportTeamDetail: (teamId: string) =>
    apiClient.get(`/admin/grading/reports/teams/${encodeURIComponent(teamId)}/detail`).then((r) => unwrap<GradingReportTeamDetail>(r)),

  adminDeleteGrade: (teamId: string, reviewerId: string) =>
    apiClient
      .delete(`/admin/grades/${encodeURIComponent(teamId)}/${encodeURIComponent(reviewerId)}`)
      .then((r) => unwrap<{ deleted: boolean; gradeId: string }>(r)),
};
