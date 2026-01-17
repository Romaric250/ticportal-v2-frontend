import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { BadgePoints } from "../../../components/gamification/BadgePoints";
import { QuickAccessTile } from "./StudentQuickAccessTile";
import { UpcomingDeadlineItem } from "./StudentUpcomingDeadlineItem";
import type { UpcomingDeadline, RecentBadge, BadgeStats } from "@/src/lib/services/dashboardService";

type Props = {
  deadlines: UpcomingDeadline[];
  badges: RecentBadge[];
  badgeStats: BadgeStats;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  } catch {
    return dateString;
  }
};

const getBadgeColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    emerald: "bg-emerald-50 text-emerald-700",
    pink: "bg-pink-50 text-pink-700",
    slate: "bg-slate-50 text-slate-400",
  };
  return colorMap[color] || "bg-slate-50 text-slate-400";
};

// Helper to get a fallback icon if the provided icon is invalid
const getBadgeIcon = (icon: string | null | undefined): string => {
  if (!icon || icon.trim().length === 0) {
    return "🏆"; // Default fallback
  }
  // Return the icon as-is - browser should handle UTF-8 encoding
  return icon;
};

export function StudentBottomRow({ deadlines, badges, badgeStats }: Props) {
  const router = useRouter();
  const locale = useLocale();

  const handleViewAllBadges = () => {
    // Navigate to badges/portfolio page if available
    router.push(`/${locale}/student/portfolio`);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Upcoming deadlines */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm border-l-4 border-l-[#111827]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Upcoming deadlines
          </h2>
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-600">
            📅
          </div>
        </div>
        {deadlines.length > 0 ? (
          <ul className="space-y-3">
            {deadlines.slice(0, 3).map((deadline) => (
              <UpcomingDeadlineItem
                key={deadline.id}
                variant={deadline.variant}
                title={deadline.title}
                subtitle={deadline.subtitle}
                date={formatDate(deadline.date)}
              />
            ))}
          </ul>
        ) : (
          <p className="text-xs text-slate-500 py-4">No upcoming deadlines</p>
        )}
      </div>

      {/* Recent badges */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm border-l-4 border-l-[#111827]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            Recent badges
          </h2>
          <button
            onClick={handleViewAllBadges}
            className="cursor-pointer text-xs font-medium text-[#111827] hover:underline"
          >
            View all
          </button>
        </div>

        {badges.length > 0 ? (
          <>
            <div className="flex gap-2">
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className={`flex h-14 w-16 flex-col items-center justify-center rounded-xl text-xs font-semibold ${
                    badge.locked ? "bg-slate-50 text-slate-400" : getBadgeColorClass(badge.color)
                  }`}
                  title={badge.name}
                >
                  <span className="text-lg">{getBadgeIcon(badge.icon)}</span>
                  <span className="text-center text-[10px] leading-tight">{badge.name}</span>
                </div>
              ))}
            </div>
            <BadgePoints badgesCount={badgeStats.totalBadges} points={badgeStats.totalPoints} />
          </>
        ) : (
          <p className="text-xs text-slate-500 py-4">No badges earned yet</p>
        )}
      </div>

      {/* Quick access */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm border-l-4 border-l-[#111827]">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
          Quick access
        </h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <QuickAccessTile icon="💡" label="Hackathon" />
          <QuickAccessTile icon="📚" label="Resources" />
          <QuickAccessTile icon="📅" label="Calendar" />
          <QuickAccessTile icon="❓" label="Support" />
        </div>
      </div>
    </div>
  );
}


