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
  const [isEditing, setIsEditing] = useState(false);
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
      // Handle both possible response structures (defensive)
      if (data.standard) {
        setFormData({
          affiliateRate: data.standard.affiliateRate,
          regionalRate: data.standard.regionalRate,
          nationalRate: data.standard.nationalRate,
        });
      } else {
        // Fallback if response is flat (shouldn't happen, but just in case)
        const flatData = data as any;
        setFormData({
          affiliateRate: flatData.affiliateRate || 0,
          regionalRate: flatData.regionalRate || 0,
          nationalRate: flatData.nationalRate || 0,
        });
      }
    } catch (error: any) {
      console.error("Failed to load commission tiers:", error);
      toast.error(error?.message || "Failed to load commission tiers");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!config || !config.standard) return;
    setFormData({
      affiliateRate: config.standard.affiliateRate,
      regionalRate: config.standard.regionalRate,
      nationalRate: config.standard.nationalRate,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await affiliateService.updateCommissionTier({
        affiliateRate: formData.affiliateRate,
        regionalRate: formData.regionalRate,
        nationalRate: formData.nationalRate,
      });
      toast.success("Commission rates updated successfully");
      setIsEditing(false);
      await loadConfig();
    } catch (error: any) {
      console.error("Failed to update commission tier:", error);
      toast.error(error?.message || "Failed to update commission rates");
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Commission Rates
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure affiliate, regional, and national commission rates. Rates are percentages (e.g., 0.09 = 9%).
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Standard Commission Rates</h2>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Affiliate Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.affiliateRate}
                onChange={(e) =>
                  setFormData({ ...formData, affiliateRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {(formData.affiliateRate * 100).toFixed(1)}% of commissionable amount
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Regional Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.regionalRate}
                onChange={(e) =>
                  setFormData({ ...formData, regionalRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {(formData.regionalRate * 100).toFixed(1)}% of commissionable amount
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                National Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.nationalRate}
                onChange={(e) =>
                  setFormData({ ...formData, nationalRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                {(formData.nationalRate * 100).toFixed(1)}% of commissionable amount
              </p>
            </div>
            <div className="pt-2">
              <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-900">Total Commission Rate</p>
                <p className="mt-1 text-sm font-bold text-amber-900">
                  {((formData.affiliateRate + formData.regionalRate + formData.nationalRate) * 100).toFixed(1)}%
                </p>
                {(formData.affiliateRate + formData.regionalRate + formData.nationalRate) > 1 && (
                  <p className="mt-1 text-xs text-red-600">
                    ⚠️ Total exceeds 100%. Please adjust rates.
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || (formData.affiliateRate + formData.regionalRate + formData.nationalRate) > 1}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                style={{ backgroundColor: THEME }}
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (config?.standard) {
                    setFormData({
                      affiliateRate: config.standard.affiliateRate,
                      regionalRate: config.standard.regionalRate,
                      nationalRate: config.standard.nationalRate,
                    });
                  }
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
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Affiliate Rate:</span>
                <span className="text-sm font-medium text-slate-900">
                  {config?.standard ? (config.standard.affiliateRate * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Regional Rate:</span>
                <span className="text-sm font-medium text-slate-900">
                  {config?.standard ? (config.standard.regionalRate * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">National Rate:</span>
                <span className="text-sm font-medium text-slate-900">
                  {config?.standard ? (config.standard.nationalRate * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2 pt-3 border-t border-slate-200">
                <span className="text-sm font-semibold text-slate-900">Total Commission Rate:</span>
                <span className="text-sm font-bold text-slate-900">
                  {config?.standard ? ((config.standard.affiliateRate + config.standard.regionalRate + config.standard.nationalRate) * 100).toFixed(1) : "0.0"}%
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleEdit}
              className="mt-6 w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Edit Rates
            </button>
          </>
        )}
      </div>
    </div>
  );
}
