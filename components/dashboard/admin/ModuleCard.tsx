"use client";

import { FileText, Edit2, Trash2, HelpCircle, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Module } from "../../../src/lib/services/learningPathService";

interface ModuleCardProps {
  module: Module;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function ModuleCard({ module, index, onEdit, onDelete }: ModuleCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-slate-200 bg-white p-3 sm:p-4 lg:p-5 transition-all hover:border-slate-300 hover:shadow-sm ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3 lg:gap-4">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing mt-0.5 sm:mt-1 p-1 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            title="Drag to reorder"
          >
            <GripVertical size={16} className="sm:w-5 sm:h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-[#111827] text-[10px] sm:text-xs font-bold text-white flex-shrink-0">
                {index + 1}
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 break-words">{module.title}</h3>
            </div>
            
            {module.quiz && module.quiz.length > 0 && (
              <div className="mt-1 sm:mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-emerald-700">
                  <HelpCircle size={10} className="sm:w-3 sm:h-3" />
                  {module.quiz.length} {module.quiz.length === 1 ? "question" : "questions"}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="cursor-pointer rounded-lg border border-slate-300 bg-white p-1.5 sm:p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-400"
            title="Edit Module"
          >
            <Edit2 size={14} className="sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="cursor-pointer rounded-lg border border-red-300 bg-white p-1.5 sm:p-2 text-red-600 transition-colors hover:bg-red-50 hover:border-red-400"
            title="Delete Module"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

