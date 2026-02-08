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
    <tr
      ref={setNodeRef}
      style={style}
      className={`transition-colors hover:bg-slate-50/50 ${
        isDragging ? "bg-slate-100" : ""
      }`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-600 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical size={16} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
            {index + 1}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{module.title}</h3>
          {module.content && (
            <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
              {module.content.replace(/<[^>]*>/g, '').substring(0, 60)}...
            </p>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {module.quiz && module.quiz.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <HelpCircle size={12} className="text-emerald-600" />
            {module.quiz.length} {module.quiz.length === 1 ? "question" : "questions"}
          </span>
        ) : (
          <span className="text-xs text-slate-400">No quiz</span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800"
            title="Edit Module"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
            title="Delete Module"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

