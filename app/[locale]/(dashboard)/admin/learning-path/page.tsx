"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Users, Save, X, Trash2, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Editor } from "novel";
import { learningPathService, type LearningPath, type Module, type QuizQuestion } from "../../../../../src/lib/services/learningPathService";

export default function AdminLearningPathPage() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audience: "STUDENTS" as "STUDENTS" | "MENTORS" | "EVERYONE",
    isCore: false,
  });

  const [moduleData, setModuleData] = useState({
    title: "",
    content: "",
    order: 0,
    quiz: [] as QuizQuestion[],
  });

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

  const handleCreatePath = async () => {
    try {
      setLoading(true);
      const newPath = await learningPathService.create(formData);
      toast.success("Learning path created successfully");
      setShowCreateModal(false);
      setFormData({ title: "", description: "", audience: "STUDENTS", isCore: false });
      loadLearningPaths();
    } catch (error: any) {
      toast.error(error?.message || "Failed to create learning path");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!selectedPath) return;

    try {
      setLoading(true);
      const module = await learningPathService.addModule(selectedPath.id, moduleData);
      toast.success("Module added successfully");
      setShowModuleModal(false);
      setModuleData({ title: "", content: "", order: 0, quiz: [] });
      loadLearningPaths();
      // Reload selected path
      const updated = await learningPathService.getById(selectedPath.id);
      setSelectedPath(updated);
    } catch (error: any) {
      toast.error(error?.message || "Failed to add module");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePath = async (id: string) => {
    if (!confirm("Are you sure you want to delete this learning path?")) return;

    try {
      await learningPathService.delete(id);
      toast.success("Learning path deleted");
      loadLearningPaths();
      if (selectedPath?.id === id) {
        setSelectedPath(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete learning path");
    }
  };

  const addQuizQuestion = () => {
    setModuleData((prev) => ({
      ...prev,
      quiz: [
        ...prev.quiz,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ],
    }));
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setModuleData((prev) => ({
      ...prev,
      quiz: prev.quiz.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      ),
    }));
  };

  const removeQuizQuestion = (index: number) => {
    setModuleData((prev) => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Learning Path Management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Create and manage learning paths, modules, and quizzes for students and mentors.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          <Plus size={16} />
          Create Learning Path
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Learning Paths List */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 p-4">
              <h2 className="font-semibold text-slate-900">Learning Paths</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {loading && learningPaths.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
              ) : learningPaths.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No learning paths yet</div>
              ) : (
                learningPaths.map((path) => (
                  <div
                    key={path.id}
                    onClick={() => setSelectedPath(path)}
                    className={`cursor-pointer p-4 transition hover:bg-slate-50 ${
                      selectedPath?.id === path.id ? "bg-slate-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900">{path.title}</h3>
                          {path.isCore && (
                            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Core
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{path.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span>{path.modules?.length || 0} modules</span>
                          <span>{path.audience}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePath(path.id);
                        }}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Path Details */}
        <div className="lg:col-span-2">
          {selectedPath ? (
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedPath.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{selectedPath.description}</p>
                  </div>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-[#111827] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1f2937]"
                  >
                    <Plus size={14} />
                    Add Module
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {selectedPath.modules && selectedPath.modules.length > 0 ? (
                    selectedPath.modules
                      .sort((a, b) => a.order - b.order)
                      .map((module, index) => (
                        <div key={module.id} className="rounded-lg border border-slate-200 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-500">
                                  Module {index + 1}
                                </span>
                                <h3 className="font-semibold text-slate-900">{module.title}</h3>
                              </div>
                              {module.quiz && module.quiz.length > 0 && (
                                <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                  {module.quiz.length} quiz questions
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingModule(module);
                                  setModuleData({
                                    title: module.title,
                                    content: module.content,
                                    order: module.order,
                                    quiz: module.quiz || [],
                                  });
                                  setShowModuleModal(true);
                                }}
                                className="rounded p-1 text-slate-600 hover:bg-slate-100"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center text-sm text-slate-500">
                      No modules yet. Click "Add Module" to get started.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <div className="text-center">
                <BookOpen size={48} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">Select a learning path to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Learning Path Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Create Learning Path</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Audience</label>
                <select
                  value={formData.audience}
                  onChange={(e) =>
                    setFormData({ ...formData, audience: e.target.value as any })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                >
                  <option value="STUDENTS">Students</option>
                  <option value="MENTORS">Mentors</option>
                  <option value="EVERYONE">Everyone</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCore"
                  checked={formData.isCore}
                  onChange={(e) => setFormData({ ...formData, isCore: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isCore" className="text-sm font-medium text-slate-700">
                  Core (Required for all students)
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePath}
                  disabled={loading || !formData.title}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingModule ? "Edit Module" : "Add Module"}
              </h2>
              <button
                onClick={() => {
                  setShowModuleModal(false);
                  setEditingModule(null);
                  setModuleData({ title: "", content: "", order: 0, quiz: [] });
                }}
                className="rounded p-1 text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Module Title</label>
                <input
                  type="text"
                  value={moduleData.title}
                  onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Content</label>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Content (JSON from Novel.sh editor)
                  </label>
                  <textarea
                    value={moduleData.content}
                    onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                    rows={10}
                    placeholder='Paste JSON content from Novel.sh editor here (e.g., {"type":"doc","content":[...]})'
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus:border-[#111827] focus:outline-none"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Note: In production, integrate the Novel.sh editor component here. Content should be stored as JSON string.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Order</label>
                <input
                  type="number"
                  value={moduleData.order}
                  onChange={(e) =>
                    setModuleData({ ...moduleData, order: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-[#111827] focus:outline-none"
                />
              </div>

              {/* Quiz Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Quiz Questions (Optional)
                  </label>
                  <button
                    onClick={addQuizQuestion}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Add Question
                  </button>
                </div>
                <div className="space-y-4">
                  {moduleData.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="rounded-lg border border-slate-200 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">
                          Question {qIndex + 1}
                        </span>
                        <button
                          onClick={() => removeQuizQuestion(qIndex)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Question"
                        value={question.question}
                        onChange={(e) =>
                          updateQuizQuestion(qIndex, "question", e.target.value)
                        }
                        className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                      />
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => updateQuizQuestion(qIndex, "correctAnswer", oIndex)}
                              className="border-slate-300"
                            />
                            <input
                              type="text"
                              placeholder={`Option ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[oIndex] = e.target.value;
                                updateQuizQuestion(qIndex, "options", newOptions);
                              }}
                              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#111827] focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowModuleModal(false);
                    setEditingModule(null);
                    setModuleData({ title: "", content: "", order: 0, quiz: [] });
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModule}
                  disabled={loading || !moduleData.title}
                  className="rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingModule ? "Update" : "Add Module"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
