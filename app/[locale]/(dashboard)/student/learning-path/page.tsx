"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { learningPathService, type LearningPath } from "../../../../../src/lib/services/learningPathService";
import { LearningPathList } from "../../../../../components/dashboard/student/LearningPathList";
import { LearningPathDetail } from "../../../../../components/dashboard/student/LearningPathDetail";

export default function LearningPathPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      const paths = await learningPathService.getStudentPaths();
      setLearningPaths(paths);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load learning paths");
    } finally {
      setLoading(false);
    }
  };

  const handlePathSelect = (path: LearningPath) => {
    setSelectedPath(path);
  };

  const handleBackToList = () => {
    setSelectedPath(null);
  };

  const handleEnroll = () => {
    // Refresh paths list after enrollment
    loadLearningPaths();
  };

  if (loading && learningPaths.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#111827]" />
          <p className="text-sm text-slate-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  // Show learning path detail view
  if (selectedPath) {
    return (
      <LearningPathDetail
        path={selectedPath}
        onBack={handleBackToList}
        onEnroll={handleEnroll}
      />
    );
  }

  // Show learning paths list
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Learning Paths</h1>
        <p className="mt-2 text-sm text-slate-600">
          Explore available learning paths and enhance your skills
        </p>
      </div>

      <LearningPathList paths={learningPaths} onPathSelect={handlePathSelect} />
    </div>
  );
}
