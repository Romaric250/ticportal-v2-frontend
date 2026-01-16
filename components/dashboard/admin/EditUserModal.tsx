"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { adminService, type AdminUser, type UpdateUserPayload } from "../../../src/lib/services/adminService";
import { toast } from "sonner";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onUserUpdated: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState<UpdateUserPayload>({
    role: "STUDENT",
    status: "ACTIVE",
    school: "",
    region: "",
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role,
        status: user.status,
        school: user.school || "",
        region: user.region || user.jurisdiction || "",
        isVerified: user.isVerified,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await adminService.updateUser(user.id, formData);
      toast.success("User updated successfully");
      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error?.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="space-y-4">
            {/* User Info Display */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as UpdateUserPayload["role"],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                required
              >
                <option value="STUDENT">STUDENT</option>
                <option value="MENTOR">MENTOR</option>
                <option value="JUDGE">JUDGE</option>
                <option value="SQUAD_LEAD">SQUAD_LEAD</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as UpdateUserPayload["status"],
                  }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                required
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            {/* School */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                School
              </label>
              <input
                type="text"
                value={formData.school}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, school: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                placeholder="Enter school name"
              />
            </div>

            {/* Region */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Region
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, region: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-[#111827] focus:outline-none focus:ring-2 focus:ring-[#111827]/20"
                placeholder="Enter region"
              />
            </div>

            {/* Email Verified */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isVerified: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
              />
              <label htmlFor="isVerified" className="text-sm font-medium text-slate-700">
                Email Verified
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                "Update User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
