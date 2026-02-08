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
import { EditLearningPathModal } from "../../../../../components/dashboard/admin/EditLearningPathModal";
import { ModuleEditorModal } from "../../../../../components/dashboard/admin/ModuleEditorModal";
import { LearningPathCard } from "../../../../../components/dashboard/admin/LearningPathCard";
import { ModuleCard } from "../../../../../components/dashboard/admin/ModuleCard";
import { DeleteConfirmationModal } from "../../../../../components/dashboard/admin/DeleteConfirmationModal";

export default function AdminLearningPathPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [deletePathId, setDeletePathId] = useState<string | null>(null);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    status: "DRAFT" | "ACTIVE";
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

  const handleEditPathClick = (path: LearningPath) => {
    setEditingPath(path);
    setShowEditModal(true);
  };

  const handleUpdatePath = async (formData: {
    title: string;
    description: string;
    audience: "STUDENTS" | "MENTORS" | "EVERYONE";
    isCore: boolean;
    status: "DRAFT" | "ACTIVE";
  }) => {
    if (!editingPath) return;

    try {
      setLoading(true);
      await learningPathService.update(editingPath.id, formData);
      toast.success("Learning path updated successfully");
      setShowEditModal(false);
      setEditingPath(null);
      await loadLearningPaths();
      if (selectedPath?.id === editingPath.id) {
        const updated = await learningPathService.getById(editingPath.id);
        setSelectedPath(updated);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update learning path");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePathClick = (id: string) => {
    setDeletePathId(id);
  };

  const handleDeletePathConfirm = async () => {
    if (!deletePathId) return;

    try {
      setDeleting(true);
      await learningPathService.delete(deletePathId);
      toast.success("Learning path deleted successfully");
      await loadLearningPaths();
      if (selectedPath?.id === deletePathId) {
        setSelectedPath(null);
      }
      setDeletePathId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete learning path");
    } finally {
      setDeleting(false);
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

  const handleDeleteModuleClick = (moduleId: string) => {
    setDeleteModuleId(moduleId);
  };

  const handleDeleteModuleConfirm = async () => {
    if (!deleteModuleId || !selectedPath) return;

    try {
      setDeleting(true);
      await learningPathService.deleteModule(selectedPath.id, deleteModuleId);
      toast.success("Module deleted successfully");
      await loadLearningPaths();
      // Reload selected path
      const updated = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updated);
      setModules(updated.modules?.sort((a, b) => a.order - b.order) || []);
      setDeleteModuleId(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete module");
    } finally {
      setDeleting(false);
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

  const pathToDelete = deletePathId ? learningPaths.find(p => p.id === deletePathId) : null;
  const moduleToDelete = deleteModuleId ? modules.find(m => m.id === deleteModuleId) : null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Path Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage learning paths, modules, and quizzes for students and mentors
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Plus size={16} />
          Create Learning Path
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Learning Paths Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-900 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <BookOpen size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-white">Learning Paths</h2>
                  <p className="mt-0.5 text-xs text-white/70">{learningPaths.length} total paths</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {loading && learningPaths.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
                </div>
              ) : learningPaths.length === 0 ? (
                <div className="p-12 text-center">
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
                    onDelete={() => handleDeletePathClick(path.id)}
                    onEdit={() => handleEditPathClick(path)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Path Details */}
        <div className="lg:col-span-2">
          {selectedPath ? (
            <div className="space-y-6">
              {/* Path Header */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-900 px-6 py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h2 className="text-xl font-bold text-white">{selectedPath.title}</h2>
                        {selectedPath.isCore && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                            <CheckCircle2 size={12} />
                            Core
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/20 px-2.5 py-1 text-xs font-medium text-white">
                          <Users size={12} />
                          {selectedPath.audience}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{selectedPath.description}</p>
                    </div>
                    <button
                      onClick={() => handleOpenModuleEditor()}
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                    >
                      <Plus size={16} />
                      Add Module
                    </button>
                  </div>
                </div>
              </div>

              {/* Modules Table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                  <h3 className="text-base font-semibold text-slate-900">Modules</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{modules.length} {modules.length === 1 ? 'module' : 'modules'} in this path</p>
                </div>
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
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b border-slate-200 bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 w-12">
                                #
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Module
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                                Quiz
                              </th>
                              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700 w-24">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {modules.map((module, index) => (
                              <ModuleCard
                                key={module.id}
                                module={module}
                                index={index}
                                onEdit={() => handleOpenModuleEditor(module)}
                                onDelete={() => handleDeleteModuleClick(module.id)}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FileText size={48} className="text-slate-300" />
                    <p className="mt-4 text-sm font-medium text-slate-500">No modules yet</p>
                    <p className="mt-1 text-xs text-slate-400">Click "Add Module" to create your first module</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="text-center px-4">
                <GraduationCap size={48} className="mx-auto text-slate-300" />
                <p className="mt-4 text-base font-semibold text-slate-500">Select a learning path</p>
                <p className="mt-1 text-sm text-slate-400">Choose a learning path from the sidebar to view and manage its modules</p>
              </div>
            </div>
          )}
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

      {/* Edit Learning Path Modal */}
      {showEditModal && editingPath && (
        <EditLearningPathModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPath(null);
          }}
          onSubmit={handleUpdatePath}
          loading={loading}
          path={editingPath}
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

      {/* Delete Path Confirmation Modal */}
      {deletePathId && pathToDelete && (
        <DeleteConfirmationModal
          isOpen={!!deletePathId}
          onClose={() => setDeletePathId(null)}
          onConfirm={handleDeletePathConfirm}
          title="Delete Learning Path"
          message="Are you sure you want to delete this learning path? All modules and associated data will be permanently removed."
          itemName={pathToDelete.title}
          loading={deleting}
        />
      )}

      {/* Delete Module Confirmation Modal */}
      {deleteModuleId && moduleToDelete && (
        <DeleteConfirmationModal
          isOpen={!!deleteModuleId}
          onClose={() => setDeleteModuleId(null)}
          onConfirm={handleDeleteModuleConfirm}
          title="Delete Module"
          message="Are you sure you want to delete this module? All content and quiz data will be permanently removed."
          itemName={moduleToDelete.title}
          loading={deleting}
        />
      )}
    </div>
  );
}
