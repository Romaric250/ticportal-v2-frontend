"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gradingService, type ReviewerRow } from "../../src/lib/services/gradingService";
import { cn } from "../../src/utils/cn";

let _cachedReviewers: ReviewerRow[] | null = null;
let _cachePromise: Promise<ReviewerRow[]> | null = null;

function loadReviewers(): Promise<ReviewerRow[]> {
  if (_cachedReviewers) return Promise.resolve(_cachedReviewers);
  if (_cachePromise) return _cachePromise;
  _cachePromise = gradingService
    .listReviewers()
    .then((list) => {
      _cachedReviewers = list;
      return _cachedReviewers;
    })
    .catch(() => {
      _cachePromise = null;
      return [] as ReviewerRow[];
    });
  return _cachePromise;
}

type Props = {
  value: string | null;
  onChange: (userId: string | null, user?: ReviewerRow) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
};

export function UserSearchPicker({ value, onChange, label, placeholder = "Type to filter…", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [allJudges, setAllJudges] = useState<ReviewerRow[]>(_cachedReviewers ?? []);
  const [loading, setLoading] = useState(!_cachedReviewers);
  const [picked, setPicked] = useState<ReviewerRow | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!_cachedReviewers) {
      setLoading(true);
      loadReviewers().then((list) => {
        if (!cancelled) {
          setAllJudges(list);
          setLoading(false);
        }
      });
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!value) {
      setPicked(null);
      setQ("");
    }
  }, [value]);

  const display =
    picked && picked.id === value
      ? picked
      : value
        ? allJudges.find((u) => u.id === value)
        : undefined;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return allJudges;
    return allJudges.filter(
      (u) =>
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
    );
  }, [allJudges, q]);

  return (
    <div ref={wrapRef} className="relative">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="mt-1 flex gap-2">
        <input
          type="text"
          disabled={disabled}
          className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
          placeholder={placeholder}
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
            onClick={() => onChange(null)}
          >
            Clear
          </button>
        )}
      </div>
      {value && (
        <p className="mt-1 text-xs text-slate-600">
          Selected:{" "}
          <span className="font-medium text-slate-900">
            {display
              ? `${display.firstName} ${display.lastName} (${display.email})`
              : `User ID: ${value}`}
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
          {loading && <li className="px-3 py-2 text-slate-500">Loading reviewers…</li>}
          {!loading && filtered.length === 0 && (
            <li className="px-3 py-2 text-slate-500">No reviewers found</li>
          )}
          {!loading &&
            filtered.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-slate-50",
                    u.id === value && "bg-slate-100"
                  )}
                  onClick={() => {
                    setPicked(u);
                    onChange(u.id, u);
                    setQ("");
                    setOpen(false);
                  }}
                >
                  <span className="font-medium text-slate-900">
                    {u.firstName} {u.lastName}
                  </span>
                  <span className="ml-2 text-xs text-slate-500">{u.email}</span>
                  {u.region && <span className="ml-2 text-xs text-slate-400">· {u.region}</span>}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
