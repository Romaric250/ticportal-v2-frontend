"use client";

import type { SelectHTMLAttributes } from "react";
import { cn } from "../../src/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none ring-0 ring-offset-0 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}


