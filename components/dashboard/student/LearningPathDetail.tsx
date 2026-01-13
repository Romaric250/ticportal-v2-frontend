"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { ModuleSidebar } from "./ModuleSidebar";
import { ModuleContentSection } from "./ModuleContentSection";
import type { LearningPath, Module } from "../../../src/lib/services/learningPathService";

interface LearningPathDetailProps {
  path: LearningPath;
  onBack: () => void;
  onEnroll?: () => void;
}

export const LearningPathDetail = ({ path, onBack, onEnroll }: LearningPathDetailProps) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    loadPathDetails();
  }, [path.id]);

  const loadPathDetails = async () => {
    try {
      setLoading(true);
      // Load full path details
      const fullPath = await learningPathService.getStudentPathById(path.id);
      
      // Try to load progress (will fail if not enrolled, that's okay)
      try {
        const progressData = await learningPathService.getProgress(path.id);
        setProgress(progressData);
        setIsEnrolled(true);
      } catch (error: any) {
        // Not enrolled yet, that's fine
        if (error?.response?.status !== 404) {
          console.error("Error loading progress:", error);
        }
      }

      // Select first module if available
      if (fullPath.modules && fullPath.modules.length > 0) {
        const sortedModules = [...fullPath.modules].sort((a, b) => a.order - b.order);
        setSelectedModule(sortedModules[0]);
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
      const result = await learningPathService.enrollInPath(path.id);
      toast.success("Success");
      setIsEnrolled(true);
      onEnroll?.();
      // Load progress after enrollment
      await loadPathDetails();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("You are already enrolled in this learning path");
        setIsEnrolled(true);
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to enroll");
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
  };

  const handleModuleComplete = () => {
    // Reload progress after module completion
    loadPathDetails();
  };

  const sortedModules = path.modules
    ? [...path.modules].sort((a, b) => a.order - b.order)
    : [];

  const progressModules = progress?.modules || [];

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ChevronRight size={20} className="rotate-180" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{path.title}</h1>
            <p className="text-sm text-slate-600">{path.description}</p>
          </div>
        </div>
        {!isEnrolled && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enrolling ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enrolling...
              </>
            ) : (
              "Enroll in Path"
            )}
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
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

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Module List */}
        <ModuleSidebar
          modules={sortedModules}
          selectedModuleId={selectedModule?.id || null}
          progress={progressModules}
          onModuleSelect={handleModuleSelect}
        />

        {/* Main Content */}
        <div className="space-y-6">
          {selectedModule ? (
            <ModuleContentSection
              pathId={path.id}
              module={selectedModule}
              isCompleted={progressModules.find((p: any) => p.moduleId === selectedModule.id)?.isCompleted || false}
              onComplete={handleModuleComplete}
            />
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm text-slate-500">Select a module to view its content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

