"use client";

import { useRef } from "react";
import { cn } from "../../src/utils/cn";

type Props = {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: FileList) => void;
  className?: string;
};

export function FileUpload({
  label,
  accept,
  multiple,
  onFilesSelected,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="text-sm font-medium text-slate-200">{label}</div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900 px-4 py-8 text-xs text-slate-400 hover:border-[#111827] hover:text-[#f9fafb]"
      >
        Click to choose files or drag and drop
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && onFilesSelected) {
            onFilesSelected(e.target.files);
          }
        }}
      />
    </div>
  );
}


