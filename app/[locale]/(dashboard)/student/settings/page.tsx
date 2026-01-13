"use client";

import { useState, useEffect, useRef } from "react";
import { User, GraduationCap, Mail, Bell, Check, Upload, Globe, Search, X } from "lucide-react";
import { useAuthStore } from "../../../../../src/state/auth-store";
import { userService, type UpdateProfilePayload } from "../../../../../src/lib/services/userService";
import { defaultsService } from "../../../../../src/lib/services/defaultsService";
import { toast } from "sonner";

const COUNTRIES = [
  "Cameroon", "United States", "Canada", "United Kingdom", "Australia", "Germany",
  "France", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland",
  "Sweden", "Norway", "Denmark", "Finland", "Poland", "Portugal",
  "Greece", "Ireland", "Austria", "Czech Republic", "Hungary",
  "Romania", "Bulgaria", "Croatia", "Slovakia", "Slovenia",
  "Estonia", "Latvia", "Lithuania", "Luxembourg", "Malta",
  "Cyprus", "Japan", "South Korea", "China", "India", "Singapore",
  "Malaysia", "Thailand", "Indonesia", "Philippines", "Vietnam",
  "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru",
  "South Africa", "Egypt", "Nigeria", "Kenya", "Ghana", "Morocco",
  "Other"
];

const CAMEROON_REGIONS = [
  "Adamawa", "Centre", "East", "Far North", "Littoral",
  "North", "Northwest", "South", "Southwest", "West"
];

type NotificationSettings = {
  email: boolean;
  sms: boolean;
};

type FormData = {
  username: string;
  bio: string;
  school: string;
  grade: string;
  country: string;
  region: string;
  gradDate: string;
  profilePhoto: string | null;
};

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    bio: "",
    school: "",
    grade: "",
    country: "",
    region: "",
    gradDate: "",
    profilePhoto: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // School search state
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolSuggestions, setSchoolSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSchoolFieldFocused, setIsSchoolFieldFocused] = useState(false);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profile = await userService.getProfile();
        setFormData({
          username: profile.username || "",
          bio: profile.bio || "",
          school: profile.school || "",
          grade: profile.grade || "",
          country: profile.country || "Cameroon",
          region: profile.region || "",
          gradDate: profile.gradDate ? new Date(profile.gradDate).toISOString().split("T")[0] : "",
          profilePhoto: profile.profilePhoto || null,
        });
        setSchoolQuery(profile.school || "");
      } catch (error: any) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Search schools when query changes (only if field is focused)
  useEffect(() => {
    // Don't search on initial load or if field is not focused
    if (!isSchoolFieldFocused) {
      return;
    }

    const searchSchools = async () => {
      if (schoolQuery.trim().length < 2) {
        setSchoolSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await defaultsService.searchSchools(schoolQuery);
        console.log("School search results:", results); // Debug log
        setSchoolSuggestions(results);
        setShowSuggestions(true); // Show dropdown even if empty to show "not found" message
      } catch (error) {
        console.error("Error searching schools:", error);
        setSchoolSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchSchools, 300);
    return () => clearTimeout(debounceTimer);
  }, [schoolQuery, isSchoolFieldFocused]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        schoolInputRef.current &&
        !schoolInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "academic", label: "Academic", icon: <GraduationCap size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "security", label: "Security", icon: <Mail size={16} /> },
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (4MB max)
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size must be less than 4MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setSaving(true);
      const updatedProfile = await userService.updateProfilePhoto({
        profilePhoto: base64,
      });

      setFormData((prev) => ({
        ...prev,
        profilePhoto: updatedProfile.profilePhoto || null,
      }));

      toast.success("Profile photo updated successfully!");
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      const errorMessage = error?.message || "Failed to upload photo. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeletePhoto = async () => {
    try {
      setSaving(true);
      await userService.updateProfilePhoto({
        profilePhoto: "",
      });

      setFormData((prev) => ({
        ...prev,
        profilePhoto: null,
      }));

      toast.success("Profile photo deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting photo:", error);
      toast.error("Failed to delete photo. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: UpdateProfilePayload = {};

      if (formData.username) payload.username = formData.username;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.school) payload.school = formData.school;
      if (formData.grade) payload.grade = formData.grade;
      if (formData.country) payload.country = formData.country;
      if (formData.region) payload.region = formData.region;
      if (formData.gradDate) payload.gradDate = new Date(formData.gradDate).toISOString();

      const updatedProfile = await userService.updateProfile(payload);

      // Update user in store if username changed
      if (user && updatedProfile.username) {
        setUser({
          ...user,
          name: updatedProfile.username,
        });
      }

      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      const errorMessage = error?.message || "Failed to save profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Left Sidebar Navigation */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            {formData.profilePhoto ? (
              <img
                src={formData.profilePhoto}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <User size={24} className="text-slate-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {user?.role || "student"}
              </p>
            </div>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-slate-100 text-[#111827] border-l-4 border-l-[#111827]"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500">
          <span className="hover:text-slate-900 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span className="text-slate-900 font-semibold">Settings</span>
        </div>

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
          <p className="mt-2 text-base text-slate-600">
            Manage your personal information, school details, and notification preferences.
          </p>
        </div>

        {/* Profile Tab Content */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Your Photo Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Photo</h2>
              <div className="flex items-start gap-6">
                {formData.profilePhoto ? (
                  <div className="relative">
                    <img
                      src={formData.profilePhoto}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <User size={40} className="text-slate-600" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="mb-4 text-sm text-slate-600">
                    This will be displayed on your profile and team page.
                  </p>
                  <div className="flex items-center gap-3">
                    {formData.profilePhoto && (
                      <button
                        onClick={handleDeletePhoto}
                        disabled={saving}
                        className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {formData.profilePhoto ? "Change Photo" : "Upload Photo"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    JPEG, PNG, GIF, or WebP. Max 4MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <User size={18} className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    placeholder="Choose a username (3-30 characters)"
                    minLength={3}
                    maxLength={30}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    This is how you will appear to other students and mentors.
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us a bit about yourself, your interests, and what you're building."
                    rows={4}
                    maxLength={500}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    {formData.bio.length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Tab Content */}
        {activeTab === "academic" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-slate-500" />
                <h2 className="text-lg font-semibold text-slate-900">Academic Details</h2>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1">
                <Check size={14} className="text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Verified Student</span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="relative">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  School Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    ref={schoolInputRef}
                    type="text"
                    value={schoolQuery}
                    onChange={(e) => {
                      setSchoolQuery(e.target.value);
                      handleInputChange("school", e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => {
                      setIsSchoolFieldFocused(true);
                      if (schoolSuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => {
                        setIsSchoolFieldFocused(false);
                        setShowSuggestions(false);
                      }, 200);
                    }}
                    placeholder="Search for your school..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                  {schoolQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSchoolQuery("");
                        handleInputChange("school", "");
                        setSchoolSuggestions([]);
                        setShowSuggestions(false);
                        schoolInputRef.current?.focus();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && (schoolSuggestions.length > 0 || isSearching) && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg"
                    >
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-slate-500">Searching...</div>
                      ) : (
                        <>
                          {schoolSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              onClick={() => {
                                handleInputChange("school", suggestion.name);
                                setSchoolQuery(suggestion.name);
                                setShowSuggestions(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                            >
                              {suggestion.name}
                            </button>
                          ))}
                          {schoolQuery.trim().length >= 2 && schoolSuggestions.length === 0 && (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              No schools found. You can add "{schoolQuery}" as your school.
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
                {schoolQuery.trim().length >= 2 && schoolSuggestions.length === 0 && !isSearching && (
                  <p className="mt-1.5 text-xs text-slate-500">
                    School not found? You can use "{schoolQuery}" as your school name.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Grade/Class
                </label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  placeholder="e.g., Grade 11, Senior, Year 12"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => {
                    handleInputChange("country", e.target.value);
                    if (e.target.value !== "Cameroon") {
                      handleInputChange("region", ""); // Clear region if country changes away from Cameroon
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {formData.country === "Cameroon" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  >
                    <option value="">Select your region</option>
                    {CAMEROON_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Graduation Date
                </label>
                <input
                  type="date"
                  value={formData.gradDate}
                  onChange={(e) => handleInputChange("gradDate", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab Content */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Bell size={18} className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
            </div>
            <p className="text-sm text-slate-600">Notification settings coming soon...</p>
          </div>
        )}

        {/* Contact Information (shown in profile tab) */}
        {activeTab === "profile" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Mail size={18} className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 cursor-not-allowed"
                  />
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1">
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-emerald-700">Verified</span>
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Contact your school administrator to change your email.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab Content */}
        {activeTab === "security" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Mail size={18} className="text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
            </div>
            <p className="text-sm text-slate-600">Security settings coming soon...</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="cursor-pointer rounded-lg bg-[#111827] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
