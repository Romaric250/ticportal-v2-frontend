"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import type { LearningPath } from "../../../src/lib/services/learningPathService";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { useLearningPathStore } from "../../../src/state/learning-path-store";
import { ProgressBar } from "./ProgressBar";

interface LearningPathListProps {
  paths: LearningPath[];
  onPathSelect: (path: LearningPath) => void;
  onEnrollChange?: () => void;
}

export const LearningPathList = ({ paths, onPathSelect, onEnrollChange }: LearningPathListProps) => {
  const { setEnrolled, setUnenrolled, setLoadingEnrollment } = useLearningPathStore();
  const isLoadingEnrollment = useLearningPathStore((state) => state.isLoadingEnrollment);

  // Single source of truth for UI: enrollmentStatus loaded from API
  const [enrollmentStatus, setEnrollmentStatus] = useState<Record<string, boolean>>({});
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [pathProgress, setPathProgress] = useState<Record<string, {
    completedModules: number;
    totalModules: number;
    percentComplete: number;
    averageScore?: number;
    isCompleted?: boolean;
  }>>({});

  // Check enrollment status for all paths using the enrollments endpoint.
  // We trust the API as the single source of truth and map directly by pathId.
  useEffect(() => {
    let isMounted = true;

    const checkAllEnrollments = async () => {
      if (paths.length === 0) {
        setIsLoadingEnrollments(false);
        return;
      }

      try {
        const enrollments = await learningPathService.getEnrollments();

        if (!isMounted) {
          return;
        }

        const statusMap: Record<string, boolean> = {};

        // 1) Initialize all paths as not enrolled
        paths.forEach((path) => {
          statusMap[path.id] = false;
        });

        // 2) Apply the API data directly by pathId
        enrollments.forEach((enrollment) => {
          statusMap[enrollment.pathId] = enrollment.isEnrolled === true;

          if (enrollment.isEnrolled) {
            setEnrolled(enrollment.pathId);
          } else {
            setUnenrolled(enrollment.pathId);
          }
        });

        // 3) Fetch progress for all paths at once using calculate-progress endpoint
        const progressMap: Record<string, {
          completedModules: number;
          totalModules: number;
          percentComplete: number;
          isCompleted: boolean;
        }> = {};

        // Get list of enrolled path IDs
        const enrolledPathIds = enrollments.filter(e => e.isEnrolled).map(e => e.pathId);

        try {
          const allProgress = await learningPathService.calculateAllProgress();
          console.log("📊 API Response - calculateAllProgress:", allProgress);
          
          // Map progress data by pathId
          allProgress.forEach((progress) => {
            // If API returns totalModules: 0, check if path has modules and use that instead
            const path = paths.find(p => p.id === progress.pathId);
            const pathModuleCount = path?.modules?.length || 0;
            const apiTotalModules = progress.totalModules || 0;
            // Use API totalModules if > 0, otherwise use path's module count
            const totalModules = apiTotalModules > 0 ? apiTotalModules : pathModuleCount;
            
            const progressData = {
              completedModules: progress.completedModules ?? 0,
              totalModules: totalModules,
              // CRITICAL: Use ?? instead of || to handle 0 as a valid value
              percentComplete: progress.progressPercentage ?? (totalModules > 0 ? Math.round((progress.completedModules ?? 0) / totalModules * 100) : 0),
              isCompleted: progress.isCompleted ?? false,
            };
            
            console.log(`📊 Processing progress for pathId: ${progress.pathId}`, {
              apiData: progress,
              pathModuleCount,
              apiTotalModules,
              finalTotalModules: totalModules,
              finalProgressData: progressData,
            });
            
            progressMap[progress.pathId] = progressData;
          });
          
          console.log("📊 Final progressMap:", progressMap);
        } catch (error: any) {
          console.error("❌ Error fetching progress:", error);
        }

        // CRITICAL: Ensure ALL enrolled paths have progress data, even if API didn't return it
        // This ensures the progress bar shows for all enrolled paths
        for (const pathId of enrolledPathIds) {
          // Only initialize if progress data doesn't exist
          if (!progressMap[pathId]) {
            try {
              // Try to get modules to calculate progress
              const studentModules = await learningPathService.getStudentModules(pathId);
              const totalModules = studentModules.length;
              const completedModules = studentModules.filter(m => m.isCompleted === true).length;
              const percentComplete = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
              
              progressMap[pathId] = {
                completedModules,
                totalModules,
                percentComplete,
                isCompleted: false,
              };
            } catch (moduleError: any) {
              // Fallback: use path modules if available, or initialize with 0
              const path = paths.find(p => p.id === pathId);
              if (path?.modules) {
                const totalModules = path.modules.length;
                progressMap[pathId] = {
                  completedModules: 0,
                  totalModules,
                  percentComplete: 0,
                  isCompleted: false,
                };
              } else {
                // Last resort: use path from props to get module count
                const path = paths.find(p => p.id === pathId);
                if (path?.modules) {
                  const totalModules = path.modules.length;
                  progressMap[pathId] = {
                    completedModules: 0,
                    totalModules,
                    percentComplete: 0,
                    isCompleted: false,
                  };
                } else {
                  // Absolute last resort: initialize with 0
                  progressMap[pathId] = {
                    completedModules: 0,
                    totalModules: 0,
                    percentComplete: 0,
                    isCompleted: false,
                  };
                }
              }
            }
          }
        }

        setEnrollmentStatus(statusMap);
        setPathProgress(progressMap);
        setIsLoadingEnrollments(false);
      } catch (error: any) {
        if (!isMounted) return;
        setIsLoadingEnrollments(false);
      }
    };

    checkAllEnrollments();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths.map((p) => p.id).join(",")]);

  const handleEnroll = async (e: React.MouseEvent, path: LearningPath) => {
    e.stopPropagation();
    
    // Extra safety: if API already marked this as enrolled, do nothing
    if (enrollmentStatus[path.id] === true) {
      return;
    }

    try {
      setLoadingEnrollment(path.id, true);
      await learningPathService.enrollInPath(path.id);
      setEnrolled(path.id);
      setEnrollmentStatus((prev) => ({ ...prev, [path.id]: true }));
      toast.success("Successfully enrolled!");
      onEnrollChange?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("You are already enrolled in this learning path");
        setEnrolled(path.id);
        setEnrollmentStatus((prev) => ({ ...prev, [path.id]: true }));
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to enroll");
      }
    } finally {
      setLoadingEnrollment(path.id, false);
    }
  };

  const handleUnenroll = async (e: React.MouseEvent, path: LearningPath) => {
    e.stopPropagation();

    const currentlyEnrolled = enrollmentStatus[path.id] === true;
    if (!currentlyEnrolled) {
      return;
    }

    try {
      setLoadingEnrollment(path.id, true);
      await learningPathService.unenrollFromPath(path.id);
      setUnenrolled(path.id);
      setEnrollmentStatus((prev) => ({ ...prev, [path.id]: false }));
      toast.success("Successfully unenrolled!");
      onEnrollChange?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to unenroll");
    } finally {
      setLoadingEnrollment(path.id, false);
    }
  };

  const PathCard = ({ path }: { path: LearningPath }) => {
    const moduleCount = path.modules?.length || 0;
    // Use enrollmentStatus from API as the only source of truth
    const isEnrolled = enrollmentStatus[path.id] === true;
    const isEnrolling = isLoadingEnrollment[path.id] || false;
    const isCompleted = pathProgress[path.id]?.isCompleted === true;
    // Progress bar should show if enrolled - use progress data or fallback to path modules
    const progressData = pathProgress[path.id];
    
    // CRITICAL: If API returns totalModules: 0, use path's module count instead
    // This handles cases where API hasn't calculated modules yet but path has modules
    const apiTotalModules = progressData?.totalModules ?? 0;
    const totalModules = apiTotalModules > 0 ? apiTotalModules : (moduleCount > 0 ? moduleCount : 0);
    const completedModules = progressData?.completedModules ?? 0;
    
    // CRITICAL: Use progressData.percentComplete if available (from API), otherwise calculate
    // Use ?? instead of || to handle 0 as a valid percentage value
    const percentComplete = progressData?.percentComplete !== undefined 
      ? progressData.percentComplete 
      : (totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0);
    
    // Show progress bar if enrolled AND we have at least one module (from either source)
    const shouldShowProgress = isEnrolled && totalModules > 0;
    
    // Debug logging for enrolled paths
    if (isEnrolled) {
      console.log(`🎴 [PathCard:${path.title}]`, {
        pathId: path.id,
        isEnrolled,
        progressData,
        moduleCount,
        apiTotalModules,
        totalModules,
        completedModules,
        percentComplete,
        shouldShowProgress,
        isCompleted,
      });
    }

    return (
      <div
        onClick={() => onPathSelect(path)}
        className="group relative cursor-pointer rounded-lg border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-[#111827] hover:shadow-md"
      >
        <div className="mb-3 flex items-start justify-between">
          <div className="rounded-lg bg-[#111827] p-2">
            <BookOpen size={18} className="text-white" />
          </div>
          {path.isCore && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
              Core
            </span>
          )}
        </div>
        
        <h3 className="mb-2 text-sm sm:text-base font-bold text-slate-900 line-clamp-2">{path.title}</h3>
        <p className="mb-3 text-xs sm:text-sm text-slate-600 line-clamp-2">{path.description}</p>
        
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
          <span>{moduleCount} {moduleCount === 1 ? "module" : "modules"}</span>
          <span>•</span>
          <span className="capitalize">{path.audience.toLowerCase()}</span>
        </div>

        {/* Progress Bar - ALWAYS show if enrolled and has modules */}
        {shouldShowProgress && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <ProgressBar
              completedModules={completedModules}
              totalModules={totalModules}
              percentComplete={percentComplete}
              averageScore={progressData?.averageScore}
              size="sm"
            />
          </div>
        )}

        {/* Enroll/Enrolled/Unenroll/Completed Buttons */}
        <div className="flex gap-2">
          {/* While enrollments are still loading, show a neutral disabled button to avoid flicker */}
          {isLoadingEnrollments ? (
            <button
              disabled
              className="w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 cursor-default"
            >
              Checking status...
            </button>
          ) : isCompleted ? (
            /* Show "Completed" badge when path is completed */
            <button
              disabled
              className="w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-700 cursor-default"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </span>
            </button>
          ) : (
            <>
              {isEnrolled && !path.isCore && (
                <button
                  onClick={(e) => handleUnenroll(e, path)}
                  disabled={isEnrolling}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:border-red-300 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnrolling ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="hidden sm:inline">Unenrolling...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <X size={14} />
                      <span>Unenroll</span>
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={(e) => handleEnroll(e, path)}
                disabled={isEnrolled || isEnrolling}
                className={`${isEnrolled && !path.isCore ? "flex-1" : "w-full"} rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  isEnrolled
                    ? "bg-emerald-50 text-emerald-700 cursor-default"
                    : "bg-[#111827] text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {isEnrolling ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="hidden sm:inline">Enrolling...</span>
                  </span>
                ) : isEnrolled ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>Enrolled</span>
                  </span>
                ) : (
                  <span>Enroll</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (paths.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 sm:p-12 text-center">
        <BookOpen size={48} className="mx-auto text-slate-400" />
        <p className="mt-4 text-sm sm:text-base font-semibold text-slate-900">No learning paths available</p>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Check back later for new learning content
        </p>
      </div>
    );
  }

  // Separate core paths from other courses
  const corePaths = paths.filter((path) => path.isCore);
  const otherCourses = paths.filter((path) => !path.isCore);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Core Learning Paths */}
      {corePaths.length > 0 && (
        <div>
          <h2 className="mb-4 text-base sm:text-lg lg:text-xl font-bold text-slate-900">Core Learning Paths</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {corePaths.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      )}

      {/* Other Courses */}
      {otherCourses.length > 0 && (
        <div>
          <h2 className="mb-4 text-base sm:text-lg lg:text-xl font-bold text-slate-900">Other Pathways</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherCourses.map((path) => (
              <PathCard key={path.id} path={path} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
