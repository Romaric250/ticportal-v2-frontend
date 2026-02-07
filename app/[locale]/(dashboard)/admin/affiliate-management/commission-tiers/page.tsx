"use client";

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { affiliateService, type CommissionTierConfig } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

const THEME = "#111827";

export default function CommissionTiersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<CommissionTierConfig | null>(null);
  const [editingTier, setEditingTier] = useState<"STANDARD" | "PREMIUM" | "VIP" | null>(null);
  const [formData, setFormData] = useState({
    affiliateRate: 0,
    regionalRate: 0,
    nationalRate: 0,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await affiliateService.getCommissionTiers();
      setConfig(data);
    } catch (error: any) {
      console.error("Failed to load commission tiers:", error);
      toast.error(error?.message || "Failed to load commission tiers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tier: "STANDARD" | "PREMIUM" | "VIP") => {
    if (!config) return;
    const tierData = config[tier.toLowerCase() as keyof CommissionTierConfig];
    setFormData({
      affiliateRate: tierData.affiliateRate,
      regionalRate: tierData.regionalRate,
      nationalRate: tierData.nationalRate,
    });
    setEditingTier(tier);
  };

  const handleSave = async () => {
    if (!editingTier) return;
    try {
      setSaving(true);
      await affiliateService.updateCommissionTier({
        tier: editingTier,
        ...formData,
      });
      toast.success(`${editingTier} tier updated successfully`);
      setEditingTier(null);
      await loadConfig();
    } catch (error: any) {
      console.error("Failed to update commission tier:", error);
      toast.error(error?.message || "Failed to update commission tier");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">Failed to load commission tiers.</p>
      </div>
    );
  }

  const tiers = [
    { key: "STANDARD" as const, label: "Standard", data: config.standard },
    { key: "PREMIUM" as const, label: "Premium", data: config.premium },
    { key: "VIP" as const, label: "VIP", data: config.vip },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Commission Tiers
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure affiliate, regional, and national commission rates by tier. Rates are percentages (e.g., 0.09 = 9%).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => {
          const isEditing = editingTier === tier.key;
          const displayData = isEditing ? formData : tier.data;

          return (
            <div
              key={tier.key}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-900">{tier.label} Tier</h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Affiliate Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={displayData.affiliateRate}
                      onChange={(e) =>
                        setFormData({ ...formData, affiliateRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Regional Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={displayData.regionalRate}
                      onChange={(e) =>
                        setFormData({ ...formData, regionalRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      National Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={displayData.nationalRate}
                      onChange={(e) =>
                        setFormData({ ...formData, nationalRate: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                      style={{ backgroundColor: THEME }}
                    >
                      {saving ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTier(null);
                        loadConfig();
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Affiliate:</span>
                      <span className="font-medium text-slate-900">
                        {(displayData.affiliateRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Regional:</span>
                      <span className="font-medium text-slate-900">
                        {(displayData.regionalRate * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">National:</span>
                      <span className="font-medium text-slate-900">
                        {(displayData.nationalRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEdit(tier.key)}
                    className="mt-4 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
