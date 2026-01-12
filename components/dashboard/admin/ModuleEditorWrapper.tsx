"use client";

import { useRef } from "react";
import { NovelModuleEditor } from "./NovelModuleEditor";

interface ModuleEditorWrapperProps {
  content?: string; // JSON string content
  onChange?: (content: string) => void;
  placeholder?: string;
  moduleId?: string; // For key-based remounting
  onEditorReady?: (getContent: () => string) => void;
}

export const ModuleEditorWrapper = ({
  content,
  onChange,
  placeholder = "Type / for commands...",
  moduleId,
  onEditorReady,
}: ModuleEditorWrapperProps) => {
  const contentRef = useRef<string>(content || "");

  const handleChange = (newContent: string) => {
    contentRef.current = newContent;
    onChange?.(newContent);
  };

  return (
    <div className="w-full">
      <NovelModuleEditor
        key={moduleId || "new-module"} // Force remount when switching between modules
        content={content}
        onChange={handleChange}
        placeholder={placeholder}
        onEditorReady={onEditorReady ? () => onEditorReady(() => contentRef.current) : undefined}
      />
    </div>
  );
};
