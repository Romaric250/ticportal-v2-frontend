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
  const [moduleCompleted, setModuleCompleted] = useState(isCompleted);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Check module status on mount and when module changes
  useEffect(() => {
    const checkModuleStatus = async () => {
      console.log("🔍 Checking Module Status:", {
        moduleId: module.id,
        moduleTitle: module.title,
        moduleIsCompleted: module.isCompleted,
        moduleHasQuiz: module.hasQuiz,
        moduleQuiz: module.quiz,
        propIsCompleted: isCompleted,
      });
      
      // First, use the module's isCompleted field if available (from getStudentModules)
      // This is the most reliable source as it comes directly from the API
      if (module.isCompleted !== undefined && module.isCompleted !== null) {
        console.log("✅ Using module.isCompleted:", module.isCompleted);
        setModuleCompleted(module.isCompleted);
        return;
      }
      
      // If prop is provided and module.isCompleted is not, use prop
      if (isCompleted !== undefined) {
        console.log("✅ Using prop isCompleted:", isCompleted);
        setModuleCompleted(isCompleted);
      }
      
      // Also try to fetch status for accuracy (but don't block on it if we have module.isCompleted)
      try {
        setLoadingStatus(true);
        console.log("🔍 Fetching module status from API...");
        const status = await learningPathService.getModuleStatus(pathId, module.id);
        console.log("📊 Module Status from API:", status);
        
        if (status && typeof status === 'object' && 'isCompleted' in status) {
          setModuleCompleted(status.isCompleted);
        } else {
          console.warn("⚠️ Invalid status response:", status);
          // Keep current state
        }
      } catch (error: any) {
        // If status check fails, keep current state (from module.isCompleted or prop)
        console.error("❌ Error checking module status:", error);
        console.log("🔄 Keeping current state, not overriding");
      } finally {
        setLoadingStatus(false);
      }
    };

    checkModuleStatus();
  }, [pathId, module.id, module.isCompleted, isCompleted]);

  // Update local state when prop or module.isCompleted changes
  useEffect(() => {
    // Prioritize module.isCompleted if available, then use prop
    const shouldBeCompleted = module.isCompleted ?? isCompleted;
    console.log("🔄 Updating moduleCompleted from prop/module:", {
      moduleIsCompleted: module.isCompleted,
      propIsCompleted: isCompleted,
      finalIsCompleted: shouldBeCompleted,
    });
    setModuleCompleted(shouldBeCompleted);
  }, [module.isCompleted, isCompleted]);

  const handleCompleteModule = async () => {
    console.log("🎯 handleCompleteModule called:", {
      moduleId: module.id,
      moduleTitle: module.title,
      moduleHasQuiz: module.hasQuiz,
      moduleQuiz: module.quiz,
      moduleIsCompleted: module.isCompleted,
    });
    
    // Check if module has quiz using hasQuiz field or quiz array
    const hasQuiz = module.hasQuiz ?? (module.quiz && module.quiz.length > 0);
    console.log("🔍 Has Quiz Check:", {
      moduleHasQuiz: module.hasQuiz,
      moduleQuizLength: module.quiz?.length,
      hasQuiz: hasQuiz,
    });
    
    if (hasQuiz) {
      // Module has quiz, show quiz modal
      console.log("📝 Module has quiz, showing quiz modal");
      setShowQuizModal(true);
      return;
    }

    console.log("✅ Module has no quiz, proceeding with completion...");
    try {
      setCompleting(true);
      console.log("📤 Calling completeModule API...");
      const result = await learningPathService.completeModule(pathId, module.id);
      console.log("📥 Complete Module Result:", result);
      
      const pointsAwarded = result?.pointsAwarded ?? 50; // Default to 50 if not provided
      console.log("💰 Points Awarded:", pointsAwarded);
      
      toast.success(`Module completed! You earned ${pointsAwarded} points!`);
      setModuleCompleted(true);
      
      // Refresh status after completion
      try {
        console.log("🔄 Refreshing module status...");
        const status = await learningPathService.getModuleStatus(pathId, module.id);
        console.log("📊 Updated Module Status:", status);
        setModuleCompleted(status.isCompleted);
      } catch (statusError) {
        console.error("❌ Error refreshing status:", statusError);
        // Still mark as completed locally
        setModuleCompleted(true);
      }
      onComplete?.();
    } catch (error: any) {
      console.error("❌ Error completing module:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.response?.status,
        data: error?.response?.data,
      });
      
      if (error?.response?.status === 409) {
        console.log("⚠️ Module already completed (409)");
        toast.info("Module already completed");
        setModuleCompleted(true);
        // Refresh status
        try {
          const status = await learningPathService.getModuleStatus(pathId, module.id);
          console.log("📊 Module Status after 409:", status);
          setModuleCompleted(status.isCompleted);
        } catch (statusError) {
          console.error("❌ Error refreshing status:", statusError);
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

      {/* Mobile Module Navigation - Bottom */}
      {modules.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111827] border-t border-slate-700 shadow-lg z-50">
          {/* Module Selector - Horizontal Scroll */}
          <div className="px-2 py-1.5 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {modules.map((m, index) => {
                const isSelected = m.id === currentModuleId;
                const isModuleCompleted = m.isCompleted === true;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (isEnrolled && onModuleChange) {
                        onModuleChange(m);
                      }
                    }}
                    disabled={!isEnrolled}
                    className={`flex-shrink-0 rounded-lg border-2 px-2 py-1.5 text-left transition-all ${
                      !isEnrolled
                        ? "border-slate-600 bg-slate-800 cursor-not-allowed opacity-50"
                        : isSelected
                        ? "border-white bg-slate-800"
                        : "border-slate-600 bg-slate-900 hover:border-slate-500"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isModuleCompleted ? (
                        <div className="flex-shrink-0 flex items-center justify-center rounded bg-white p-0.5">
                          <Check size={10} className="text-[#111827]" />
                        </div>
                      ) : (
                        <span className="flex-shrink-0 text-[10px] font-semibold text-white">{index + 1}</span>
                      )}
                      <p className="text-[10px] font-medium text-white truncate max-w-[60px]">
                        {m.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation and Complete Buttons */}
          <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-t border-slate-700">
            {/* Previous/Next Navigation */}
            <div className="flex items-center gap-2 flex-1">
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
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden xs:inline">Next</span>
                      <ChevronRight size={14} />
                    </button>
                  </>
                );
              })()}
            </div>

            {/* Complete Button - Opposite Side */}
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
