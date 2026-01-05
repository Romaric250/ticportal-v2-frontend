"use client";

import { X, Users, Link2, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { teamService, type Team } from "../../../src/lib/services/teamService";
import { userService, type SearchUserResult } from "../../../src/lib/services/userService";
import { toast } from "sonner";

type Props = {
  team: Team;
  onClose: () => void;
  onMemberAdded: () => void;
};

type Tab = "add" | "invite";

export function AddMemberModal({ team, onClose, onMemberAdded }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/team/${team.id}/invite`;

  // Get existing member IDs to filter them out - memoized to prevent unnecessary re-renders
  const existingMemberIds = useMemo(
    () => new Set(team.members?.map((m) => m.userId) || []),
    [team.members]
  );

  // Search users when query changes
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    let isCancelled = false;

    const searchUsers = async () => {
      try {
        setSearching(true);
        const results = await userService.searchUsers(searchQuery);
        
        // Don't update state if the request was cancelled or query changed
        if (isCancelled) return;
        
        // Filter out users who are already team members
        const filtered = results.filter((user) => !existingMemberIds.has(user.id));
        setSearchResults(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error searching users:", error);
        if (!isCancelled) {
          setSearchResults([]);
          setShowSuggestions(false);
        }
      } finally {
        if (!isCancelled) {
          setSearching(false);
        }
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery, existingMemberIds]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async (userId: string) => {
    try {
      setAdding(userId);
      await teamService.addMember(team.id, {
        userId,
        role: "MEMBER",
      });
      toast.success("Member added successfully");
      setSearchQuery("");
      setSearchResults([]);
      setShowSuggestions(false);
      onMemberAdded();
      onClose();
    } catch (error: any) {
      console.error("Error adding member:", error);
      toast.error(error?.message || "Failed to add member");
    } finally {
      setAdding(null);
    }
  };

  const handleSelectUser = (user: SearchUserResult) => {
    handleAddMember(user.id);
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
              <span>Search & Add</span>
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
              <div className="relative">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Search User
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search for user by name or email..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowSuggestions(false);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSuggestions && searchQuery.trim().length >= 2 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-64 overflow-y-auto"
                  >
                    {searching ? (
                      <div className="p-3 text-sm text-slate-500 flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Searching...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => {
                        // Double-check: don't show Add button if user is already a member
                        const isExistingMember = existingMemberIds.has(user.id);
                        
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => !isExistingMember && handleSelectUser(user)}
                            disabled={adding === user.id || isExistingMember}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-slate-100 last:border-b-0"
                          >
                            {user.profilePhoto ? (
                              <img
                                src={user.profilePhoto}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                                {user.firstName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                              {user.username && (
                                <p className="text-xs text-slate-400">@{user.username}</p>
                              )}
                            </div>
                            {isExistingMember ? (
                              <span className="text-xs text-slate-500 italic">Already a member</span>
                            ) : adding === user.id ? (
                              <Loader2 size={16} className="animate-spin text-slate-400" />
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectUser(user);
                                }}
                                className="rounded-lg bg-[#111827] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937]"
                              >
                                Add
                              </button>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-sm text-slate-500 text-center">
                        No search found
                      </div>
                    )}
                  </div>
                )}
                {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Type at least 2 characters to search
                  </p>
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


