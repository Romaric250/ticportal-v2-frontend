"use client";

import { BookOpen } from "lucide-react";
import type { LearningPath } from "../../../src/lib/services/learningPathService";

interface LearningPathListProps {
  paths: LearningPath[];
  onPathSelect: (path: LearningPath) => void;
}

export const LearningPathList = ({ paths, onPathSelect }: LearningPathListProps) => {
  if (paths.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <BookOpen size={48} className="mx-auto text-slate-400" />
        <p className="mt-4 text-sm font-semibold text-slate-900">No learning paths available</p>
        <p className="mt-1 text-xs text-slate-500">
          Check back later for new learning content
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {paths.map((path) => {
        const moduleCount = path.modules?.length || 0;
        return (
          <button
            key={path.id}
            onClick={() => onPathSelect(path)}
            className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-[#111827] hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="rounded-lg bg-[#111827] p-2">
                <BookOpen size={20} className="text-white" />
              </div>
              {path.isCore && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700">
                  Core
                </span>
              )}
            </div>
            <h3 className="mb-2 text-base font-bold text-slate-900">{path.title}</h3>
            <p className="mb-3 text-xs text-slate-600 line-clamp-2">{path.description}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{moduleCount} {moduleCount === 1 ? "module" : "modules"}</span>
              <span>•</span>
              <span className="capitalize">{path.audience.toLowerCase()}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

