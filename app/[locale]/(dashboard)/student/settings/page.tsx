"use client";

import { useState } from "react";
import { User, GraduationCap, Mail, Bell, Check, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Dee",
    displayName: "JohnD_Code",
    bio: "",
    schoolName: "Lincoln High School",
    gradeLevel: "Grade 11",
    graduationYear: "2025",
    email: "john.doe@student.edu",
    phone: "+1 (555) 000-0000",
    assignmentAlerts: { email: true, sms: false },
    teamMessages: { email: true, sms: true },
    announcements: { email: true, sms: false },
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: <User size={16} /> },
    { id: "academic", label: "Academic", icon: <GraduationCap size={16} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
    { id: "security", label: "Security", icon: <Mail size={16} /> },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Left Sidebar Navigation */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
              <User size={24} className="text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">John Doe</p>
              <p className="text-xs text-slate-500">Grade 11 - Student</p>
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
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  <User size={40} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="mb-4 text-sm text-slate-600">
                    This will be displayed on your profile and team page.
                  </p>
                  <div className="flex items-center gap-3">
                    <button className="cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700">
                      Delete
                    </button>
                    <button className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition">
                      Change Photo
                    </button>
                  </div>
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
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
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
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                  />
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  School Name
                </label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => handleInputChange("schoolName", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Grade Level
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => handleInputChange("gradeLevel", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Graduation Year
                </label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => handleInputChange("graduationYear", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                >
                  <option>2024</option>
                  <option>2025</option>
                  <option>2026</option>
                  <option>2027</option>
                </select>
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
            <div className="space-y-6">
              {/* Assignment Alerts */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">Assignment Alerts</h3>
                  <p className="text-sm text-slate-600">
                    Receive updates when mentors grade your submissions.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.assignmentAlerts.email}
                      onChange={(e) =>
                        handleInputChange("assignmentAlerts.email", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.assignmentAlerts.sms}
                      onChange={(e) =>
                        handleInputChange("assignmentAlerts.sms", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">SMS</span>
                  </label>
                </div>
              </div>

              {/* Team Messages */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">Team Messages</h3>
                  <p className="text-sm text-slate-600">
                    Get notified when a teammate sends a message.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.teamMessages.email}
                      onChange={(e) =>
                        handleInputChange("teamMessages.email", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.teamMessages.sms}
                      onChange={(e) =>
                        handleInputChange("teamMessages.sms", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">SMS</span>
                  </label>
                </div>
              </div>

              {/* Announcements */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-slate-900">Announcements</h3>
                  <p className="text-sm text-slate-600">Important news about the hackathon.</p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.announcements.email}
                      onChange={(e) =>
                        handleInputChange("announcements.email", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.announcements.sms}
                      onChange={(e) =>
                        handleInputChange("announcements.sms", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-[#111827]"
                    />
                    <span className="text-sm text-slate-700">SMS</span>
                  </label>
                </div>
              </div>
            </div>
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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Only visible to your mentors and team members.
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
          <button className="cursor-pointer rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
          <button className="cursor-pointer rounded-lg bg-[#111827] px-6 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

