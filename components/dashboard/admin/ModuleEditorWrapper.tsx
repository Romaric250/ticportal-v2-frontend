"use client";

import { NovelModuleEditor } from "./NovelModuleEditor";

interface ModuleEditorWrapperProps {
  content?: string; // JSON string content
  onChange?: (content: string) => void;
  placeholder?: string;
  moduleId?: string; // For key-based remounting
}

export const ModuleEditorWrapper = ({
  content,
  onChange,
  placeholder = "Type / for commands...",
  moduleId,
}: ModuleEditorWrapperProps) => {
  return (
    <div className="w-full">
      <NovelModuleEditor
        key={moduleId || "new-module"} // Force remount when switching between modules
        content={content}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
};
