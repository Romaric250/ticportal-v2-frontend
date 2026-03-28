"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { gradingService, type ReviewerRow } from "../../src/lib/services/gradingService";
import { adminService, type AdminUser } from "../../src/lib/services/adminService";
import { Modal } from "../ui/modal";

export function ReviewerManagement() {
  const [rows, setRows] = useState<ReviewerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ReviewerRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await gradingService.listReviewers();
      setRows(data);
    } catch {
      toast.error("Failed to load reviewers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Current reviewers</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {rows.length} reviewer{rows.length !== 1 ? "s" : ""} with access.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937]"
        >
          Add reviewer
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-slate-500">
                  No reviewers yet. Use &quot;Add reviewer&quot;.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 text-slate-800">
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="px-3 py-2 text-slate-600">{r.email}</td>
                  <td className="px-3 py-2 text-slate-600">{r.role}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      onClick={() => setRevokeTarget(r)}
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        variant="light"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add reviewers"
        className="max-w-xl"
      >
        <AddReviewerModalBody
          onDone={() => {
            setAddOpen(false);
            load();
          }}
        />
      </Modal>

      <Modal
        variant="light"
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke reviewer access"
        className="max-w-md"
      >
        {revokeTarget && (
          <div className="space-y-4 pt-1">
            <p className="text-sm text-slate-600">
              Remove reviewer access for{" "}
              <span className="font-medium text-slate-900">
                {revokeTarget.firstName} {revokeTarget.lastName}
              </span>{" "}
              ({revokeTarget.email})?
            </p>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setRevokeTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                onClick={async () => {
                  try {
                    await gradingService.setReviewer(revokeTarget.id, false);
                    toast.success("Reviewer access revoked");
                    setRevokeTarget(null);
                    load();
                  } catch (e: unknown) {
                    const msg =
                      e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
                    toast.error(msg || "Failed to revoke");
                  }
                }}
              >
                Revoke access
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function AddReviewerModalBody({ onDone }: { onDone: () => void }) {
  const [q, setQ] = useState("");
  const [debounced] = useDebounce(q, 350);
  const [searchResults, setSearchResults] = useState<AdminUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<AdminUser[]>([]);
  const [granting, setGranting] = useState(false);

  useEffect(() => {
    if (!debounced || debounced.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearching(true);
    adminService
      .getUsers(1, 40, { search: debounced.trim() })
      .then((res) => {
        if (!cancelled) setSearchResults(res.users ?? []);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const addToSelection = (u: AdminUser) => {
    setSelected((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]));
  };

  const removeFromSelection = (id: string) => {
    setSelected((prev) => prev.filter((x) => x.id !== id));
  };

  const grantBatch = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one user");
      return;
    }
    setGranting(true);
    try {
      for (const u of selected) {
        await gradingService.setReviewer(u.id, true);
      }
      toast.success(`Granted reviewer to ${selected.length} user(s)`);
      setSelected([]);
      setQ("");
      onDone();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "response" in e ? (e as any).response?.data?.message : null;
      toast.error(msg || "Grant failed");
    } finally {
      setGranting(false);
    }
  };

  return (
    <div className="space-y-4 pt-1">
      <p className="text-xs text-slate-500">
        Search by name or email (min. 2 characters). Add people to the list, then grant access in one step.
      </p>
      <input
        type="text"
        className="w-full rounded border border-slate-200 px-3 py-2 text-sm text-slate-900"
        placeholder="Search users…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className="max-h-40 overflow-auto rounded border border-slate-100 bg-slate-50">
        {searching && <p className="px-3 py-2 text-xs text-slate-500">Searching…</p>}
        {!searching && q.trim().length >= 2 && searchResults.length === 0 && (
          <p className="px-3 py-2 text-xs text-slate-500">No users found</p>
        )}
        {!searching &&
          searchResults.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-sm last:border-0"
            >
              <div className="min-w-0">
                <span className="font-medium text-slate-900">
                  {u.firstName} {u.lastName}
                </span>
                <span className="block truncate text-xs text-slate-500">{u.email}</span>
                <span className="text-xs text-slate-400">{u.role}</span>
              </div>
              <button
                type="button"
                className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"
                onClick={() => addToSelection(u)}
              >
                Add
              </button>
            </div>
          ))}
      </div>

      {selected.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600">Selected ({selected.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-800"
              >
                {u.firstName} {u.lastName}
                <button
                  type="button"
                  className="text-slate-500 hover:text-slate-900"
                  onClick={() => removeFromSelection(u.id)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          disabled={granting || selected.length === 0}
          onClick={grantBatch}
          className="rounded-md bg-[#111827] px-4 py-2 text-sm font-medium text-white hover:bg-[#1f2937] disabled:opacity-50"
        >
          {granting ? "Granting…" : `Grant access (${selected.length})`}
        </button>
      </div>
    </div>
  );
}
