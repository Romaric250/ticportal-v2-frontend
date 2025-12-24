"use client";

import { X, Users, Link2, Copy, Check } from "lucide-react";
import { useState } from "react";

type Props = {
  onClose: () => void;
};

type Tab = "search" | "invite";

export function AddMemberModal({ onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const inviteUrl = "https://ticportal.com/team/alpha/invite/abc123xyz";

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            onClick={() => setActiveTab("search")}
            className={`cursor-pointer flex-1 px-5 py-3 text-sm font-medium transition ${
              activeTab === "search"
                ? "border-b-2 border-[#111827] text-[#111827]"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={16} />
              <span>Search Members</span>
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
          {activeTab === "search" ? (
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                />
              </div>

              <div className="max-h-64 space-y-2 overflow-y-auto">
                {searchQuery ? (
                  // Mock search results
                  <>
                    <MemberSearchResult
                      name="John Doe"
                      email="john.doe@example.com"
                      role="Developer"
                    />
                    <MemberSearchResult
                      name="Jane Smith"
                      email="jane.smith@example.com"
                      role="Designer"
                    />
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Start typing to search for members...
                  </div>
                )}
              </div>
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

type MemberSearchResultProps = {
  name: string;
  email: string;
  role: string;
};

function MemberSearchResult({ name, email, role }: MemberSearchResultProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200" />
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-slate-500">{email}</p>
          <p className="mt-0.5 text-xs text-slate-400">{role}</p>
        </div>
      </div>
      <button className="cursor-pointer rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937]">
        Invite
      </button>
    </div>
  );
}

