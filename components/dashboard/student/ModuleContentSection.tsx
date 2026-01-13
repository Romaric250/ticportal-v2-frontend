"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, HelpCircle } from "lucide-react";
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
}

export const ModuleContentSection = ({
  pathId,
  module,
  isCompleted = false,
  onComplete,
}: ModuleContentSectionProps) => {
  const [completing, setCompleting] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const handleCompleteModule = async () => {
    if (module.quiz && module.quiz.length > 0) {
      // Module has quiz, show quiz modal
      setShowQuizModal(true);
      return;
    }

    try {
      setCompleting(true);
      const result = await learningPathService.completeModule(pathId, module.id);
      toast.success(`Module completed! You earned ${result.pointsAwarded} points!`);
      onComplete?.();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.info("Module already completed");
      } else {
        toast.error(error?.response?.data?.message || error?.message || "Failed to complete module");
      }
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizComplete = (result: { quizScore: number; pointsAwarded: number; passed: boolean }) => {
    setShowQuizModal(false);
    onComplete?.();
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 break-words">{module.title}</h2>
            {isCompleted && (
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

        {module.quiz && module.quiz.length > 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
                  <HelpCircle size={16} className="flex-shrink-0" />
                  <span>Quiz Available</span>
                </h3>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  {module.quiz.length} {module.quiz.length === 1 ? "question" : "questions"}
                </p>
              </div>
              {!isCompleted && (
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
          !isCompleted && (
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
      {module.quiz && module.quiz.length > 0 && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          pathId={pathId}
          moduleId={module.id}
          questions={module.quiz}
          onComplete={handleQuizComplete}
        />
      )}
    </>
  );
};
