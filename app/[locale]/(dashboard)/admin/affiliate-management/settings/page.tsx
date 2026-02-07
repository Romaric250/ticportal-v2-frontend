"use client";

import { useState, useEffect } from "react";
import { Plus, Globe, MapPin, Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
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
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [countryForm, setCountryForm] = useState({
    code: "",
    name: "",
    currency: "XAF",
    studentPrice: 0,
    platformFee: 0,
    affiliateCommissionRate: 0.09,
    regionalCommissionRate: 0.06,
    nationalCommissionRate: 0.05,
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
      await affiliateService.createCountry(countryForm);
      toast.success(`Country "${countryForm.name}" created successfully`);
      setShowCountryForm(false);
      setCountryForm({
        code: "",
        name: "",
        currency: "XAF",
        studentPrice: 0,
        platformFee: 0,
        affiliateCommissionRate: 0.09,
        regionalCommissionRate: 0.06,
        nationalCommissionRate: 0.05,
      });
      await loadData();
    } catch (error: any) {
      console.error("Failed to create country:", error);
      toast.error(error?.message || "Failed to create country");
    } finally {
      setSubmitting(false);
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
      await affiliateService.createRegion({
        countryId: regionForm.countryId,
        name: regionForm.name.trim(),
      });
      toast.success(`Region "${regionForm.name}" created successfully`);
      setShowRegionForm(false);
      setRegionForm({ countryId: selectedCountryId || "", name: "" });
      await loadData();
    } catch (error: any) {
      console.error("Failed to create region:", error);
      toast.error(error?.message || "Failed to create region");
    } finally {
      setSubmitting(false);
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
              onClick={() => setShowCountryForm(!showCountryForm)}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: THEME }}
            >
              <Plus size={16} />
              Add Country
            </button>
          </div>

          {/* Create Country Form */}
          {showCountryForm && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Create New Country</h3>
                <button
                  type="button"
                  onClick={() => setShowCountryForm(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                      value={countryForm.code}
                      onChange={(e) =>
                        setCountryForm({ ...countryForm, code: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., CM"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
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
                    onClick={() => setShowCountryForm(false)}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Create Country
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                    </tr>
                  </thead>
                  <tbody>
                    {countries.map((country) => (
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
                      </tr>
                    ))}
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
              onClick={() => setShowRegionForm(!showRegionForm)}
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

          {/* Create Region Form */}
          {showRegionForm && countries.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900">Create New Region</h3>
                <button
                  type="button"
                  onClick={() => setShowRegionForm(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                    value={regionForm.countryId}
                    onChange={(e) => {
                      setRegionForm({ ...regionForm, countryId: e.target.value });
                      setSelectedCountryId(e.target.value);
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
                    onClick={() => setShowRegionForm(false)}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Create Region
                      </>
                    )}
                  </button>
                </div>
              </form>
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
                            </tr>
                          </thead>
                          <tbody>
                            {countryRegions.map((region) => (
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
                              </tr>
                            ))}
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
    </div>
  );
}
