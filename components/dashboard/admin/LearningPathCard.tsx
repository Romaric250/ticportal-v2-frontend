"use client";

import { useState } from "react";
import { CheckCircle2, Users, FileText, Trash2, Edit2, X, Save } from "lucide-react";
import type { LearningPath } from "../../../../src/lib/services/learningPathService";

interface LearningPathCardProps {
  path: LearningPath;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onEdit: (data: Partial<{
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
  }>) => void;
}

export function LearningPathCard({ path, isSelected, onSelect, onDelete, onEdit }: LearningPathCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: path.title,
    description: path.description,
    audience: path.audience,
    isCore: path.isCore,
  });

  const handleSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: path.title,
      description: path.description,
      audience: path.audience,
      isCore: path.isCore,
    });
    setIsEditing(false);
  };

  return (
    <div
      className={`cursor-pointer transition-all ${
        isSelected
          ? "bg-slate-50 border-l-4 border-l-[#111827]"
          : "hover:bg-slate-50"
      }`}
      onClick={!isEditing ? onSelect : undefined}
    >
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold focus:border-[#111827] focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-[#111827] focus:outline-none resize-none"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="cursor-pointer rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
              >
                <Save size={14} />
              </button>
              <button
                onClick={handleCancel}
                className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
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
                    setIsEditing(true);
                  }}
                  className="cursor-pointer rounded p-1 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="cursor-pointer rounded p-1 text-red-500 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

