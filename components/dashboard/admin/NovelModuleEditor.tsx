"use client";

import { useEffect, useState, useRef } from "react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
  ImageResizer,
  handleCommandNavigation,
} from "novel";
import { defaultExtensions } from "./editor-extensions";
import { slashCommand, suggestionItems } from "./slash-commands";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "../../../src/utils/cn";

interface NovelModuleEditorProps {
  content?: string; // JSON string content
  onChange?: (content: string) => void;
  placeholder?: string;
  onEditorReady?: (getContent: () => string) => void;
}

const extensions = [...defaultExtensions, slashCommand];

export const NovelModuleEditor = ({
  content = "",
  onChange,
  placeholder = "Type / for commands...",
  onEditorReady,
}: NovelModuleEditorProps) => {
  const getDefaultContent = (): JSONContent => ({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  });

  const parseContent = (contentStr: string): JSONContent => {
    if (!contentStr) return getDefaultContent();
    
    try {
      const parsed = JSON.parse(contentStr);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.type === "doc" &&
        Array.isArray(parsed.content)
      ) {
        return parsed as JSONContent;
      }
    } catch (error) {
      console.error("Error parsing content:", error);
    }
    
    return getDefaultContent();
  };

  const [initialContent, setInitialContent] = useState<JSONContent>(() => parseContent(content));
  const isInternalUpdateRef = useRef(false);
  const editorRef = useRef<EditorInstance | null>(null);
  
  // Immediate update for form validation - no debounce
  const updateContentImmediately = ({ editor }: { editor: EditorInstance }) => {
    const wasFirstTime = editorRef.current === null;
    editorRef.current = editor;
    const json = editor.getJSON();
    const jsonString = JSON.stringify(json);
    
    if (onChange && !isInternalUpdateRef.current) {
      onChange(jsonString);
    }
    
    // Call onEditorReady when editor is first available
    if (wasFirstTime && onEditorReady) {
      onEditorReady(() => {
        if (editorRef.current) {
          return JSON.stringify(editorRef.current.getJSON());
        }
        return content;
      });
    }
  };
  
  // Debounced update for performance (optional, for save status, etc.)
  const debouncedUpdates = useDebouncedCallback(
    ({ editor }: { editor: EditorInstance }) => {
      // This can be used for save status, word count, etc. if needed
    },
    500
  );

  // Update content when prop changes (but not due to internal updates)
  useEffect(() => {
    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const newContent = parseContent(content);
    setInitialContent((prev) => {
      const prevStr = JSON.stringify(prev);
      const newStr = JSON.stringify(newContent);
      if (prevStr !== newStr) {
        return newContent;
      }
      return prev;
    });
  }, [content]);

  return (
    <div className="relative w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
          .novel-editor-content h1 {
            font-size: 2.25rem !important;
            line-height: 2.5rem !important;
            font-weight: 700 !important;
            margin-top: 2rem !important;
            margin-bottom: 1.5rem !important;
          }
          .novel-editor-content h2 {
            font-size: 1.875rem !important;
            line-height: 2.25rem !important;
            font-weight: 700 !important;
            margin-top: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          .novel-editor-content h3 {
            font-size: 1.5rem !important;
            line-height: 2rem !important;
            font-weight: 700 !important;
            margin-top: 1.25rem !important;
            margin-bottom: 0.75rem !important;
          }
        `
      }} />
      <EditorRoot>
        <EditorContent
          className={cn(
            "novel-editor-content",
            "bg-white shadow-sm rounded-lg overflow-hidden transition-all duration-300 relative",
            "border border-slate-300"
          )}
          initialContent={initialContent}
          extensions={extensions as any}
          editable={true}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: cn(
                "prose prose-lg prose-slate dark:prose-invert prose-p:mb-4 prose-p:leading-relaxed font-default focus:outline-none max-w-none p-8 min-h-[500px]"
              ),
            },
          }}
          onUpdate={({ editor }) => {
            // Update immediately for form validation
            updateContentImmediately({ editor });
            // Also debounce for performance metrics
            debouncedUpdates({ editor });
          }}
          slotAfter={<ImageResizer />}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-slate-200 bg-white px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-sm text-slate-500">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => item.command?.(val)}
                  className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-100 aria-selected:bg-slate-100 text-slate-900 cursor-pointer"
                  key={item.title}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
                    {item.icon}
                  </div>
                  <div>
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
  );
};
