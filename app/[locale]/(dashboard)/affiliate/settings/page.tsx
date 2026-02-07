"use client";

export default function AffiliateSettingsPage() {
  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <header>
        <h1 className="text-base font-bold text-slate-900 sm:text-lg">
          Settings
        </h1>
        <p className="mt-0.5 text-xs text-slate-600">
          Manage your affiliate account and preferences.
        </p>
      </header>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-slate-500">
          Settings will be available when the backend API is connected.
        </p>
      </div>
    </div>
  );
}
