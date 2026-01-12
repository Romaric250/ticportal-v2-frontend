"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, X, Trash2, Edit2, Eye, ChevronRight, GraduationCap, CheckCircle2, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { learningPathService, type LearningPath, type Module, type QuizQuestion } from "../../../../../src/lib/services/learningPathService";
import { CreateLearningPathModal } from "../../../../../components/dashboard/admin/CreateLearningPathModal";
import { ModuleEditorModal } from "../../../../../components/dashboard/admin/ModuleEditorModal";
import { LearningPathCard } from "../../../../../components/dashboard/admin/LearningPathCard";
import { ModuleCard } from "../../../../../components/dashboard/admin/ModuleCard";

export default function AdminLearningPathPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      setLoading(true);
      const paths = await learningPathService.getAll();
      setLearningPaths(paths);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load learning paths");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async (formData: {
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
  }) => {
    try {
      setLoading(true);
      const newPath = await learningPathService.create(formData);
      toast.success("Learning path created successfully");
      setShowCreateModal(false);
      await loadLearningPaths();
      // Select the newly created path
      const updated = await learningPathService.getById(newPath.id);
      setSelectedPath(updated);
    } catch (error: any) {
      toast.error(error?.message || "Failed to create learning path");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePath = async (id: string, formData: Partial<{
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
  }>) => {
    try {
      setLoading(true);
      await learningPathService.update(id, formData);
      toast.success("Learning path updated successfully");
      await loadLearningPaths();
      if (selectedPath?.id === id) {
        const updated = await learningPathService.getById(id);
        setSelectedPath(updated);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update learning path");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePath = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning path? This action cannot be undone.")) return;

    try {
      await learningPathService.delete(id);
      toast.success("Learning path deleted successfully");
      await loadLearningPaths();
      if (selectedPath?.id === id) {
        setSelectedPath(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete learning path");
    }
  };

  const handleAddModule = async (moduleData: {
    title: string;
    content: string;
    order: number;
    quiz: QuizQuestion[];
  }) => {
    if (!selectedPath) return;

    try {
      setLoading(true);
      await learningPathService.addModule(selectedPath.id, moduleData);
      toast.success("Module added successfully");
      setShowModuleModal(false);
      setEditingModule(null);
      await loadLearningPaths();
      // Reload selected path
      const updated = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updated);
      setModules(updated.modules?.sort((a, b) => a.order - b.order) || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateModule = async (moduleId: string, moduleData: {
    title?: string;
    content?: string;
    order?: number;
    quiz?: QuizQuestion[];
  }) => {
    if (!selectedPath) return;

    try {
      setLoading(true);
      await learningPathService.updateModule(selectedPath.id, moduleId, moduleData);
      toast.success("Module updated successfully");
      setShowModuleModal(false);
      setEditingModule(null);
      await loadLearningPaths();
      // Reload selected path
      const updated = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updated);
      setModules(updated.modules?.sort((a, b) => a.order - b.order) || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to update module");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedPath) return;
    if (!confirm("Are you sure you want to delete this module? This action cannot be undone.")) return;

    try {
      await learningPathService.deleteModule(selectedPath.id, moduleId);
      toast.success("Module deleted successfully");
      await loadLearningPaths();
      // Reload selected path
      const updated = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updated);
      setModules(updated.modules?.sort((a, b) => a.order - b.order) || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete module");
    }
  };

  const handleSelectPath = async (path: LearningPath) => {
    try {
      const fullPath = await learningPathService.getById(path.id);
      setSelectedPath(fullPath);
      setModules(fullPath.modules?.sort((a, b) => a.order - b.order) || []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load learning path details");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !selectedPath) {
      return;
    }

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Update local state immediately for better UX
    const newModules = arrayMove(modules, oldIndex, newIndex);
    setModules(newModules);

    // Update order values
    const updatedModules = newModules.map((module, index) => ({
      ...module,
      order: index + 1,
    }));

    // Update each module's order on the backend
    try {
      setLoading(true);
      const updatePromises = updatedModules.map((module, index) => {
        return learningPathService.updateModule(selectedPath.id, module.id, {
          order: index + 1,
        });
      });

      await Promise.all(updatePromises);
      
      // Update selected path with new order
      const updatedPath = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updatedPath);
      setModules(updatedPath.modules?.sort((a, b) => a.order - b.order) || []);
      
      toast.success("Module order updated successfully");
    } catch (error: any) {
      // Revert on error
      setModules(modules);
      toast.error(error?.message || "Failed to update module order");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModuleEditor = (module?: Module) => {
    if (module) {
      setEditingModule(module);
    } else {
      setEditingModule(null);
    }
    setShowModuleModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Learning Path Management</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create and manage learning paths, modules, and quizzes for students and mentors
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md"
          >
            <Plus size={18} />
            Create Learning Path
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Learning Paths Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={20} className="text-slate-600" />
                  <h2 className="text-lg font-semibold text-slate-900">Learning Paths</h2>
                  <span className="ml-auto rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {learningPaths.length}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {loading && learningPaths.length === 0 ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#111827] border-t-transparent"></div>
                  </div>
                ) : learningPaths.length === 0 ? (
                  <div className="p-8 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-500">No learning paths yet</p>
                    <p className="mt-1 text-xs text-slate-400">Create your first learning path to get started</p>
                  </div>
                ) : (
                  learningPaths.map((path) => (
                    <LearningPathCard
                      key={path.id}
                      path={path}
                      isSelected={selectedPath?.id === path.id}
                      onSelect={() => handleSelectPath(path)}
                      onDelete={() => handleDeletePath(path.id)}
                      onEdit={(updatedData) => handleUpdatePath(path.id, updatedData)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Selected Path Details */}
          <div className="lg:col-span-2">
            {selectedPath ? (
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Path Header */}
                <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedPath.title}</h2>
                        {selectedPath.isCore && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            <CheckCircle2 size={12} />
                            Core
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          <Users size={12} />
                          {selectedPath.audience}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{selectedPath.description}</p>
                    </div>
                    <button
                      onClick={() => handleOpenModuleEditor()}
                      className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md"
                    >
                      <Plus size={16} />
                      Add Module
                    </button>
                  </div>
                </div>

                {/* Modules List */}
                <div className="p-6">
                  {modules.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={modules.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {modules.map((module, index) => (
                            <ModuleCard
                              key={module.id}
                              module={module}
                              index={index}
                              onEdit={() => handleOpenModuleEditor(module)}
                              onDelete={() => handleDeleteModule(module.id)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16">
                      <FileText size={64} className="text-slate-300" />
                      <p className="mt-4 text-sm font-medium text-slate-500">No modules yet</p>
                      <p className="mt-1 text-xs text-slate-400">Click "Add Module" to create your first module</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
                <div className="text-center">
                  <GraduationCap size={64} className="mx-auto text-slate-300" />
                  <p className="mt-4 text-lg font-semibold text-slate-500">Select a learning path</p>
                  <p className="mt-1 text-sm text-slate-400">Choose a learning path from the sidebar to view and manage its modules</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Learning Path Modal */}
      {showCreateModal && (
        <CreateLearningPathModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePath}
          loading={loading}
        />
      )}

      {/* Module Editor Modal */}
      {showModuleModal && selectedPath && (
        <ModuleEditorModal
          learningPath={selectedPath}
          module={editingModule}
          onClose={() => {
            setShowModuleModal(false);
            setEditingModule(null);
          }}
          onSubmit={editingModule ? 
            (data) => handleUpdateModule(editingModule.id, data) :
            handleAddModule
          }
          loading={loading}
        />
      )}
    </div>
  );
}
