"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { adminService } from "../../src/lib/services/adminService";
import { cn } from "../../src/utils/cn";

type TeamLite = {
  id: string;
  name: string;
  projectTitle?: string | null;
  reviewerAssignmentCount?: number;
};

type Props = {
  value: string | null;
  onChange: (teamId: string | null, team?: TeamLite) => void;
  label: string;
  disabled?: boolean;
};

export function TeamSearchPicker({ value, onChange, label, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 350);
  const [results, setResults] = useState<TeamLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<TeamLite | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setPicked(null);
      setQ("");
    }
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const search = debounced.trim().length >= 2 ? debounced.trim() : undefined;
    adminService
      .getTeams(1, 20, search ? { search } : undefined)
      .then((res) => {
        const teams = res?.teams ?? [];
        if (!cancelled) {
          setResults(
            teams.map((t) => ({
              id: t.id,
              name: t.name,
              projectTitle: t.projectTitle ?? null,
              reviewerAssignmentCount: t.reviewerAssignmentCount,
            }))
          );
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const display =
    picked && picked.id === value
      ? picked
      : value
        ? results.find((t) => t.id === value)
        : undefined;

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          disabled={disabled}
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
          placeholder="Search teams by name or project (or open to browse first 150)…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {value && (
          <button
            type="button"
            className="shrink-0 rounded border border-slate-200 px-2 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => {
              setPicked(null);
              onChange(null);
            }}
          >
            Clear
          </button>
        )}
      </div>
      {value && (
        <p className="mt-1 text-xs text-slate-600">
          Selected:{" "}
          <span className="font-medium text-slate-900">
            {display ? display.name : `Team ID: ${value}`}
            {display?.projectTitle ? ` — ${display.projectTitle}` : ""}
          </span>
        </p>
      )}
      {open && !disabled && (
        <ul
          className={cn(
            "absolute z-[110] mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg",
            "text-sm"
          )}
        >
          {loading && <li className="px-3 py-2 text-slate-500">Loading teams…</li>}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-slate-500">No teams found.</li>
          )}
          {results.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => {
                  setPicked(t);
                  onChange(t.id, t);
                  setQ("");
                  setOpen(false);
                }}
              >
                <span className="font-medium text-slate-900">{t.name}</span>
                {t.projectTitle && <span className="block text-xs text-slate-500">{t.projectTitle}</span>}
                {t.reviewerAssignmentCount != null && t.reviewerAssignmentCount > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        t.reviewerAssignmentCount >= 2
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {t.reviewerAssignmentCount >= 2
                        ? "Pair assigned (2)"
                        : `${t.reviewerAssignmentCount} reviewer${t.reviewerAssignmentCount === 1 ? "" : "s"}`}
                    </span>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
