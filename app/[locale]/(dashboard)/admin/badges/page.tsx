"use client";

import { useState, useEffect } from "react";
import { adminService, type AdminBadge, type UpdateBadgePayload } from "../../../../../src/lib/services/adminService";
import { toast } from "sonner";
import { Loader2, Search, Edit, Save, X, Award, Filter } from "lucide-react";

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<AdminBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateBadgePayload>({});
  const [saving, setSaving] = useState(false);
  const [awardCounts, setAwardCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllBadges();
      setBadges(response.badges);
      
      // Load award counts for each badge
      const counts: Record<string, number> = {};
      await Promise.all(
        response.badges.map(async (badge) => {
          try {
            const details = await adminService.getBadgeDetails(badge.badgeId);
            counts[badge.badgeId] = details.awardCount;
          } catch (error) {
            console.error(`Failed to load award count for ${badge.badgeId}:`, error);
            counts[badge.badgeId] = 0;
          }
        })
      );
      setAwardCounts(counts);
    } catch (error: any) {
      console.error("Failed to load badges:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load badges");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (badge: AdminBadge) => {
    setEditingId(badge.badgeId);
    setEditForm({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      imageUrl: badge.imageUrl,
      category: badge.category,
      tier: badge.tier,
      points: badge.points,
      rarity: badge.rarity,
      criteria: badge.criteria,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (badgeId: string) => {
    try {
      setSaving(true);
      const updatedBadge = await adminService.updateBadge(badgeId, editForm);
      setBadges((prev) =>
        prev.map((badge) => (badge.badgeId === badgeId ? updatedBadge : badge))
      );
      setEditingId(null);
      setEditForm({});
      toast.success("Badge updated successfully");
      // Reload badges to ensure consistency
      await loadBadges();
    } catch (error: any) {
      console.error("Failed to update badge:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to update badge");
    } finally {
      setSaving(false);
    }
  };

  const filteredBadges = badges.filter((badge) => {
    // Add safety checks to prevent undefined errors
    if (!badge || !badge.name || !badge.description || !badge.badgeId) {
      return false;
    }
    const matchesSearch =
      badge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.badgeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || badge.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "POINTS", "SOCIAL", "ACHIEVEMENT", "MILESTONE", "SPECIAL"];
  const tiers = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BRONZE":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "SILVER":
        return "bg-slate-100 text-slate-800 border-slate-300";
      case "GOLD":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "PLATINUM":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "DIAMOND":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getRarityColor = (rarity: number) => {
    if (rarity >= 90) return "text-red-600 font-bold";
    if (rarity >= 70) return "text-orange-600 font-semibold";
    if (rarity >= 50) return "text-yellow-600 font-semibold";
    if (rarity >= 30) return "text-green-600";
    return "text-slate-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Badge Management</h1>
          <p className="mt-1 text-sm text-slate-600">View and manage all system badges</p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-semibold text-slate-900">{badges.length}</span> badges
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search badges by name, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Badges Table */}
      {filteredBadges.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Award size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">No badges found</p>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No badges available"}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Icon
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Badge
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tier
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Points
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rarity
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Awarded
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBadges.map((badge) => {
                  if (!badge) return null;
                  const isEditing = editingId === badge.badgeId;
                  return (
                    <tr key={badge.id} className="hover:bg-slate-50">
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.icon || ""}
                            onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                            placeholder="Icon"
                            className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                          />
                        ) : (
                          <span className="text-2xl">{badge.icon}</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder="Badge name"
                            className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827]"
                          />
                        ) : (
                          <div>
                            <div className="font-semibold text-slate-900">{badge.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">ID: {badge.badgeId}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Description"
                            rows={2}
                            className="w-full min-w-[200px] rounded border border-slate-300 bg-white px-2 py-1.5 text-sm focus:border-[#111827] focus:outline-none focus:ring-1 focus:ring-[#111827] resize-none"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 max-w-xs">{badge.description}</p>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editForm.category || badge.category}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                category: e.target.value as AdminBadge["category"],
                              })
                            }
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-[#111827] focus:outline-none"
                          >
                            <option value="POINTS">POINTS</option>
                            <option value="SOCIAL">SOCIAL</option>
                            <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                            <option value="MILESTONE">MILESTONE</option>
                            <option value="SPECIAL">SPECIAL</option>
                          </select>
                        ) : (
                          <span className="text-sm font-semibold text-slate-900">{badge.category}</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editForm.tier || badge.tier}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                tier: e.target.value as AdminBadge["tier"],
                              })
                            }
                            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm focus:border-[#111827] focus:outline-none"
                          >
                            {tiers.map((tier) => (
                              <option key={tier} value={tier}>
                                {tier}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold border ${getTierColor(
                              badge.tier
                            )}`}
                          >
                            {badge.tier}
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.points ?? badge.points}
                            onChange={(e) =>
                              setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })
                            }
                            className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right focus:border-[#111827] focus:outline-none"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-slate-900">{badge.points} TP</span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={editForm.rarity ?? badge.rarity}
                            onChange={(e) =>
                              setEditForm({ ...editForm, rarity: parseInt(e.target.value) || 1 })
                            }
                            className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-right focus:border-[#111827] focus:outline-none"
                          />
                        ) : (
                          <span className={`text-sm font-semibold ${getRarityColor(badge.rarity)}`}>
                            {badge.rarity}/100
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {awardCounts[badge.badgeId] ?? 0}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(badge.badgeId)}
                              disabled={saving}
                              className="cursor-pointer flex items-center justify-center gap-1 rounded-lg bg-[#111827] px-2 py-1.5 text-xs font-semibold text-white hover:bg-[#1f2937] disabled:opacity-50 transition"
                            >
                              {saving ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <>
                                  <Save size={14} />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="cursor-pointer flex items-center justify-center gap-1 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                            >
                              <X size={14} />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(badge)}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
