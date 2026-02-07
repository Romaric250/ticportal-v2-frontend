"use client";

export default function AffiliateSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Affiliate Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Configure affiliate program defaults. All amounts in XAF.
        </p>
      </header>
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Settings will be available when the backend API is connected.
        </p>
      </div>
    </div>
  );
}
