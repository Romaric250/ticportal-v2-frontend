"use client";

import { CheckCircle2, Check, Circle } from "lucide-react";
import type { Module } from "../../../src/lib/services/learningPathService";

interface ModuleProgress {
  moduleId: string;
  isCompleted: boolean;
  quizScore?: number;
}

interface ModuleSidebarProps {
  modules: Module[];
  selectedModuleId: string | null;
  progress?: ModuleProgress[];
  onModuleSelect: (module: Module) => void;
  disabled?: boolean;
}

export const ModuleSidebar = ({
  modules,
  selectedModuleId,
  progress = [],
  onModuleSelect,
  disabled = false,
}: ModuleSidebarProps) => {
  const getModuleProgress = (moduleId: string) => {
    return progress.find((p) => p.moduleId === moduleId);
  };

  if (modules.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-xs text-slate-500">No modules available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
        <h2 className="mb-3 text-xs sm:text-sm font-semibold text-slate-900">Modules</h2>
        <div className="space-y-1.5 sm:space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {modules.map((module, index) => {
            const isSelected = selectedModuleId === module.id;
            const moduleProgress = getModuleProgress(module.id);
            // Check module.isCompleted first (from getStudentModules), then fall back to progress
            // Explicitly check for true since module.isCompleted might be undefined
            const isCompleted = module.isCompleted === true || moduleProgress?.isCompleted === true;
            const isCompletePathModule = (module as any).isCompletePathModule === true;

            return (
              <button
                key={module.id}
                onClick={() => {
                  if (!disabled) {
                    onModuleSelect(module);
                  }
                }}
                disabled={disabled}
                className={`w-full rounded-lg border-2 p-2.5 sm:p-3 text-left transition-all ${
                  disabled
                    ? "border-slate-200 bg-slate-50 cursor-not-allowed opacity-60"
                    : isCompletePathModule
                    ? isSelected
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-emerald-300 bg-emerald-50 hover:border-emerald-400"
                    : isSelected
                    ? "border-[#111827] bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!isCompletePathModule && (
                    <span className="flex-shrink-0 rounded-full bg-[#111827] px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                  )}
                  {isCompletePathModule && (
                    <span className="flex-shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-white">
                      ✓
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-semibold truncate ${
                      isCompletePathModule ? "text-emerald-900" : "text-slate-900"
                    }`}>
                      {module.title}
                    </p>
                    {isCompleted && !isCompletePathModule && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span>Completed</span>
                        {(module.quizScore ?? moduleProgress?.quizScore) !== undefined && (
                          <span className="text-slate-500">• {(module.quizScore ?? moduleProgress?.quizScore)}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  {isCompleted && !isCompletePathModule ? (
                    <div className="flex-shrink-0 flex items-center justify-center rounded bg-[#111827] p-0.5">
                      <Check size={12} className="text-white sm:w-3 sm:h-3" />
                    </div>
                  ) : !isCompletePathModule ? (
                    <Circle size={14} className="flex-shrink-0 text-slate-300 sm:w-4 sm:h-4" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
