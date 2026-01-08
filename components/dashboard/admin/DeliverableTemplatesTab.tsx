"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { type DeliverableTemplate } from "../../../../src/lib/services/adminService";

interface DeliverableTemplatesTabProps {
  templates: DeliverableTemplate[];
  loading: boolean;
  onEdit: (template: DeliverableTemplate) => void;
  onDelete: (template: DeliverableTemplate) => void;
}

export function DeliverableTemplatesTab({
  templates,
  loading,
  onEdit,
  onDelete,
}: DeliverableTemplatesTabProps) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
        <p className="mt-4 text-sm text-slate-500">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500">No deliverable templates yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <div
          key={template.id}
          className="rounded-lg border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{template.title}</h3>
                {template.required && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    Required
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-600 mb-3 line-clamp-2">{template.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-1 font-medium">
                  {template.customType || template.type}
                </span>
                <span className="rounded bg-blue-100 px-2 py-1 text-blue-700 font-medium">
                  {template.contentType}
                </span>
                {template.dueDate && (
                  <span className="text-slate-400">
                    Due: {new Date(template.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => onEdit(template)}
                className="cursor-pointer rounded p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
                title="Edit Template"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(template)}
                className="cursor-pointer rounded p-1.5 text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Template"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

