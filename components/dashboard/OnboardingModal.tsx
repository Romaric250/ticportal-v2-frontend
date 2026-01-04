"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, GraduationCap, BookOpen, Globe, Search, X } from "lucide-react";
import { userService } from "../../src/lib/services/userService";
import { defaultsService } from "../../src/lib/services/defaultsService";
import { useAuthStore } from "../../src/state/auth-store";
import { toast } from "sonner";

type OnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    country?: string;
    region?: string;
    school?: string;
    grade?: string;
  };
};

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

const GRADES = [
 "Grade 6(Form 1)", "Grade 7(Form 2)", "Grade 8(Form 3)", "Grade 9(Form 4)", "Grade 10(Form 5)", "Grade 11( Lower Sixth)", "Grade 12( Upper Sixth)",
  ,
  "Other"
];

export function OnboardingModal({ isOpen, onClose, initialData }: OnboardingModalProps) {
  const { setUser, user } = useAuthStore();
  const [country, setCountry] = useState(initialData?.country || "Cameroon");
  const [region, setRegion] = useState(initialData?.region || "");
  const [school, setSchool] = useState(initialData?.school || "");
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [submitting, setSubmitting] = useState(false);
  
  // School search state
  const [schoolQuery, setSchoolQuery] = useState("");
  const [schoolSuggestions, setSchoolSuggestions] = useState<Array<{ id: string; name: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSchoolFieldFocused, setIsSchoolFieldFocused] = useState(false);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setCountry(initialData.country || "Cameroon");
      setRegion(initialData.region || "");
      setSchool(initialData.school || "");
      setSchoolQuery(initialData.school || "");
      setGrade(initialData.grade || "");
    }
  }, [initialData]);

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Region is required only if country is Cameroon
    const isRegionRequired = country === "Cameroon";
    if (!country || (isRegionRequired && !region) || !school || !grade) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const updatedProfile = await userService.updateProfile({
        country,
        region,
        school,
        grade,
      });

      // Update user in store if needed
      if (user) {
        setUser({
          ...user,
          // Add any profile fields to user if needed
        });
      }

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "Failed to update profile. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Note: Close button removed - modal cannot be dismissed until form is completed */}

        {/* Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">Complete Your Profile</h2>
          <p className="mt-1 text-sm text-slate-600">
            Please provide the following information to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Country */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <MapPin size={16} className="text-slate-500" />
              Country
            </label>
            <select
              required
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                if (e.target.value !== "Cameroon") {
                  setRegion(""); // Clear region if country changes away from Cameroon
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Region - Only show if country is Cameroon */}
          {country === "Cameroon" && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Globe size={16} className="text-slate-500" />
                Region
              </label>
              <select
                required={country === "Cameroon"}
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
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

          {/* School */}
          <div className="space-y-2 relative">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <GraduationCap size={16} className="text-slate-500" />
              School Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </div>
              <input
                ref={schoolInputRef}
                type="text"
                required
                value={schoolQuery}
                onChange={(e) => {
                  setSchoolQuery(e.target.value);
                  setSchool(e.target.value);
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
                className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
              />
              {schoolQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSchoolQuery("");
                    setSchool("");
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
                            setSchool(suggestion.name);
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
              <p className="text-xs text-slate-500">
                School not found? You can use "{schoolQuery}" as your school name.
              </p>
            )}
          </div>

          {/* Grade */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BookOpen size={16} className="text-slate-500" />
              Grade/Class
            </label>
            <select
              required
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
            >
              <option value="">Select your grade</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

