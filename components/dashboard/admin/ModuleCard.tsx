"use client";

import { FileText, Edit2, Trash2, HelpCircle } from "lucide-react";
import type { Module } from "../../../../src/lib/services/learningPathService";

interface ModuleCardProps {
  module: Module;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ModuleCard({ module, index, onEdit, onDelete }: ModuleCardProps) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-xs font-bold text-white">
              {index + 1}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
          </div>
          
          {module.quiz && module.quiz.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <HelpCircle size={12} />
                {module.quiz.length} {module.quiz.length === 1 ? "question" : "questions"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-400"
            title="Edit Module"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="cursor-pointer rounded-lg border border-red-300 bg-white p-2 text-red-600 transition-colors hover:bg-red-50 hover:border-red-400"
            title="Delete Module"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

