"use client";

import { useEffect } from "react";
import { BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { LearningPath } from "../../../src/lib/services/learningPathService";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { useLearningPathStore } from "../../../src/state/learning-path-store";

interface LearningPathListProps {
  paths: LearningPath[];
  onPathSelect: (path: LearningPath) => void;
  onEnrollChange?: () => void;
}

export const LearningPathList = ({ paths, onPathSelect, onEnrollChange }: LearningPathListProps) => {
  const enrolledPaths = useLearningPathStore((state) => state.enrolledPaths);
  const { setEnrolled, setLoadingEnrollment } = useLearningPathStore();
  const isLoadingEnrollment = useLearningPathStore((state) => state.isLoadingEnrollment);

  // Check enrollment status for all paths on mount
  useEffect(() => {
    const checkAllEnrollments = async () => {
      for (const path of paths) {
        // Only check if not already in store
        if (!enrolledPaths.includes(path.id)) {
          setLoadingEnrollment(path.id, true);
          try {
            await learningPathService.getProgress(path.id);
            setEnrolled(path.id);
          } catch (error: any) {
            // Not enrolled, that's fine
            if (error?.response?.status !== 404) {
              console.error(`Error checking enrollment for ${path.id}:`, error);
            }
          } finally {
            setLoadingEnrollment(path.id, false);
          }
        }
      }
    };

    checkAllEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnroll = async (e: React.MouseEvent, path: LearningPath) => {
    e.stopPropagation();
    
    if (enrolledPaths.has(path.id)) {
      return;
    }

    try {
      setLoadingEnrollment(path.id, true);
      await learningPathService.enrollInPath(path.id);
      setEnrolled(path.id);
      toast.success("Successfully enrolled!");
      onEnrollChange?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("You are already enrolled in this learning path");
        setEnrolled(path.id);
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to enroll");
      }
    } finally {
      setLoadingEnrollment(path.id, false);
    }
  };

  const PathCard = ({ path }: { path: LearningPath }) => {
    const moduleCount = path.modules?.length || 0;
    const isEnrolled = enrolledPaths.includes(path.id);
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

        {/* Enroll/Enrolled Button */}
        <button
          onClick={(e) => handleEnroll(e, path)}
          disabled={isEnrolled || isEnrolling}
          className={`w-full rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
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
              Enrolled
            </span>
          ) : (
            "Enroll"
          )}
        </button>
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
