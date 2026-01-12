import {
  TiptapImage,
  TiptapLink,
  UpdatedImage,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  AIHighlight,
} from "novel";
import { Youtube } from "@tiptap/extension-youtube";
import { UploadImagesPlugin } from "novel";
import { cx } from "class-variance-authority";
import { Typography } from "@tiptap/extension-typography";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";

const aiHighlight = AIHighlight;
const placeholder = Placeholder.configure({
  placeholder: "Type '/' for commands...",
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx("text-[#111827] underline underline-offset-[3px] hover:text-[#1f2937] transition-colors cursor-pointer"),
  },
});

const tiptapImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-slate-200"),
      }),
    ];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-slate-300"),
  },
});

const updatedImage = UpdatedImage.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-slate-300"),
  },
});

const youTube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-slate-300"),
  },
  inline: false,
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex gap-2 items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-slate-300"),
  },
});

const starterKit = StarterKit.configure({
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2 mb-4"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2 mb-4"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-slate-400 pl-4 my-4 italic"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-md bg-slate-900 text-slate-100 border border-slate-700 p-5 font-mono font-medium my-4"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-slate-800 px-1.5 py-1 font-mono font-medium text-slate-100"),
      spellcheck: "false",
    },
  },
  heading: {
    levels: [1, 2, 3],
    HTMLAttributes: {
      class: cx("font-bold mb-4 mt-6"),
    },
  },
  paragraph: {
    HTMLAttributes: {
      class: cx("mb-4 leading-relaxed"),
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: "#3B82F6",
    width: 4,
  },
  gapcursor: false,
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  tiptapLink,
  tiptapImage,
  youTube,
  Typography,
  Subscript,
  Superscript,
  updatedImage,
  taskList,
  taskItem,
  horizontalRule,
  aiHighlight,
];

