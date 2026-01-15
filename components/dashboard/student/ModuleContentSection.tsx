"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, HelpCircle, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { ModuleContentViewer } from "./ModuleContentViewer";
import { QuizModal } from "./QuizModal";
import type { Module } from "../../../src/lib/services/learningPathService";

interface ModuleContentSectionProps {
  pathId: string;
  module: Module;
  isCompleted?: boolean;
  onComplete?: () => void;
  modules?: Module[];
  currentModuleId?: string;
  onModuleChange?: (module: Module) => void;
  isEnrolled?: boolean;
}

export const ModuleContentSection = ({
  pathId,
  module,
  isCompleted = false,
  onComplete,
  modules = [],
  currentModuleId,
  onModuleChange,
  isEnrolled = true,
}: ModuleContentSectionProps) => {
  const [completing, setCompleting] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  // CRITICAL: Initialize from module.isCompleted FIRST (from API), then fallback to prop
  // This prevents the "Complete" button from showing even for a split second on completed modules
  const [moduleCompleted, setModuleCompleted] = useState<boolean>(() => {
    return module.isCompleted ?? isCompleted ?? false;
  });
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Update local state immediately when prop or module.isCompleted changes (no async delay)
  useEffect(() => {
    // Prioritize module.isCompleted if available (from API), then use prop
    // Set immediately to avoid showing "Complete" button when module is already completed
    const shouldBeCompleted = module.isCompleted ?? isCompleted ?? false;
    setModuleCompleted(shouldBeCompleted);
  }, [module.isCompleted, isCompleted]);

  const handleCompleteModule = async () => {
    // Check if module has quiz using hasQuiz field or quiz array
    const hasQuiz = module.hasQuiz ?? (module.quiz && module.quiz.length > 0);
    
    if (hasQuiz) {
      // Module has quiz, show quiz modal
      setShowQuizModal(true);
      return;
    }

    try {
      setCompleting(true);
      const result = await learningPathService.completeModule(pathId, module.id);
      const pointsAwarded = result?.pointsAwarded ?? 50; // Default to 50 if not provided
      
      toast.success(`Module completed! You earned ${pointsAwarded} points!`);
      setModuleCompleted(true);
      
      // Refresh status after completion
      try {
        const status = await learningPathService.getModuleStatus(pathId, module.id);
        setModuleCompleted(status.isCompleted);
      } catch (statusError) {
        // Still mark as completed locally
        setModuleCompleted(true);
      }
      onComplete?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("Module already completed");
        setModuleCompleted(true);
        // Refresh status
        try {
          const status = await learningPathService.getModuleStatus(pathId, module.id);
          setModuleCompleted(status.isCompleted);
        } catch (statusError) {
          // Ignore refresh errors
        }
        onComplete?.();
      } else {
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to complete module";
        toast.error(errorMessage);
        console.error("Complete module error details:", {
          status: error?.response?.status,
          data: error?.response?.data,
          message: errorMessage,
        });
      }
    } finally {
      setCompleting(false);
      console.log("🏁 handleCompleteModule finished");
    }
  };

  const handleQuizComplete = async (result: { quizScore: number; pointsAwarded: number; passed: boolean }) => {
    setShowQuizModal(false);
    setModuleCompleted(true);
    // Refresh status after quiz completion
    try {
      const status = await learningPathService.getModuleStatus(pathId, module.id);
      setModuleCompleted(status.isCompleted);
    } catch (error) {
      console.error("Error refreshing status after quiz:", error);
    }
    // Refresh parent component to update progress
    onComplete?.();
  };

  // Check if this is the "Complete Path" module
  const isCompletePathModule = (module as any).isCompletePathModule === true;

  if (isCompletePathModule) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-emerald-900 break-words">
              Complete Learning Path
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm sm:text-base text-emerald-800">
              Congratulations! You have completed all modules in this learning path. Click the button below to mark the entire path as complete and earn your final reward.
            </p>
            <button
              onClick={async () => {
                try {
                  setCompleting(true);
                  const result = await learningPathService.completePath(pathId);
                  toast.success(`Learning path completed! You earned ${result.pointsAwarded || 100} points!`);
                  onComplete?.();
                } catch (error: any) {
                  if (error?.response?.status === 409) {
                    toast.info("Learning path is already completed");
                  } else {
                    toast.error(error?.response?.data?.message || error?.message || "Failed to complete learning path");
                  }
                } finally {
                  setCompleting(false);
                }
              }}
              disabled={completing}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm sm:text-base font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {completing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Complete Learning Path</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 break-words">{module.title}</h2>
            {(moduleCompleted || module.isCompleted) && (
              <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-2 sm:px-3 py-1 text-xs font-semibold text-emerald-700 flex-shrink-0">
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </div>
            )}
          </div>
          <div className="overflow-x-hidden">
            <ModuleContentViewer content={module.content} />
          </div>
        </div>

        {(module.hasQuiz ?? (module.quiz && module.quiz.length > 0)) ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={16} className="flex-shrink-0" />
                  <span>Quiz Available</span>
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  {module.quiz?.length ?? 0} {(module.quiz?.length ?? 0) === 1 ? "question" : "questions"}
                </p>
              </div>
              {!(moduleCompleted || module.isCompleted) && (
                <button
                  onClick={() => setShowQuizModal(true)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] flex-shrink-0 w-full sm:w-auto"
                >
                  <HelpCircle size={14} />
                  <span>Take Quiz</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          !(moduleCompleted || module.isCompleted) && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900">Complete Module</h3>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600">
                    Mark this module as complete to earn 50 points
                  </p>
                </div>
                <button
                  onClick={handleCompleteModule}
                  disabled={completing}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto"
                >
                  {completing ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Completing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Mark Complete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Quiz Modal */}
      {(module.hasQuiz ?? (module.quiz && module.quiz.length > 0)) && module.quiz && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          pathId={pathId}
          moduleId={module.id}
          questions={module.quiz}
          isCompleted={moduleCompleted}
          onComplete={handleQuizComplete}
        />
      )}

      {/* Mobile Module Navigation - Bottom - Always visible on mobile when modules exist */}
      {modules.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40 safe-area-inset-bottom">
          {/* Module Selector - Horizontal Scroll */}
          <div className="px-2 py-2 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {modules.map((m, index) => {
                const isSelected = m.id === currentModuleId;
                const isModuleCompleted = m.isCompleted === true;
                const isCompletePathModule = (m as any).isCompletePathModule === true;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (isEnrolled && onModuleChange) {
                        onModuleChange(m);
                      }
                    }}
                    disabled={!isEnrolled}
                    className={`flex-shrink-0 rounded-lg border-2 px-2 py-1 text-left transition-all ${
                      !isEnrolled
                        ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-50"
                        : isCompletePathModule
                        ? isSelected
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-emerald-300 bg-emerald-50 hover:border-emerald-400"
                        : isSelected
                        ? "border-[#111827] bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isCompletePathModule ? (
                        <span className="flex-shrink-0 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">✓</span>
                      ) : isModuleCompleted ? (
                        <div className="flex-shrink-0 flex items-center justify-center rounded bg-[#111827] p-0.5">
                          <Check size={10} className="text-white" />
                        </div>
                      ) : (
                        <span className="flex-shrink-0 rounded-full bg-[#111827] px-1.5 py-0.5 text-[10px] font-semibold text-white">{index + 1}</span>
                      )}
                      <p className={`text-[10px] font-medium truncate max-w-[80px] ${
                        isCompletePathModule ? "text-emerald-900" : isSelected ? "text-slate-900" : "text-slate-700"
                      }`}>
                        {m.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation and Complete Buttons */}
          <div className="px-4 py-2.5 flex items-center justify-center gap-3 border-t border-slate-200">
            {/* Previous/Next Navigation - Centered */}
            <div className="flex items-center gap-2">
              {(() => {
                const currentIndex = modules.findIndex((m) => m.id === currentModuleId);
                const hasPrevious = currentIndex > 0;
                const hasNext = currentIndex < modules.length - 1;
                const previousModule = hasPrevious ? modules[currentIndex - 1] : null;
                const nextModule = hasNext ? modules[currentIndex + 1] : null;

                return (
                  <>
                    <button
                      onClick={() => {
                        if (previousModule && isEnrolled && onModuleChange) {
                          onModuleChange(previousModule);
                        }
                      }}
                      disabled={!hasPrevious || !isEnrolled}
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                      <span className="hidden xs:inline">Prev</span>
                    </button>
                    <button
                      onClick={() => {
                        if (nextModule && isEnrolled && onModuleChange) {
                          onModuleChange(nextModule);
                        }
                      }}
                      disabled={!hasNext || !isEnrolled}
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Complete Button - Next to Navigation */}
            {!(moduleCompleted || module.isCompleted) && (
              <button
                onClick={() => {
                  if (module.hasQuiz ?? (module.quiz && module.quiz.length > 0)) {
                    setShowQuizModal(true);
                  } else {
                    handleCompleteModule();
                  }
                }}
                disabled={completing || !isEnrolled}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {completing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (module.hasQuiz ?? (module.quiz && module.quiz.length > 0)) ? (
                  <>
                    <HelpCircle size={14} />
                    <span>Quiz</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Complete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
