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

        // 2) Apply the API data directly by pathId and fetch progress for enrolled paths
        const progressMap: Record<string, {
          completedModules: number;
          totalModules: number;
          percentComplete: number;
          averageScore?: number;
        }> = {};

        // Process enrollments and fetch progress in parallel
        const progressPromises = enrollments.map(async (enrollment) => {
          statusMap[enrollment.pathId] = enrollment.isEnrolled === true;

          if (enrollment.isEnrolled) {
            setEnrolled(enrollment.pathId);
            // Fetch progress for enrolled paths
            try {
              const progress = await learningPathService.getProgress(enrollment.pathId);
              progressMap[enrollment.pathId] = {
                completedModules: progress.completedModules,
                totalModules: progress.totalModules,
                percentComplete: progress.percentComplete,
                averageScore: progress.averageScore,
              };
            } catch (error: any) {
              // If progress fetch fails, calculate from modules if available
              const path = paths.find(p => p.id === enrollment.pathId);
              if (path?.modules) {
                const totalModules = path.modules.length;
                progressMap[enrollment.pathId] = {
                  completedModules: 0,
                  totalModules,
                  percentComplete: 0,
                };
              }
            }
          } else {
            setUnenrolled(enrollment.pathId);
          }
        });

        // Wait for all progress fetches to complete
        await Promise.all(progressPromises);

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

        {/* Progress Bar - Only show if enrolled */}
        {isEnrolled && pathProgress[path.id] && (
          <div className="mb-3" onClick={(e) => e.stopPropagation()}>
            <ProgressBar
              completedModules={pathProgress[path.id].completedModules}
              totalModules={pathProgress[path.id].totalModules}
              percentComplete={pathProgress[path.id].percentComplete}
              averageScore={pathProgress[path.id].averageScore}
              size="sm"
            />
          </div>
        )}

        {/* Enroll/Enrolled/Unenroll Buttons */}
        <div className="flex gap-2">
          {/* While enrollments are still loading, show a neutral disabled button to avoid flicker */}
          {isLoadingEnrollments ? (
            <button
              disabled
              className="w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-500 bg-slate-100 cursor-default"
            >
              Checking status...
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
          <h2 className="mb-4 text-base sm:text-lg lg:text-xl font-bold text-slate-900">Other Courses</h2>
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
