"use client";

import { useState, useEffect } from "react";
import { MapPin, GraduationCap, BookOpen, Globe } from "lucide-react";
import { userService } from "../../src/lib/services/userService";
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
  "Grade 9", "Grade 10", "Grade 11", "Grade 12",
  "Year 9", "Year 10", "Year 11", "Year 12",
  "Freshman", "Sophomore", "Junior", "Senior",
  "Other"
];

export function OnboardingModal({ isOpen, onClose, initialData }: OnboardingModalProps) {
  const { setUser, user } = useAuthStore();
  const [country, setCountry] = useState(initialData?.country || "Cameroon");
  const [region, setRegion] = useState(initialData?.region || "");
  const [school, setSchool] = useState(initialData?.school || "");
  const [grade, setGrade] = useState(initialData?.grade || "");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCountry(initialData.country || "Cameroon");
      setRegion(initialData.region || "");
      setSchool(initialData.school || "");
      setGrade(initialData.grade || "");
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!country || !region || !school || !grade) {
      toast.error("Please fill in all fields");
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
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <GraduationCap size={16} className="text-slate-500" />
              School Name
            </label>
            <input
              type="text"
              required
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Enter your school name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
            />
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

