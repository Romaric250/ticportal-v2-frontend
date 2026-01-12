"use client";

import { CheckCircle2, Circle } from "lucide-react";
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
}

export const ModuleSidebar = ({
  modules,
  selectedModuleId,
  progress = [],
  onModuleSelect,
}: ModuleSidebarProps) => {
  const getModuleProgress = (moduleId: string) => {
    return progress.find((p) => p.moduleId === moduleId);
  };

  return (
    <div className="space-y-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Modules</h2>
        <div className="space-y-1">
          {modules.map((module, index) => {
            const isSelected = selectedModuleId === module.id;
            const moduleProgress = getModuleProgress(module.id);
            const isCompleted = moduleProgress?.isCompleted || false;

            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module)}
                className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                  isSelected
                    ? "border-[#111827] bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 rounded-full bg-[#111827] px-2 py-0.5 text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{module.title}</p>
                    {isCompleted && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600">
                        <CheckCircle2 size={12} />
                        <span>Completed</span>
                        {moduleProgress?.quizScore !== undefined && (
                          <span className="text-slate-500">• {moduleProgress.quizScore}%</span>
                        )}
                      </div>
                    )}
                  </div>
                  {isCompleted ? (
                    <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-600" />
                  ) : (
                    <Circle size={16} className="flex-shrink-0 text-slate-300" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

