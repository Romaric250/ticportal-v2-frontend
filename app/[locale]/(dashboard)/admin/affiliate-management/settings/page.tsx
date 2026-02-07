"use client";

import { useState, useEffect } from "react";
import { Plus, Globe, MapPin, Loader2, X, CheckCircle, AlertCircle, Edit2, Trash2 } from "lucide-react";
import { affiliateService, type Country, type Region } from "@/src/lib/services/affiliateService";
import { toast } from "sonner";

const THEME = "#111827";
const DEFAULT_COUNTRY_CODE = "CM";
const DEFAULT_COUNTRY_NAME = "Cameroon";

function formatXAF(value: number): string {
  return value.toLocaleString("fr-FR") + " XAF";
}

function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + "%";
}

export default function AffiliateSettingsPage() {
  const [activeTab, setActiveTab] = useState<"countries" | "regions">("countries");
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState<Country[]>([]);
  const [regions, setRegions] = useState<Record<string, Region[]>>({});
  const [showCountryForm, setShowCountryForm] = useState(false);
  const [showRegionForm, setShowRegionForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [deleteCountryId, setDeleteCountryId] = useState<string | null>(null);
  const [deleteRegionId, setDeleteRegionId] = useState<string | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [countryForm, setCountryForm] = useState({
    code: "",
    name: "",
    currency: "XAF",
    studentPrice: 0,
    platformFee: 0,
    affiliateCommissionRate: 0.09,
    regionalCommissionRate: 0.06,
    nationalCommissionRate: 0.05,
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED" | "INACTIVE",
  });

  const [regionForm, setRegionForm] = useState({
    countryId: "",
    name: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "regions" && countries.length > 0 && !selectedCountryId) {
      // Set default to Cameroon if available
      const cameroon = countries.find((c) => c.code === DEFAULT_COUNTRY_CODE);
      if (cameroon) {
        setSelectedCountryId(cameroon.id);
        setRegionForm((prev) => ({ ...prev, countryId: cameroon.id }));
      } else if (countries.length > 0) {
        setSelectedCountryId(countries[0].id);
        setRegionForm((prev) => ({ ...prev, countryId: countries[0].id }));
      }
    }
  }, [activeTab, countries]);

  const loadData = async () => {
    try {
      setLoading(true);
      const countriesData = await affiliateService.getCountries();
      setCountries(countriesData);

      // Load regions for each country
      const regionsMap: Record<string, Region[]> = {};
      for (const country of countriesData) {
        try {
          const regionsData = await affiliateService.getRegionsByCountry(country.id);
          regionsMap[country.id] = regionsData;
        } catch (error) {
          console.error(`Failed to load regions for ${country.name}:`, error);
          regionsMap[country.id] = [];
        }
      }
      setRegions(regionsMap);
    } catch (error: any) {
      console.error("Failed to load data:", error);
      toast.error(error?.message || "Failed to load settings data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingCountry) {
        await affiliateService.updateCountry(editingCountry.id, countryForm);
        toast.success(`Country "${countryForm.name}" updated successfully`);
      } else {
        await affiliateService.createCountry(countryForm);
        toast.success(`Country "${countryForm.name}" created successfully`);
      }
      setShowCountryForm(false);
      setEditingCountry(null);
      setCountryForm({
        code: "",
        name: "",
        currency: "XAF",
        studentPrice: 0,
        platformFee: 0,
        affiliateCommissionRate: 0.09,
        regionalCommissionRate: 0.06,
        nationalCommissionRate: 0.05,
        status: "ACTIVE",
      });
      await loadData();
    } catch (error: any) {
      console.error("Failed to save country:", error);
      toast.error(error?.message || `Failed to ${editingCountry ? "update" : "create"} country`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setCountryForm({
      code: country.code,
      name: country.name,
      currency: country.currency || "XAF",
      studentPrice: country.studentPrice,
      platformFee: country.platformFee,
      affiliateCommissionRate: country.affiliateCommissionRate,
      regionalCommissionRate: country.regionalCommissionRate,
      nationalCommissionRate: country.nationalCommissionRate,
      status: country.status,
    });
    setShowCountryForm(true);
  };


  const handleDeleteCountry = async () => {
    if (!deleteCountryId) return;

    setDeleting(true);
    try {
      await affiliateService.deleteCountry(deleteCountryId);
      toast.success("Country deleted successfully");
      setDeleteCountryId(null);
      await loadData();
    } catch (error: any) {
      console.error("Failed to delete country:", error);
      const errorMessage = error?.message || "Failed to delete country";
      if (errorMessage.includes("regions") || errorMessage.includes("affiliates") || errorMessage.includes("dependencies")) {
        toast.error("Cannot delete country: It has associated regions, affiliates, or other dependencies. Please remove them first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regionForm.countryId) {
      toast.error("Please select a country");
      return;
    }

    if (!regionForm.name.trim()) {
      toast.error("Region name is required");
      return;
    }

    setSubmitting(true);

    try {
      if (editingRegion) {
        await affiliateService.updateRegion(editingRegion.id, { name: regionForm.name.trim() });
        toast.success(`Region "${regionForm.name}" updated successfully`);
      } else {
        await affiliateService.createRegion({
          countryId: regionForm.countryId,
          name: regionForm.name.trim(),
        });
        toast.success(`Region "${regionForm.name}" created successfully`);
      }
      setShowRegionForm(false);
      setEditingRegion(null);
      setRegionForm({ countryId: selectedCountryId || "", name: "" });
      await loadData();
    } catch (error: any) {
      console.error("Failed to save region:", error);
      toast.error(error?.message || `Failed to ${editingRegion ? "update" : "create"} region`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRegion = (region: Region) => {
    setEditingRegion(region);
    setRegionForm({
      countryId: region.countryId,
      name: region.name,
    });
    setSelectedCountryId(region.countryId);
    setShowRegionForm(true);
  };

  const handleDeleteRegion = async () => {
    if (!deleteRegionId) return;

    setDeleting(true);
    try {
      await affiliateService.deleteRegion(deleteRegionId);
      toast.success("Region deleted successfully");
      setDeleteRegionId(null);
      await loadData();
    } catch (error: any) {
      console.error("Failed to delete region:", error);
      const errorMessage = error?.message || "Failed to delete region";
      if (errorMessage.includes("affiliates") || errorMessage.includes("dependencies")) {
        toast.error("Cannot delete region: It has associated affiliates or other dependencies. Please remove them first.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Affiliate Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage countries, regions, and commission rates. All amounts in XAF.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("countries")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "countries"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe size={16} />
            Countries
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("regions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "regions"
              ? "border-b-2 border-slate-900 text-slate-900"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            Regions
          </div>
        </button>
      </div>

      {/* Countries Tab */}
      {activeTab === "countries" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Countries</h2>
            <button
              type="button"
              onClick={() => setShowCountryForm(true)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: THEME }}
            >
              <Plus size={16} />
              Add Country
            </button>
          </div>

          {/* Create Country Modal */}
          {showCountryForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                aria-hidden
              />
              <div
                className="relative w-full max-w-2xl rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5 max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="country-modal-title"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 id="country-modal-title" className="text-lg font-semibold text-slate-900">
                  {editingCountry ? "Edit Country" : "Create New Country"}
                </h3>
                  <button
                    type="button"
                    onClick={() => setShowCountryForm(false)}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              <form onSubmit={handleCreateCountry} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Country Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      disabled={!!editingCountry}
                      value={countryForm.code}
                      onChange={(e) =>
                        setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., CM"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                    {editingCountry && (
                      <p className="mt-1 text-xs text-slate-500">Country code cannot be changed</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">ISO 3166-1 alpha-2 code (2-3 letters)</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Country Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={countryForm.name}
                      onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
                      placeholder="e.g., Cameroon"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Currency Code
                    </label>
                    <input
                      type="text"
                      value={countryForm.currency}
                      onChange={(e) =>
                        setCountryForm({ ...countryForm, currency: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., XAF"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Student Price (XAF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={countryForm.studentPrice || ""}
                      onChange={(e) =>
                        setCountryForm({
                          ...countryForm,
                          studentPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 5000"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Platform Fee (XAF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={countryForm.platformFee || ""}
                      onChange={(e) =>
                        setCountryForm({
                          ...countryForm,
                          platformFee: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g., 500"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Status</h4>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Country Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={countryForm.status}
                      onChange={(e) =>
                        setCountryForm({
                          ...countryForm,
                          status: e.target.value as "ACTIVE" | "SUSPENDED" | "INACTIVE",
                        })
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SUSPENDED">Suspended</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      {countryForm.status === "ACTIVE" && "Country is active and operational"}
                      {countryForm.status === "SUSPENDED" && "Country is temporarily suspended"}
                      {countryForm.status === "INACTIVE" && "Country is inactive"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Commission Rates (%)</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Affiliate Rate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="1"
                        step="0.01"
                        value={countryForm.affiliateCommissionRate || ""}
                        onChange={(e) =>
                          setCountryForm({
                            ...countryForm,
                            affiliateCommissionRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.09"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPercentage(countryForm.affiliateCommissionRate || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Regional Rate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="1"
                        step="0.01"
                        value={countryForm.regionalCommissionRate || ""}
                        onChange={(e) =>
                          setCountryForm({
                            ...countryForm,
                            regionalCommissionRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.06"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPercentage(countryForm.regionalCommissionRate || 0)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        National Rate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="1"
                        step="0.01"
                        value={countryForm.nationalCommissionRate || ""}
                        onChange={(e) =>
                          setCountryForm({
                            ...countryForm,
                            nationalCommissionRate: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.05"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPercentage(countryForm.nationalCommissionRate || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCountryForm(false);
                      setEditingCountry(null);
                      setCountryForm({
                        code: "",
                        name: "",
                        currency: "XAF",
                        studentPrice: 0,
                        platformFee: 0,
                        affiliateCommissionRate: 0.09,
                        regionalCommissionRate: 0.06,
                        nationalCommissionRate: 0.05,
                        status: "ACTIVE",
                      });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                    style={{ backgroundColor: THEME }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        {editingCountry ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        {editingCountry ? "Update Country" : "Create Country"}
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}

          {/* Countries List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            {countries.length === 0 ? (
              <div className="p-8 text-center">
                <Globe className="mx-auto mb-3 text-slate-300" size={48} />
                <p className="text-sm text-slate-500">No countries found. Create your first country above.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 font-medium text-slate-600">Code</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Currency</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Student Price</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Commission Rates</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => {
                      const hasDependencies = 
                        (country._count?.affiliates || 0) > 0 ||
                        (country._count?.regionalCoordinators || 0) > 0 ||
                        (country._count?.nationalCoordinators || 0) > 0 ||
                        (regions[country.id]?.length || 0) > 0;
                      
                      return (
                        <tr key={country.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-4 py-3">
                            <span className="font-medium text-slate-900">{country.code}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{country.name}</td>
                          <td className="px-4 py-3 text-slate-600">{country.currency || "XAF"}</td>
                          <td className="px-4 py-3 text-slate-900">
                            {formatXAF(country.studentPrice)}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600">
                            <div className="space-y-0.5">
                              <div>AFF: {formatPercentage(country.affiliateCommissionRate)}</div>
                              <div>REG: {formatPercentage(country.regionalCommissionRate)}</div>
                              <div>NAT: {formatPercentage(country.nationalCommissionRate)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                country.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : country.status === "SUSPENDED"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {country.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditCountry(country)}
                                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="Edit country"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteCountryId(country.id)}
                                disabled={hasDependencies}
                                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={hasDependencies ? "Cannot delete: Has dependencies" : "Delete country"}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Regions Tab */}
      {activeTab === "regions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Regions</h2>
            <button
              type="button"
              onClick={() => {
                if (countries.length > 0) {
                  const cameroon = countries.find((c) => c.code === DEFAULT_COUNTRY_CODE);
                  if (cameroon) {
                    setSelectedCountryId(cameroon.id);
                    setRegionForm({ countryId: cameroon.id, name: "" });
                  } else {
                    setSelectedCountryId(countries[0].id);
                    setRegionForm({ countryId: countries[0].id, name: "" });
                  }
                  setShowRegionForm(true);
                }
              }}
              disabled={countries.length === 0}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: THEME }}
            >
              <Plus size={16} />
              Add Region
            </button>
          </div>

          {countries.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 text-amber-600" size={20} />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">No Countries Available</h3>
                  <p className="mt-1 text-xs text-amber-700">
                    Please create at least one country before adding regions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Create Region Modal */}
          {showRegionForm && countries.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                aria-hidden
              />
              <div
                className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
                role="dialog"
                aria-modal="true"
                aria-labelledby="region-modal-title"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 id="region-modal-title" className="text-lg font-semibold text-slate-900">
                  {editingRegion ? "Edit Region" : "Create New Region"}
                </h3>
                  <button
                    type="button"
                    onClick={() => setShowRegionForm(false)}
                    className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>
              <form onSubmit={handleCreateRegion} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    disabled={!!editingRegion}
                    value={regionForm.countryId}
                    onChange={(e) => {
                      setRegionForm({ ...regionForm, countryId: e.target.value });
                      setSelectedCountryId(e.target.value);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.code})
                        {country.code === DEFAULT_COUNTRY_CODE && " - Default"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Region Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regionForm.name}
                    onChange={(e) => setRegionForm({ ...regionForm, name: e.target.value })}
                    placeholder="e.g., Douala"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegionForm(false);
                      setEditingRegion(null);
                      setRegionForm({ countryId: selectedCountryId || "", name: "" });
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !regionForm.countryId}
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                    style={{ backgroundColor: THEME }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        {editingRegion ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        {editingRegion ? "Update Region" : "Create Region"}
                      </>
                    )}
                  </button>
                </div>
              </form>
              </div>
            </div>
          )}

          {/* Regions List by Country */}
          <div className="space-y-4">
            {countries.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <MapPin className="mx-auto mb-3 text-slate-300" size={48} />
                <p className="text-sm text-slate-500">No countries available. Create a country first.</p>
              </div>
            ) : (
              countries.map((country) => {
                const countryRegions = regions[country.id] || [];
                return (
                  <div key={country.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {country.name} ({country.code})
                            {country.code === DEFAULT_COUNTRY_CODE && (
                              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Default
                              </span>
                            )}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {countryRegions.length} region{countryRegions.length !== 1 ? "s" : ""}
                            {country._count && (
                              <> • {country._count.affiliates} affiliate{country._count.affiliates !== 1 ? "s" : ""}</>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCountryId(country.id);
                            setRegionForm({ countryId: country.id, name: "" });
                            setShowRegionForm(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Plus size={14} />
                          Add Region
                        </button>
                      </div>
                    </div>
                    {countryRegions.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-sm text-slate-500">No regions for this country yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/50">
                              <th className="px-4 py-2.5 font-medium text-slate-600">Region Name</th>
                              <th className="px-4 py-2.5 font-medium text-slate-600">Status</th>
                              <th className="px-4 py-2.5 font-medium text-slate-600">Affiliates</th>
                              <th className="px-4 py-2.5 font-medium text-slate-600">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {countryRegions.map((region) => {
                              const hasDependencies = (region._count?.affiliates || 0) > 0 ||
                                (region._count?.regionalCoordinators || 0) > 0;
                              
                              return (
                                <tr
                                  key={region.id}
                                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                                >
                                  <td className="px-4 py-2.5 font-medium text-slate-900">{region.name}</td>
                                  <td className="px-4 py-2.5">
                                    <span
                                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                        region.status === "ACTIVE"
                                          ? "bg-emerald-100 text-emerald-700"
                                          : region.status === "SUSPENDED"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {region.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-slate-600">
                                    {region._count?.affiliates || 0}
                                  </td>
                                  <td className="px-4 py-2.5">
                                    <div className="flex items-center gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleEditRegion(region)}
                                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                        title="Edit region"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteRegionId(region.id)}
                                        disabled={hasDependencies}
                                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={hasDependencies ? "Cannot delete: Has dependencies" : "Delete region"}
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Delete Country Confirmation Modal */}
      {deleteCountryId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-country-modal-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="delete-country-modal-title" className="text-lg font-semibold text-slate-900">
                Delete Country
              </h3>
              <button
                type="button"
                onClick={() => setDeleteCountryId(null)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {(() => {
              const country = countries.find((c) => c.id === deleteCountryId);
              const hasDependencies =
                (country?._count?.affiliates || 0) > 0 ||
                (country?._count?.regionalCoordinators || 0) > 0 ||
                (country?._count?.nationalCoordinators || 0) > 0 ||
                (regions[deleteCountryId]?.length || 0) > 0;

              return (
                <>
                  {hasDependencies ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 text-amber-600" size={20} />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-900">Cannot Delete Country</h4>
                            <p className="mt-1 text-xs text-amber-700">
                              This country has associated data that prevents deletion:
                            </p>
                            <ul className="mt-2 list-disc list-inside text-xs text-amber-700 space-y-1">
                              {country?._count?.affiliates ? (
                                <li>{country._count.affiliates} affiliate(s)</li>
                              ) : null}
                              {country?._count?.regionalCoordinators ? (
                                <li>{country._count.regionalCoordinators} regional coordinator(s)</li>
                              ) : null}
                              {country?._count?.nationalCoordinators ? (
                                <li>{country._count.nationalCoordinators} national coordinator(s)</li>
                              ) : null}
                              {regions[deleteCountryId]?.length ? (
                                <li>{regions[deleteCountryId].length} region(s)</li>
                              ) : null}
                            </ul>
                            <p className="mt-2 text-xs text-amber-700">
                              Please remove or reassign all dependencies before deleting this country.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setDeleteCountryId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Are you sure you want to delete <span className="font-semibold text-slate-900">{country?.name}</span>? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setDeleteCountryId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteCountry}
                          disabled={deleting}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                          style={{ backgroundColor: "#dc2626" }}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete Country
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Region Confirmation Modal */}
      {deleteRegionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            aria-hidden
          />
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl ring-1 ring-slate-900/5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-region-modal-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="delete-region-modal-title" className="text-lg font-semibold text-slate-900">
                Delete Region
              </h3>
              <button
                type="button"
                onClick={() => setDeleteRegionId(null)}
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            {(() => {
              let region: Region | undefined;
              for (const countryRegions of Object.values(regions)) {
                const found = countryRegions.find((r) => r.id === deleteRegionId);
                if (found) {
                  region = found;
                  break;
                }
              }
              const hasDependencies =
                (region?._count?.affiliates || 0) > 0 ||
                (region?._count?.regionalCoordinators || 0) > 0;

              return (
                <>
                  {hasDependencies ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 text-amber-600" size={20} />
                          <div>
                            <h4 className="text-sm font-semibold text-amber-900">Cannot Delete Region</h4>
                            <p className="mt-1 text-xs text-amber-700">
                              This region has associated data that prevents deletion:
                            </p>
                            <ul className="mt-2 list-disc list-inside text-xs text-amber-700 space-y-1">
                              {region?._count?.affiliates ? (
                                <li>{region._count.affiliates} affiliate(s)</li>
                              ) : null}
                              {region?._count?.regionalCoordinators ? (
                                <li>{region._count.regionalCoordinators} regional coordinator(s)</li>
                              ) : null}
                            </ul>
                            <p className="mt-2 text-xs text-amber-700">
                              Please remove or reassign all dependencies before deleting this region.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setDeleteRegionId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Are you sure you want to delete <span className="font-semibold text-slate-900">{region?.name}</span>? This action cannot be undone.
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setDeleteRegionId(null)}
                          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleDeleteRegion}
                          disabled={deleting}
                          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-70"
                          style={{ backgroundColor: "#dc2626" }}
                        >
                          {deleting ? (
                            <>
                              <Loader2 className="animate-spin" size={16} />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete Region
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
