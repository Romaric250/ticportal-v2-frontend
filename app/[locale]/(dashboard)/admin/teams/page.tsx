"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { FileText, Users } from "lucide-react";

export default function AdminTeamsPage() {
  const locale = useLocale();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teams Management</h1>
        <p className="mt-1 text-sm text-slate-600">
          View all teams, manage team members, and oversee team activities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={`/${locale}/admin/teams/deliverables`}
          className="rounded-lg border border-slate-200 bg-white p-6 transition hover:border-[#111827] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-[#111827] p-3">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Team Deliverables</h3>
              <p className="mt-1 text-sm text-slate-600">Review and manage team submissions</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500">Teams list and management coming soon...</p>
      </div>
    </div>
  );
}

