"use client";

import { useState, useRef, useMemo } from "react";
import { X, FileText, HelpCircle, Plus, Trash2, Heading1, Heading2, Heading3, List, ListOrdered, Quote, Code, Bold, Italic, Underline } from "lucide-react";
import type { LearningPath, Module, QuizQuestion } from "../../../src/lib/services/learningPathService";
import { 
  EditorRoot, 
  EditorContent, 
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  StarterKit,
  Placeholder,
  Command,
  createSuggestionItems,
  renderItems,
  type JSONContent,
  type SuggestionItem
} from "novel";
import { TiptapLink } from "novel";
import { TiptapImage } from "novel";
import { TiptapUnderline } from "novel";

interface ModuleEditorModalProps {
  learningPath: LearningPath;
  module: Module | null;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    content: string;
    order: number;
    quiz: QuizQuestion[];
  }) => void;
  loading: boolean;
}

export function ModuleEditorModal({
  learningPath,
  module,
  onClose,
  onSubmit,
  loading,
}: ModuleEditorModalProps) {
  const [title, setTitle] = useState(module?.title || "");
  const [order, setOrder] = useState(module?.order || (learningPath.modules?.length || 0));
  const [quiz, setQuiz] = useState<QuizQuestion[]>(module?.quiz || []);
  const [activeTab, setActiveTab] = useState<"content" | "quiz">("content");
  const editorInstanceRef = useRef<any>(null);

  // Parse and memoize initial content for editor - always return valid doc structure
  const initialContent = useMemo<JSONContent>(() => {
    // Default empty doc structure that novel editor expects
    const defaultContent: JSONContent = {
      type: 'doc',
      content: []
    };

    if (module?.content) {
      try {
        const parsed = JSON.parse(module.content);
        // Validate it's a proper doc structure with correct schema
        if (
          parsed && 
          typeof parsed === 'object' && 
          parsed.type === 'doc' && 
          Array.isArray(parsed.content)
        ) {
          return parsed as JSONContent;
        }
        // If parsed but invalid structure, return default
        return defaultContent;
      } catch (e) {
        console.error('Failed to parse module content:', e);
        return defaultContent;
      }
    }
    // Return default empty doc structure for new modules
    return defaultContent;
  }, [module?.id, module?.content]);

  // Create suggestion items for slash commands - MUST use createSuggestionItems
  const suggestionItems = createSuggestionItems([
    {
      title: "Heading 1",
      description: "Big section heading",
      searchTerms: ["h1", "heading", "title"],
      icon: <Heading1 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["h2", "heading", "subtitle"],
      icon: <Heading2 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["h3", "heading"],
      icon: <Heading3 size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a bullet list",
      searchTerms: ["ul", "bullet", "list"],
      icon: <List size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      searchTerms: ["ol", "numbered", "list"],
      icon: <ListOrdered size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Quote",
      description: "Create a quote block",
      searchTerms: ["quote", "blockquote"],
      icon: <Quote size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Code Block",
      description: "Create a code block",
      searchTerms: ["code", "pre"],
      icon: <Code size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Bold",
      description: "Make text bold",
      searchTerms: ["bold", "strong"],
      icon: <Bold size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBold().run();
      },
    },
    {
      title: "Italic",
      description: "Make text italic",
      searchTerms: ["italic", "em"],
      icon: <Italic size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleItalic().run();
      },
    },
    {
      title: "Underline",
      description: "Make text underlined",
      searchTerms: ["underline", "u"],
      icon: <Underline size={18} />,
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleUnderline().run();
      },
    },
  ]);

  // Configure Command extension with renderItems - THIS IS CRITICAL
  const slashCommand = Command.configure({
    suggestion: {
      items: () => suggestionItems,
      render: renderItems,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Get content from editor
    let editorContent = "";
    if (editorInstanceRef.current) {
      const json = editorInstanceRef.current.getJSON();
      editorContent = JSON.stringify(json);
    } else if (module?.content) {
      // Fallback to existing content if editor not initialized
      editorContent = module.content;
    }
    
    onSubmit({
      title: title.trim(),
      content: editorContent,
      order,
      quiz,
    });
  };

  const addQuizQuestion = () => {
    setQuiz([
      ...quiz,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    setQuiz(
      quiz.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    );
  };

  const removeQuizQuestion = (index: number) => {
    setQuiz(quiz.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-xl border border-slate-200 bg-white shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#111827] p-2">
                <FileText size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {module ? "Edit Module" : "Add Module"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6 flex-shrink-0">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "content"
                  ? "border-[#111827] text-[#111827]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Content
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("quiz")}
              className={`cursor-pointer border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "quiz"
                  ? "border-[#111827] text-[#111827]"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Quiz (Optional)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-5">
              {/* Module Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Introduction to Business Models"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                  required
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Lower numbers appear first. Modules are sorted by order.
                </p>
              </div>

              {/* Content Tab */}
              {activeTab === "content" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Module Content <span className="text-red-500">*</span>
                  </label>
                  <div className="rounded-lg border border-slate-300 bg-white overflow-hidden min-h-[500px] shadow-sm">
                    <EditorRoot key={module?.id || "new-module"}>
                      <EditorContent
                        extensions={[
                          StarterKit.configure({
                            heading: {
                              levels: [1, 2, 3],
                            },
                          }),
                          Placeholder.configure({
                            placeholder: "Type '/' for formatting options...",
                          }),
                          TiptapUnderline,
                          slashCommand,
                          TiptapLink.configure({
                            openOnClick: false,
                            HTMLAttributes: {
                              class: "text-[#111827] underline cursor-pointer",
                            },
                          }),
                          TiptapImage.configure({
                            HTMLAttributes: {
                              class: "rounded-lg max-w-full",
                            },
                          }),
                        ]}
                        initialContent={initialContent}
                        className="min-h-[500px] w-full prose prose-slate max-w-none focus:outline-none px-4 py-3"
                        editorProps={{
                          attributes: {
                            class: "prose prose-slate max-w-none focus:outline-none min-h-[500px] px-4 py-3",
                          },
                        }}
                        onUpdate={({ editor }) => {
                          if (editor) {
                            editorInstanceRef.current = editor;
                          }
                        }}
                      >
                        <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-slate-200 bg-white px-1 py-2 shadow-md transition-all">
                          <EditorCommandEmpty className="px-2 text-sm text-slate-500">
                            No results found
                          </EditorCommandEmpty>
                          <EditorCommandList>
                            {suggestionItems.map((item) => (
                              <EditorCommandItem
                                value={item.title}
                                onCommand={(val) => {
                                  if (item.command) {
                                    item.command(val);
                                  }
                                }}
                                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 aria-selected:bg-slate-100 cursor-pointer"
                                key={item.title}
                              >
                                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600">
                                  {item.icon}
                                </div>
                                <div className="flex flex-col">
                                  <p className="font-medium">{item.title}</p>
                                  <p className="text-xs text-slate-500">{item.description}</p>
                                </div>
                              </EditorCommandItem>
                            ))}
                          </EditorCommandList>
                        </EditorCommand>
                      </EditorContent>
                    </EditorRoot>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Type <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded">/</kbd> to see formatting options. Use the editor to create rich, formatted content with styles.
                  </p>
                </div>
              )}

              {/* Quiz Tab */}
              {activeTab === "quiz" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-700">
                      Quiz Questions (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addQuizQuestion}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>

                  {quiz.length === 0 ? (
                    <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                      <HelpCircle size={32} className="mx-auto text-slate-400" />
                      <p className="mt-2 text-sm font-medium text-slate-500">No quiz questions yet</p>
                      <p className="mt-1 text-xs text-slate-400">Add questions to test learners' understanding</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quiz.map((question, qIndex) => (
                        <div key={qIndex} className="rounded-lg border border-slate-200 bg-white p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-700">
                              Question {qIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeQuizQuestion(qIndex)}
                              className="cursor-pointer rounded p-1 text-red-500 transition-colors hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Enter your question..."
                            value={question.question}
                            onChange={(e) => updateQuizQuestion(qIndex, "question", e.target.value)}
                            className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                          />
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`correct-${qIndex}`}
                                  checked={question.correctAnswer === oIndex}
                                  onChange={() => updateQuizQuestion(qIndex, "correctAnswer", oIndex)}
                                  className="h-4 w-4 cursor-pointer border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
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
                                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/10"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex-shrink-0">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="cursor-pointer rounded-lg bg-[#111827] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#1f2937] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : module ? "Update Module" : "Add Module"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
