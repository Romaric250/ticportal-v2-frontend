"use client";

export default function AffiliateSettingsPage() {
  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Manage your affiliate account and preferences.
        </p>
      </header>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Settings will be available when the backend API is connected.
        </p>
      </div>
    </div>
  );
}
