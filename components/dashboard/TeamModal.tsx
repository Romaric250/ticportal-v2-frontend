"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Plus, Search, X, Loader2, GraduationCap, Image as ImageIcon } from "lucide-react";
import { teamService, type Team } from "../../src/lib/services/teamService";
import { userService } from "../../src/lib/services/userService";
import { useAuthStore } from "../../src/state/auth-store";
import { toast } from "sonner";

type TeamModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TeamModal({ isOpen, onClose }: TeamModalProps) {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Create team form
  const [teamName, setTeamName] = useState("");
  const [school, setSchool] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Join team form
  const [searchQuery, setSearchQuery] = useState("");
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [isInTeam, setIsInTeam] = useState(false);

  // Check if user is in a team or has pending request
  useEffect(() => {
    if (!isOpen || !user) return;

    const checkTeamStatus = async () => {
      try {
        setLoading(true);
        const myTeams = await teamService.getMyTeams();
        setIsInTeam(myTeams.length > 0);
        
        // TODO: Check for pending requests when that API is available
        // For now, we'll assume no pending requests if not in a team
        setHasPendingRequest(false);
      } catch (error) {
        console.error("Error checking team status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTeamStatus();
  }, [isOpen, user]);

  // Load user profile to get school for create team form
  useEffect(() => {
    if (!isOpen || activeTab !== "create" || !user) return;

    const loadUserSchool = async () => {
      try {
        setLoadingProfile(true);
        const profile = await userService.getProfile();
        if (profile.school) {
          setSchool(profile.school);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        // Don't show error, just allow user to type school
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserSchool();
  }, [isOpen, activeTab, user]);

  // Search teams when query changes
  useEffect(() => {
    if (!isOpen || activeTab !== "join" || !searchQuery.trim()) {
      setAvailableTeams([]);
      return;
    }

    const searchTeams = async () => {
      try {
        setSearching(true);
        const response = await teamService.getAllTeams(1, 20);
        // Filter teams that user is not already a member of
        const myTeams = await teamService.getMyTeams();
        const myTeamIds = new Set(myTeams.map((t) => t.id));
        const filtered = response.data.filter((team) => !myTeamIds.has(team.id));
        
        // Simple search filter by name
        const query = searchQuery.toLowerCase();
        const matched = filtered.filter(
          (team) =>
            team.name.toLowerCase().includes(query) ||
            team.projectTitle?.toLowerCase().includes(query)
        );
        setAvailableTeams(matched);
      } catch (error) {
        console.error("Error searching teams:", error);
        toast.error("Failed to search teams");
      } finally {
        setSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchTeams, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isOpen, activeTab]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size must be less than 4MB");
      return;
    }

    setUploadingImage(true);
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setProfileImage(base64);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !school.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await teamService.createTeam({
        name: teamName.trim(),
        school: school.trim(),
        projectTitle: projectTitle.trim() || undefined,
        description: description.trim() || undefined,
        profileImage: profileImage || undefined,
      });
      toast.success("Team created successfully!");
      setIsInTeam(true);
      // Reset form
      setTeamName("");
      setSchool("");
      setProjectTitle("");
      setDescription("");
      setProfileImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Error creating team:", error);
      const errorMessage = error?.message || "Failed to create team. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestToJoin = async (teamId: string) => {
    try {
      // TODO: Implement request to join API when available
      // For now, we'll show a message that they need to contact the team lead
      toast.info("Join request sent! The team lead will review your request.");
      setHasPendingRequest(true);
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error: any) {
      console.error("Error requesting to join team:", error);
      toast.error("Failed to send join request. Please try again.");
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent closing by clicking outside if user is not in a team or doesn't have pending request
    if (!isInTeam && !hasPendingRequest) {
      e.stopPropagation();
      return;
    }
    // Only allow closing if user is in a team or has pending request
    if (isInTeam || hasPendingRequest) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - No close button since modal cannot be dismissed unless user is in team or has pending request */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827]">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Join or Create a Team</h2>
                <p className="text-sm text-slate-600">
                  {isInTeam || hasPendingRequest
                    ? "You're all set!"
                    : "You need to be part of a team to continue"}
                </p>
              </div>
            </div>
            {/* Only show close button if user is in a team or has pending request */}
            {(isInTeam || hasPendingRequest) && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "create"
                  ? "border-[#111827] text-[#111827]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Plus size={16} />
                Create Team
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("join")}
              className={`border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === "join"
                  ? "border-[#111827] text-[#111827]"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Search size={16} />
                Join Team
              </div>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : activeTab === "create" ? (
            <form onSubmit={handleCreateTeam} className="space-y-5">
              {/* Team Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                />
              </div>

              {/* School */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <GraduationCap size={16} className="text-slate-500" />
                  School <span className="text-red-500">*</span>
                </label>
                {loadingProfile ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Enter your school name"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                  />
                )}
              </div>

              {/* Project Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Project Title</label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Enter project title (optional)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter team description (optional)"
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20 resize-none"
                />
              </div>

              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Team Image (Optional)</label>
                <div className="space-y-3">
                  {profileImage ? (
                    <div className="relative inline-block">
                      <img
                        src={profileImage}
                        alt="Team preview"
                        className="h-32 w-32 rounded-lg object-cover border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:border-[#111827] hover:bg-slate-100 transition-colors"
                    >
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-sm text-slate-600">
                          {uploadingImage ? "Uploading..." : "Click to upload image"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Max 4MB, JPEG/PNG/GIF/WebP</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Search Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Search Teams</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by team name or project title..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Teams List */}
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-slate-400" />
                  </div>
                ) : searchQuery.trim() ? (
                  availableTeams.length > 0 ? (
                    availableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">{team.name}</h3>
                            {team.projectTitle && (
                              <p className="mt-1 text-sm text-slate-600">{team.projectTitle}</p>
                            )}
                            {team.description && (
                              <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                                {team.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRequestToJoin(team.id)}
                            className="ml-4 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f2937]"
                          >
                            Request to Join
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No teams found matching your search
                    </div>
                  )
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    Enter a search query to find teams
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

