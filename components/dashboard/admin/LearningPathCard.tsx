"use client";

import { CheckCircle2, Users, FileText, Trash2, Edit2 } from "lucide-react";
import type { LearningPath } from "@/src/lib/services/learningPathService";

interface LearningPathCardProps {
  path: LearningPath;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function LearningPathCard({ path, isSelected, onSelect, onDelete, onEdit }: LearningPathCardProps) {
  return (
    <div
      className={`cursor-pointer transition-all ${
        isSelected
          ? "bg-slate-50 border-l-4 border-l-[#111827]"
          : "hover:bg-slate-50"
      }`}
      onClick={onSelect}
    >
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{path.title}</h3>
              {path.isCore && (
                <span className="flex-shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">
                  Core
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{path.description}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <FileText size={12} />
                {path.modules?.length || 0} modules
              </span>
              <span className="flex items-center gap-1">
                <Users size={12} />
                {path.audience}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="cursor-pointer rounded p-1 text-slate-600 transition-colors hover:bg-slate-100"
              title="Edit Learning Path"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="cursor-pointer rounded p-1 text-red-500 transition-colors hover:bg-red-50"
              title="Delete Learning Path"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

