"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mail, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { adminService } from "@/src/lib/services/adminService";
import { userService, type SearchUserResult } from "@/src/lib/services/userService";

const THEME = "#111827";

export default function AdminSettingsPage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchUserResult[]>([]);
  const [selected, setSelected] = useState<SearchUserResult | null>(null);
  const [sendingOne, setSendingOne] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [confirmBroadcast, setConfirmBroadcast] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const list = await userService.searchUsers(q);
      setResults(list);
    } catch {
      setResults([]);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const sendToOne = async () => {
    if (!selected) {
      toast.error("Select a user first");
      return;
    }
    setSendingOne(true);
    try {
      const r = await adminService.sendTicCommunityWelcomeEmail(selected.id);
      toast.success(`Welcome email sent to ${r.email}`);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "Failed to send";
      toast.error(msg);
    } finally {
      setSendingOne(false);
    }
  };

  const sendToAll = async () => {
    if (!confirmBroadcast) {
      toast.error("Confirm that you want to email all active, verified users");
      return;
    }
    setBroadcasting(true);
    try {
      const r = await adminService.broadcastTicCommunityWelcomeEmail();
      toast.success(`Sent ${r.sent} email(s). Failed: ${r.failed}. Total users: ${r.total}.`);
      setConfirmBroadcast(false);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "message" in e ? String((e as { message?: string }).message) : "Broadcast failed";
      toast.error(msg);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Admin tools and announcements.</p>
      </header>

      <section
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        style={{ borderTopColor: THEME, borderTopWidth: 3 }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: THEME }}
          >
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">TIC Community welcome email</h2>
            <p className="mt-1 text-sm text-slate-600">
              Send the branded welcome message (same style as password reset). Test with one user, then broadcast to all
              active, verified accounts when you are ready.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Find a user
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none ring-[#111827] focus:ring-2"
              />
              {searching ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
              ) : null}
            </div>
            {query.trim().length >= 2 && results.length > 0 && !selected ? (
              <ul className="mt-2 max-h-48 overflow-auto rounded-xl border border-slate-200 bg-slate-50 text-sm shadow-sm">
                {results.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(u);
                        setQuery(`${u.firstName} ${u.lastName}`);
                        setResults([]);
                      }}
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-white"
                    >
                      <span className="font-medium text-slate-900">
                        {u.firstName} {u.lastName}
                      </span>
                      <span className="text-xs text-slate-500">{u.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {selected.firstName} {selected.lastName}
                </p>
                <p className="text-xs text-slate-600">{selected.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setQuery("");
                }}
                className="text-xs font-semibold text-slate-600 underline"
              >
                Clear
              </button>
            </div>
          ) : null}

          <button
            type="button"
            disabled={!selected || sendingOne}
            onClick={() => void sendToOne()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: THEME }}
          >
            {sendingOne ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send welcome email to this user
          </button>
        </div>

        <hr className="my-8 border-slate-200" />

        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: THEME }}
          >
            <Users className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Send to everyone</h3>
              <p className="mt-1 text-sm text-slate-600">
                Delivers the same email to every <strong>active</strong> user with a <strong>verified</strong> email. This
                may take several minutes. Use only after you have tested with a single recipient.
              </p>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={confirmBroadcast}
                onChange={(e) => setConfirmBroadcast(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300"
              />
              <span>I understand this will email all active, verified users.</span>
            </label>
            <button
              type="button"
              disabled={!confirmBroadcast || broadcasting}
              onClick={() => void sendToAll()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {broadcasting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Send to all active, verified users
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
