"use client";

import type { ReactNode } from "react";

export type TableColumn<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
};

type Props<T> = {
  data: T[];
  columns: TableColumn<T>[];
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
}: Props<T>) {
  // Sorting/filtering behavior can be added later; this is a visual scaffold.
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
      <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-200">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-900/60">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-slate-500"
              >
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


