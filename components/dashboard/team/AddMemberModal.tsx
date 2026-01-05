"use client";

import { X, Users, Link2, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { teamService, type Team } from "../../../src/lib/services/teamService";
import { toast } from "sonner";

type Props = {
  team: Team;
  onClose: () => void;
  onMemberAdded: () => void;
};

type Tab = "add" | "invite";

export function AddMemberModal({ team, onClose, onMemberAdded }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [userId, setUserId] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/team/${team.id}/invite`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async () => {
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    try {
      setAdding(true);
      await teamService.addMember(team.id, {
        userId: userId.trim(),
        role: "MEMBER",
      });
      toast.success("Member added successfully");
      setUserId("");
      onMemberAdded();
      onClose();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error(error?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Add Member</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("add")}
            className={`cursor-pointer flex-1 px-5 py-3 text-sm font-medium transition ${
              activeTab === "add"
                ? "border-b-2 border-[#111827] text-[#111827]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={16} />
              <span>Add by User ID</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("invite")}
            className={`cursor-pointer flex-1 px-5 py-3 text-sm font-medium transition ${
              activeTab === "invite"
                ? "border-b-2 border-[#111827] text-[#111827]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Link2 size={16} />
              <span>Copy Invite Link</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "add" ? (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  User ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID to add..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Enter the user ID of the person you want to add to the team.
                </p>
              </div>

              <button
                onClick={handleAddMember}
                disabled={!userId.trim() || adding}
                className="w-full rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {adding ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Share this link with anyone you want to invite to your team.
                They&apos;ll be able to join directly.
              </p>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937]"
                >
                  {copied ? (
                    <>
                      <Check size={14} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-700">Note:</p>
                <p className="mt-1">
                  This link will expire in 7 days. You can generate a new one
                  anytime.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


