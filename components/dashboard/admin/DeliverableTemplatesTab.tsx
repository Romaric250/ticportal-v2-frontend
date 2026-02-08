"use client";

import { Edit2, Trash2, FileText, Loader2 } from "lucide-react";
import { type DeliverableTemplate } from "@/src/lib/services/adminService";

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
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Template
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Content Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <Loader2 size={28} className="mx-auto animate-spin text-slate-400" />
                  <p className="mt-2 text-sm text-slate-500">Loading templates...</p>
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <FileText size={32} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-500">No deliverable templates yet</p>
                  <p className="mt-1 text-xs text-slate-400">Create one to get started</p>
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr key={template.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
                        <FileText size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{template.title}</div>
                        {template.description && (
                          <div className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                      {template.customType || template.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{template.contentType}</span>
                  </td>
                  <td className="px-6 py-4">
                    {template.dueDate ? (
                      <span className="inline-flex items-center rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                        {new Date(template.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">No due date</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {template.required ? (
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(template)}
                        className="rounded-lg bg-slate-900 p-2 text-white transition-colors hover:bg-slate-800"
                        title="Edit Template"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(template)}
                        className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                        title="Delete Template"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

