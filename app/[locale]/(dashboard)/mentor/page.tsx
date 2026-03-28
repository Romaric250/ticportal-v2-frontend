"use client";

import { useLocale } from "next-intl";
import { DataTable } from "../../../../components/ui/table";
import { Skeleton } from "../../../../components/ui/loader";

/**
 * Mentor overview — placeholder until backend APIs exist.
 * Default landing after login is /mentor/tic-feed (see getDashboardPathForRole).
 */
export default function MentorDashboardPage() {
  const locale = useLocale();
  const fr = locale === "fr";

  return (
    <div className="relative min-h-[min(480px,75vh)] overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white">
      {/* Blurred scaffold (non-interactive) */}
      <div className="pointer-events-none select-none p-6 opacity-70 blur-sm">
        <h1 className="text-lg font-semibold text-slate-900">{fr ? "Tableau de bord mentor" : "Mentor dashboard"}</h1>
        <p className="mt-1 text-xs text-slate-500">
          {fr ? "Équipes, file d’attente et statistiques." : "Assigned teams, mentorship queue, and analytics."}
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-[1.3fr,1fr]">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {fr ? "Équipes assignées" : "Assigned teams"}
            </h2>
            <DataTable
              data={[]}
              columns={[
                { key: "team", label: "Team" },
                { key: "school", label: "School" },
                { key: "stage", label: "Stage" },
              ]}
            />
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {fr ? "Demandes de mentorat" : "Mentorship requests"}
            </h2>
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>

      {/* Coming soon overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/55 px-4 backdrop-blur-[3px]">
        <div className="max-w-md rounded-xl border border-slate-200/80 bg-white/90 px-6 py-8 text-center shadow-sm">
          <p className="text-lg font-semibold tracking-tight text-slate-900">
            {fr ? "Bientôt disponible" : "Coming soon"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {fr ? (
              <>
                L’espace mentor (équipes, file d’attente, statistiques) est en cours de développement. Utilisez le{" "}
                <strong className="font-medium text-slate-800">fil TIC</strong> dans le menu pour l’instant.
              </>
            ) : (
              <>
                The mentor workspace (teams, queue, and stats) is still in development. Use{" "}
                <strong className="font-medium text-slate-800">TIC Feed</strong> in the sidebar for now.
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
