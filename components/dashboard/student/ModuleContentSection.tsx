"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService } from "../../../src/lib/services/learningPathService";
import { ModuleContentViewer } from "./ModuleContentViewer";
import { ModuleQuiz } from "./ModuleQuiz";
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

  const handleCompleteModule = async () => {
    if (module.quiz && module.quiz.length > 0) {
      // Module has quiz, completion is handled by quiz submission
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
    onComplete?.();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{module.title}</h2>
          {isCompleted && (
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 size={14} />
              <span>Completed</span>
            </div>
          )}
        </div>
        <ModuleContentViewer content={module.content} />
      </div>

      {module.quiz && module.quiz.length > 0 ? (
        <ModuleQuiz
          pathId={pathId}
          moduleId={module.id}
          questions={module.quiz}
          onComplete={handleQuizComplete}
        />
      ) : (
        !isCompleted && (
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Complete Module</h3>
                <p className="mt-1 text-xs text-slate-600">
                  Mark this module as complete to earn 50 points
                </p>
              </div>
              <button
                onClick={handleCompleteModule}
                disabled={completing}
                className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {completing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Mark Complete
                  </>
                )}
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
};

