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
          ? "bg-slate-900 border-l-4 border-l-white"
          : "hover:bg-slate-50"
      }`}
      onClick={onSelect}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className={`font-semibold truncate ${isSelected ? "text-white" : "text-slate-900"}`}>
                {path.title}
              </h3>
              {path.isCore && (
                <span className={`flex-shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
                  isSelected 
                    ? "bg-white/20 text-white" 
                    : "bg-blue-100 text-blue-700"
                }`}>
                  Core
                </span>
              )}
            </div>
            <p className={`text-xs line-clamp-2 mb-2 ${isSelected ? "text-white/80" : "text-slate-500"}`}>
              {path.description}
            </p>
            <div className={`flex items-center gap-3 text-xs ${isSelected ? "text-white/70" : "text-slate-500"}`}>
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
              className={`rounded-lg p-1.5 transition-colors ${
                isSelected
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Edit Learning Path"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`rounded-lg p-1.5 transition-colors ${
                isSelected
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "text-red-600 hover:bg-red-50"
              }`}
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

