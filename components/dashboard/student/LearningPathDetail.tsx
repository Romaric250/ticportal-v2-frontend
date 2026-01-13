"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { ModuleSidebar } from "./ModuleSidebar";
import { ModuleContentSection } from "./ModuleContentSection";
import { useLearningPathStore } from "../../../src/state/learning-path-store";
import type { LearningPath, Module } from "../../../src/lib/services/learningPathService";

interface LearningPathDetailProps {
  path: LearningPath;
  onBack: () => void;
  onEnroll?: () => void;
}

export const LearningPathDetail = ({ path, onBack, onEnroll }: LearningPathDetailProps) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const enrolledPaths = useLearningPathStore((state) => state.enrolledPaths);
  const { setEnrolled, setLoadingEnrollment } = useLearningPathStore();

  // Check enrollment status immediately
  const isEnrolled = enrolledPaths.includes(path.id);

  useEffect(() => {
    loadPathDetails();
  }, [path.id]);

  const loadPathDetails = async () => {
    try {
      setLoading(true);
      
      // Check enrollment status first
      let enrollmentChecked = false;
      if (!isEnrolled) {
        setLoadingEnrollment(path.id, true);
        try {
          await learningPathService.getProgress(path.id);
          setEnrolled(path.id);
          enrollmentChecked = true;
        } catch (error: any) {
          // Not enrolled, that's fine
          if (error?.response?.status !== 404) {
            console.error("Error loading progress:", error);
          }
        } finally {
          setLoadingEnrollment(path.id, false);
        }
      } else {
        enrollmentChecked = true;
      }

      // Load modules with completion status if enrolled
      if (enrollmentChecked || isEnrolled) {
        try {
          // Use the new endpoint that returns modules with completion status
          const studentModules = await learningPathService.getStudentModules(path.id);
          console.log("📦 Student Modules Data:", studentModules);
          console.log("📦 Student Modules Count:", studentModules.length);
          
          const sortedModules = [...studentModules].sort((a, b) => a.order - b.order);
          console.log("📦 Sorted Modules:", sortedModules);
          
          // Log each module's details
          sortedModules.forEach((module, index) => {
            console.log(`📦 Module ${index + 1}:`, {
              id: module.id,
              title: module.title,
              hasQuiz: module.hasQuiz,
              isCompleted: module.isCompleted,
              completedAt: module.completedAt,
              quizScore: module.quizScore,
              quiz: module.quiz,
            });
          });
          
          setModules(sortedModules);
          
          // Also load progress for the progress bar
          try {
            const progressData = await learningPathService.getProgress(path.id);
            console.log("📊 Progress Data:", progressData);
            setProgress(progressData);
          } catch (error: any) {
            // Progress might not be available yet
            console.error("Error loading progress:", error);
          }
          
          // Select first module immediately if available
          if (sortedModules.length > 0) {
            console.log("📦 Setting selected module:", sortedModules[0]);
            setSelectedModule(sortedModules[0]);
          }
        } catch (error: any) {
          // Fallback to regular path details if student modules endpoint fails
          console.error("❌ Error loading student modules:", error);
          const fullPath = await learningPathService.getStudentPathById(path.id);
          console.log("📦 Fallback - Full Path Data:", fullPath);
          if (fullPath.modules && fullPath.modules.length > 0) {
            const sortedModules = [...fullPath.modules].sort((a, b) => a.order - b.order);
            setModules(sortedModules);
            setSelectedModule(sortedModules[0]);
          }
        }
      } else {
        // Not enrolled, just load basic path details
        const fullPath = await learningPathService.getStudentPathById(path.id);
        console.log("📦 Not Enrolled - Full Path Data:", fullPath);
        if (fullPath.modules && fullPath.modules.length > 0) {
          const sortedModules = [...fullPath.modules].sort((a, b) => a.order - b.order);
          setModules(sortedModules);
          setSelectedModule(sortedModules[0]);
        }
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to load learning path");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setLoadingEnrollment(path.id, true);
      await learningPathService.enrollInPath(path.id);
      setEnrolled(path.id);
      toast.success("Successfully enrolled!");
      onEnroll?.();
      // Load progress after enrollment
      await loadPathDetails();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("You are already enrolled in this learning path");
        setEnrolled(path.id);
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to enroll");
      }
    } finally {
      setEnrolling(false);
      setLoadingEnrollment(path.id, false);
    }
  };

  const handleModuleSelect = async (module: Module) => {
    setContentLoading(true);
    // Clear previous content immediately
    setSelectedModule(null);
    // Small delay to show loading state, then set new module
    await new Promise((resolve) => setTimeout(resolve, 100));
    setSelectedModule(module);
    setContentLoading(false);
  };

  // Get module completion status
  const getModuleCompletionStatus = async (moduleId: string) => {
    try {
      const status = await learningPathService.getModuleStatus(path.id, moduleId);
      return status.isCompleted;
    } catch (error) {
      // Fallback to progress data
      return progressModules.find((p: any) => p.moduleId === moduleId)?.isCompleted || false;
    }
  };

  const handleModuleComplete = () => {
    // Reload modules and progress after module completion
    loadPathDetails();
  };

  const sortedModules = modules.length > 0 
    ? modules 
    : (path.modules ? [...path.modules].sort((a, b) => a.order - b.order) : []);

  const progressModules = progress?.modules || [];
  const currentIsEnrolled = enrolledPaths.includes(path.id);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
          <p className="text-sm text-slate-600">Loading learning path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
            aria-label="Go back"
          >
            <ChevronRight size={18} className="rotate-180" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 break-words">{path.title}</h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">{path.description}</p>
          </div>
        </div>
        {!currentIsEnrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="flex-shrink-0 flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:inline">Enrolling...</span>
              </>
            ) : (
              "Enroll"
            )}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {progress && currentIsEnrolled && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
          <div className="mb-2 flex items-center justify-between text-xs sm:text-sm">
            <span className="font-semibold text-slate-900">Progress</span>
            <span className="font-semibold text-[#111827]">
              {progress.completedModules} / {progress.totalModules} modules
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#111827] transition-all"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
          {progress.averageScore !== undefined && (
            <p className="mt-2 text-xs text-slate-600">
              Average Score: <span className="font-semibold">{progress.averageScore}%</span>
            </p>
          )}
        </div>
      )}

      {/* Main Content - Modules on the RIGHT */}
      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_280px] gap-4 sm:gap-6">
        {/* Main Content - LEFT */}
        <div className="space-y-4 sm:space-y-6 min-w-0 order-2 lg:order-1">
          {contentLoading ? (
            <div className="flex h-[300px] sm:h-[400px] items-center justify-center rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[#111827]" />
                <p className="text-xs sm:text-sm text-slate-600">Loading module...</p>
              </div>
            </div>
          ) : selectedModule ? (
            <ModuleContentSection
              pathId={path.id}
              module={selectedModule}
              isCompleted={selectedModule.isCompleted ?? progressModules.find((p: any) => p.moduleId === selectedModule.id)?.isCompleted ?? false}
              onComplete={handleModuleComplete}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 text-center">
              <p className="text-xs sm:text-sm text-slate-500">Select a module to view its content</p>
            </div>
          )}
        </div>

        {/* Sidebar - Module List - RIGHT - Sticky */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-4">
            <ModuleSidebar
              modules={sortedModules}
              selectedModuleId={selectedModule?.id || null}
              progress={progressModules}
              onModuleSelect={handleModuleSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
