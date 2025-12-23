"use client";

import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../src/utils/cn";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 ring-offset-0 placeholder:text-slate-500 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]",
        className
      )}
      {...props}
    />
  );
}


