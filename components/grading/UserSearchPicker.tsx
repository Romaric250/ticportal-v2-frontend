"use client";

import { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { adminService, type AdminUser } from "../../src/lib/services/adminService";
import { cn } from "../../src/utils/cn";

type Props = {
  value: string | null;
  onChange: (userId: string | null, user?: AdminUser) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
};

export function UserSearchPicker({ value, onChange, label, placeholder = "Search by name or email…", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 350);
  const [results, setResults] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<AdminUser | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

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
        ? results.find((u) => u.id === value)
        : undefined;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!debounced || debounced.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    adminService
      .getUsers(1, 30, { search: debounced.trim() })
      .then((res) => {
        if (!cancelled) setResults(res.users ?? []);
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
          {loading && <li className="px-3 py-2 text-slate-500">Searching…</li>}
          {!loading && q.trim().length < 2 && (
            <li className="px-3 py-2 text-slate-500">Type at least 2 characters</li>
          )}
          {!loading &&
            debounced.trim().length >= 2 &&
            results.length === 0 && (
              <li className="px-3 py-2 text-slate-500">No users found</li>
            )}
          {results.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
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
                <span className="block text-xs text-slate-500">{u.email}</span>
                <span className="text-xs text-slate-400">{u.role}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
