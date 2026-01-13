"use client";

import { useState } from "react";
import {
  EditorContent,
  EditorRoot,
  type JSONContent,
} from "novel";
import { defaultExtensions } from "../admin/editor-extensions";
import { slashCommand } from "../admin/slash-commands";
import { cn } from "../../../src/utils/cn";

interface ModuleContentViewerProps {
  content: string; // JSON string content
}

const extensions = [...defaultExtensions, slashCommand];

export const ModuleContentViewer = ({ content }: ModuleContentViewerProps) => {
  const parseContent = (contentStr: string): JSONContent => {
    if (!contentStr) {
      return {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [],
          },
        ],
      };
    }

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

    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [],
        },
      ],
    };
  };

  const [initialContent] = useState<JSONContent>(() => parseContent(content));

  return (
    <div className="relative w-full">
      <style dangerouslySetInnerHTML={{
        __html: `
          .module-content-viewer {
            font-size: 14px;
          }
          @media (min-width: 640px) {
            .module-content-viewer {
              font-size: 16px;
            }
          }
          .module-content-viewer h1 {
            font-size: 1.75rem !important;
            line-height: 2rem !important;
            font-weight: 700 !important;
            margin-top: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          @media (min-width: 640px) {
            .module-content-viewer h1 {
              font-size: 2.25rem !important;
              line-height: 2.5rem !important;
              margin-top: 2rem !important;
              margin-bottom: 1.5rem !important;
            }
          }
          .module-content-viewer h2 {
            font-size: 1.5rem !important;
            line-height: 1.75rem !important;
            font-weight: 700 !important;
            margin-top: 1.25rem !important;
            margin-bottom: 0.75rem !important;
          }
          @media (min-width: 640px) {
            .module-content-viewer h2 {
              font-size: 1.875rem !important;
              line-height: 2.25rem !important;
              margin-top: 1.5rem !important;
              margin-bottom: 1rem !important;
            }
          }
          .module-content-viewer h3 {
            font-size: 1.25rem !important;
            line-height: 1.5rem !important;
            font-weight: 700 !important;
            margin-top: 1rem !important;
            margin-bottom: 0.5rem !important;
          }
          @media (min-width: 640px) {
            .module-content-viewer h3 {
              font-size: 1.5rem !important;
              line-height: 2rem !important;
              margin-top: 1.25rem !important;
              margin-bottom: 0.75rem !important;
            }
          }
          .module-content-viewer p {
            margin-bottom: 1rem !important;
            line-height: 1.75 !important;
          }
          .module-content-viewer img {
            max-width: 100% !important;
            height: auto !important;
          }
          .module-content-viewer iframe,
          .module-content-viewer iframe[src*="youtube"],
          .module-content-viewer iframe[src*="youtu.be"],
          .module-content-viewer div[data-youtube-video] iframe {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            aspect-ratio: 16 / 9 !important;
            min-height: 200px !important;
            border-radius: 0.5rem !important;
          }
          @media (max-width: 640px) {
            .module-content-viewer iframe,
            .module-content-viewer iframe[src*="youtube"],
            .module-content-viewer iframe[src*="youtu.be"],
            .module-content-viewer div[data-youtube-video] iframe {
              min-height: 180px !important;
            }
          }
          .module-content-viewer div[data-youtube-video] {
            width: 100% !important;
            max-width: 100% !important;
            margin: 1rem 0 !important;
          }
          .module-content-viewer ul, .module-content-viewer ol {
            padding-left: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          .module-content-viewer li {
            margin-bottom: 0.5rem !important;
          }
        `
      }} />
      <EditorRoot>
        <EditorContent
          className={cn(
            "module-content-viewer",
            "bg-white rounded-lg overflow-hidden",
            "prose prose-sm sm:prose-lg prose-slate dark:prose-invert prose-p:mb-4 prose-p:leading-relaxed font-default max-w-none p-4 sm:p-6 lg:p-8"
          )}
          initialContent={initialContent}
          extensions={extensions as any}
          editable={false}
          editorProps={{
            attributes: {
              class: cn(
                "prose prose-sm sm:prose-lg prose-slate dark:prose-invert prose-p:mb-4 prose-p:leading-relaxed font-default focus:outline-none max-w-none"
              ),
            },
          }}
        />
      </EditorRoot>
    </div>
  );
};
