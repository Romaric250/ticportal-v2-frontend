import { apiClient } from "../api-client";

export type LearningPathAudience = "STUDENTS" | "MENTORS" | "EVERYONE";

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
};

export type Module = {
  id: string;
  title: string;
  content: string; // JSON string from novel.sh editor
  order: number;
  quiz?: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
  // Student-specific fields
  hasQuiz?: boolean;
  isCompleted?: boolean;
  completedAt?: string | null;
  quizScore?: number | null;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  audience: LearningPathAudience;
  isCore: boolean;
  modules?: Module[];
  createdAt: string;
  updatedAt: string;
};

export type CreateLearningPathPayload = {
  title: string;
  description: string;
  audience: LearningPathAudience;
  isCore: boolean;
};

export type CreateModulePayload = {
  title: string;
  content: string; // JSON string from novel.sh
  order: number;
  quiz?: QuizQuestion[];
};

export type UpdateModulePayload = {
  title?: string;
  content?: string;
  order?: number;
  quiz?: QuizQuestion[];
};

export const learningPathService = {
  /**
   * Get all learning paths
   */
  async getAll(): Promise<LearningPath[]> {
    const { data } = await apiClient.get<LearningPath[]>("/admin/learning-paths");
    return data;
  },

  /**
   * Get learning path by ID
   */
  async getById(id: string): Promise<LearningPath> {
    const { data } = await apiClient.get<LearningPath>(`/admin/learning-paths/${id}`);
    return data;
  },

  /**
   * Create learning path
   */
  async create(payload: CreateLearningPathPayload): Promise<LearningPath> {
    const { data } = await apiClient.post<LearningPath>("/admin/learning-paths", payload);
    return data;
  },

  /**
   * Update learning path
   */
  async update(id: string, payload: Partial<CreateLearningPathPayload>): Promise<LearningPath> {
    const { data } = await apiClient.put<LearningPath>(`/admin/learning-paths/${id}`, payload);
    return data;
  },

  /**
   * Delete learning path
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/learning-paths/${id}`);
  },

  /**
   * Add module to learning path
   */
  async addModule(
    learningPathId: string,
    payload: CreateModulePayload
  ): Promise<Module> {
    const { data } = await apiClient.post<Module>(
      `/admin/learning-paths/${learningPathId}/modules`,
      payload
    );
    return data;
  },

  /**
   * Update module
   */
  async updateModule(
    learningPathId: string,
    moduleId: string,
    payload: UpdateModulePayload
  ): Promise<Module> {
    const { data } = await apiClient.put<Module>(
      `/admin/learning-paths/${learningPathId}/modules/${moduleId}`,
      payload
    );
    return data;
  },

  /**
   * Delete module
   */
  async deleteModule(learningPathId: string, moduleId: string): Promise<void> {
    await apiClient.delete(
      `/admin/learning-paths/${learningPathId}/modules/${moduleId}`
    );
  },

  // Student endpoints
  /**
   * Get all learning paths available to students
   */
  async getStudentPaths(): Promise<LearningPath[]> {
    const { data } = await apiClient.get<LearningPath[]>("/learning-paths");
    return data;
  },

  /**
   * Get learning path by ID (student view)
   */
  async getStudentPathById(id: string): Promise<LearningPath> {
    const { data } = await apiClient.get<LearningPath>(`/learning-paths/${id}`);
    return data;
  },

  /**
   * Enroll in a learning path
   */
  async enrollInPath(pathId: string): Promise<{ id: string; userId: string; learningPathId: string; enrolledAt: string; isAutoEnrolled: boolean }> {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: any }>(`/learning-paths/${pathId}/enroll`);
    return data.data;
  },

  /**
   * Submit quiz answers for a module
   */
  async submitQuiz(pathId: string, moduleId: string, answers: number[]): Promise<{
    id?: string;
    userId?: string;
    moduleId: string;
    completedAt?: string;
    quizScore: number;
    quizAnswers: number[];
    pointsAwarded: number;
    passed: boolean;
  }> {
    const { data } = await apiClient.post<{ success: boolean; message: string; data: any }>(
      `/learning-paths/${pathId}/modules/${moduleId}/submit-quiz`,
      { answers }
    );
    return data.data;
  },

  /**
   * Complete a module (without quiz)
   */
  async completeModule(pathId: string, moduleId: string): Promise<{
    id?: string;
    moduleId: string;
    completedAt: string;
    pointsAwarded?: number;
  }> {
    console.log("📡 API Call: completeModule", { pathId, moduleId });
    try {
      const { data } = await apiClient.post<{ success: boolean; message: string; data: any }>(
        `/learning-paths/${pathId}/modules/${moduleId}/complete`
      );
      console.log("📡 API Response: completeModule", data);
      
      // Ensure we return a valid structure without quizScore
      const result = data.data || {};
      console.log("📦 Parsed Result:", result);
      
      const returnValue = {
        id: result.id,
        moduleId: result.moduleId || moduleId,
        completedAt: result.completedAt || new Date().toISOString(),
        pointsAwarded: result.pointsAwarded,
        // Explicitly exclude quizScore if it exists
      };
      console.log("✅ Returning:", returnValue);
      return returnValue;
    } catch (error: any) {
      console.error("❌ API Error: completeModule", error);
      console.error("❌ Error Response:", {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      
      // If the error is 409 (already completed), return a valid structure
      if (error?.response?.status === 409) {
        console.log("⚠️ Module already completed, returning default structure");
        return {
          moduleId,
          completedAt: new Date().toISOString(),
          pointsAwarded: 50,
        };
      }
      throw error;
    }
  },

  /**
   * Get user progress for a learning path
   */
  async getProgress(pathId: string): Promise<{
    pathId: string;
    completedModules: number;
    totalModules: number;
    percentComplete: number;
    averageScore?: number;
    modules: Array<{
      moduleId: string;
      title: string;
      isCompleted: boolean;
      completedAt?: string;
      quizScore?: number;
      pointsEarned?: number;
    }>;
  }> {
    const { data } = await apiClient.get<{ success: boolean; data: any }>(`/learning-paths/${pathId}/progress`);
    return data.data;
  },

  /**
   * Get module completion status
   */
  async getModuleStatus(pathId: string, moduleId: string): Promise<{
    isCompleted: boolean;
    completedAt: string | null;
    quizScore: number | null;
  }> {
    console.log("📡 API Call: getModuleStatus", { pathId, moduleId });
    const { data } = await apiClient.get<{
      isCompleted: boolean;
      completedAt: string | null;
      quizScore: number | null;
    }>(`/learning-paths/${pathId}/modules/${moduleId}/status`);
    
    console.log("📡 API Response Data (from axios):", data);
    
    // The API returns the status object directly: { isCompleted, completedAt, quizScore }
    // Axios wraps it, so data = { isCompleted, completedAt, quizScore }
    if (!data || typeof data !== 'object') {
      console.error("❌ No status data found in response. Full response:", data);
      throw new Error("Failed to get module status: No data in response");
    }
    
    // Ensure all required fields are present with defaults
    const statusData = {
      isCompleted: data.isCompleted ?? false,
      completedAt: data.completedAt ?? null,
      quizScore: data.quizScore ?? null,
    };
    
    console.log("📦 Parsed Status Data:", statusData);
    return statusData;
  },

  /**
   * Get student modules with completion status for a learning path
   */
  async getStudentModules(pathId: string): Promise<Module[]> {
    console.log("📡 API Call: getStudentModules", { pathId });
    const { data } = await apiClient.get<{ success: boolean; data: Module[] }>(
      `/learning-paths/${pathId}/modules`
    );
    console.log("📡 API Response: getStudentModules", data);
    const modules = data.data || [];
    console.log("📦 Parsed Modules:", modules);
    return modules;
  },
};
