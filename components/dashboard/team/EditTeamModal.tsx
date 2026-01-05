"use client";

import { X, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { teamService, type Team, type UpdateTeamPayload } from "../../../src/lib/services/teamService";
import { toast } from "sonner";

type Props = {
  team: Team;
  onClose: () => void;
  onTeamUpdated: () => void;
};

export function EditTeamModal({ team, onClose, onTeamUpdated }: Props) {
  const [name, setName] = useState(team.name || "");
  const [projectTitle, setProjectTitle] = useState(team.projectTitle || "");
  const [description, setDescription] = useState(team.description || "");
  const [profileImage, setProfileImage] = useState<string | null>(team.profileImage || null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reset form when team changes
    setName(team.name || "");
    setProjectTitle(team.projectTitle || "");
    setDescription(team.description || "");
    setProfileImage(team.profileImage || null);
  }, [team]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size exceeds 4MB. Please upload a smaller image.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, GIF, or WebP image.");
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setProfileImage(base64);
    } catch (error) {
      console.error("Error converting image to base64:", error);
      toast.error("Failed to process image. Please try again.");
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      setSaving(true);
      const payload: UpdateTeamPayload = {
        name: name.trim(),
        projectTitle: projectTitle.trim() || undefined,
        description: description.trim() || undefined,
        profileImage: profileImage || undefined,
      };

      await teamService.updateTeam(team.id, payload);

      toast.success("Team updated successfully!");
      onTeamUpdated();
      onClose();
    } catch (error: any) {
      console.error("Error updating team:", error);
      toast.error(error?.message || "Failed to update team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-900">Edit Team Information</h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Team Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Team Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            />
          </div>

          {/* Project Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project Title
            </label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827] resize-none"
            />
          </div>

          {/* Team Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Team Photo (Optional)</label>
            <div className="flex items-center gap-4">
              {profileImage ? (
                <div className="relative">
                  <img
                    src={profileImage}
                    alt="Team Profile"
                    className="h-24 w-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <ImageIcon size={40} />
                </div>
              )}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Upload size={16} />
                  {profileImage ? "Change Photo" : "Upload Photo"}
                </button>
                <p className="mt-2 text-xs text-slate-500">
                  JPEG, PNG, GIF, or WebP. Max 4MB.
                </p>
              </div>
            </div>
          </div>

          {/* Note about deletion */}
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Note:</p>
            <p className="mt-1">
              To delete this team, please contact support. Team leads can only edit team information.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

