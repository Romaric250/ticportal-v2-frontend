"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
  handleCommandNavigation,
  StarterKit,
  Placeholder,
  TiptapLink,
  TiptapImage,
  TiptapUnderline,
  Youtube,
  Command,
  createSuggestionItems,
  renderItems,
} from "novel";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Bold,
  Italic,
  Underline,
  Youtube as YoutubeIcon,
} from "lucide-react";
import { toast } from "sonner";

interface NovelModuleEditorProps {
  content?: string; // JSON string content
  onChange?: (content: string) => void;
  placeholder?: string;
}

export const NovelModuleEditor = ({
  content = "",
  onChange,
  placeholder = "Type / for commands...",
}: NovelModuleEditorProps) => {
  // Initialize with default empty doc structure immediately
  // Must have at least one paragraph node for the editor to be editable
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
  const isInitializedRef = useRef(false);

  // Store editor instance ref for immediate access
  const editorRef = useRef<EditorInstance | null>(null);
  const isInternalUpdateRef = useRef(false);
  const previousContentRef = useRef<string>("");

  // Configure extensions
  const starterKit = StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  });

  const placeholderExtension = Placeholder.configure({
    placeholder,
  });

  const tiptapLink = TiptapLink.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-[#111827] underline cursor-pointer",
    },
  });

  const tiptapImage = TiptapImage.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full",
    },
  });

  const youtube = Youtube.configure({
    HTMLAttributes: {
      class: "rounded-lg border border-slate-300",
    },
    inline: false,
  });

  // Create suggestion items for slash commands
  const suggestionItems = createSuggestionItems([
    {
      title: "Heading 1",
      description: "Big section heading",
      searchTerms: ["h1", "heading", "title"],
      icon: <Heading1 size={18} />,
      command: ({ editor, range }) => {
        const { from, to } = range;
        // Delete range and ensure we have a paragraph, then convert to heading
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .run();
        
        // Check if current node is a paragraph, if not insert one
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "paragraph") {
          editor.chain().focus().insertContent({ type: "paragraph", content: [] }).run();
        }
        
        // Now convert to heading
        editor.chain().focus().setHeading({ level: 1 }).run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      searchTerms: ["h2", "heading", "subtitle"],
      icon: <Heading2 size={18} />,
      command: ({ editor, range }) => {
        const { from, to } = range;
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .run();
        
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "paragraph") {
          editor.chain().focus().insertContent({ type: "paragraph", content: [] }).run();
        }
        
        editor.chain().focus().setHeading({ level: 2 }).run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      searchTerms: ["h3", "heading"],
      icon: <Heading3 size={18} />,
      command: ({ editor, range }) => {
        const { from, to } = range;
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .run();
        
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "paragraph") {
          editor.chain().focus().insertContent({ type: "paragraph", content: [] }).run();
        }
        
        editor.chain().focus().setHeading({ level: 3 }).run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a bullet list",
      searchTerms: ["ul", "bullet", "list"],
      icon: <List size={18} />,
      command: ({ editor, range }) => {
        const { from, to } = range;
        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .run();
        
        const { $from } = editor.state.selection;
        if ($from.parent.type.name !== "paragraph") {
          editor.chain().focus().insertContent({ type: "paragraph", content: [] }).run();
        }
        
        editor.chain().focus().toggleBulletList().run();
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
        editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").toggleBlockquote().run();
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
      title: "Youtube",
      description: "Embed a Youtube video",
      searchTerms: ["video", "youtube", "embed"],
      icon: <YoutubeIcon size={18} />,
      command: ({ editor, range }) => {
        const videoLink = prompt("Please enter Youtube Video Link");
        const ytregex = new RegExp(
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/
        );

        if (videoLink && ytregex.test(videoLink)) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .setYoutubeVideo({
              src: videoLink,
            })
            .run();
        } else {
          if (videoLink !== null) {
            toast.error("Please enter a correct Youtube Video Link");
          }
        }
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

  const slashCommand = Command.configure({
    suggestion: {
      items: () => suggestionItems,
      render: renderItems,
    },
  });

  const allExtensions = [
    starterKit,
    placeholderExtension,
    TiptapUnderline,
    slashCommand,
    tiptapLink,
    tiptapImage,
    youtube,
  ];

  // Immediate update (for form validation)
  const updateContentImmediately = useCallback(
    (editor: EditorInstance) => {
      const json = editor.getJSON();
      const jsonString = JSON.stringify(json);
      editorRef.current = editor;

      // Only update if content actually changed to avoid feedback loops
      if (jsonString !== previousContentRef.current) {
        previousContentRef.current = jsonString;
        isInternalUpdateRef.current = true;

        if (onChange) {
          onChange(jsonString);
        }

        // Reset flag after a short delay
        setTimeout(() => {
          isInternalUpdateRef.current = false;
        }, 0);
      }
    },
    [onChange]
  );

  // Track the content used for initialization to detect when it changes
  const initializedContentRef = useRef<string>("");

  // Update content when prop changes (but not due to internal updates)
  useEffect(() => {
    // Skip if it's an internal update
    if (isInternalUpdateRef.current) {
      return;
    }

    // Only update if content actually changed
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
      <EditorRoot>
        <EditorContent
          initialContent={initialContent}
          extensions={allExtensions as any}
          immediatelyRender={false}
          editable={true}
          className="novel-editor-content relative min-h-[500px] w-full border-slate-300 bg-white rounded-lg border"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: "prose prose-slate max-w-none focus:outline-none min-h-[500px] px-4 py-3",
            },
          }}
          onUpdate={({ editor }) => {
            // Update immediately for form validation
            updateContentImmediately(editor);
          }}
        >
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-slate-200 bg-white px-1 py-2 shadow-md transition-all">
            <EditorCommandEmpty className="px-2 text-sm text-slate-500">
              No results
            </EditorCommandEmpty>
            <EditorCommandList>
              {suggestionItems.map((item) => (
                <EditorCommandItem
                  value={item.title}
                  onCommand={(val) => {
                    if (item.command && val) {
                      // val contains { editor, range } from novel's command system
                      console.log("Executing command:", item.title, val);
                      try {
                        item.command(val);
                        // Force a small delay to ensure the command completes
                        setTimeout(() => {
                          val.editor.view.dom.dispatchEvent(new Event('input', { bubbles: true }));
                        }, 0);
                      } catch (error) {
                        console.error("Command error:", error);
                      console.error("Command details:", { item: item.title, val });
                      toast.error(`Failed to execute ${item.title} command`);
                      }
                    }
                  }}
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

