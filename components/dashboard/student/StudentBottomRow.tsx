import React from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Calendar, Award, Lightbulb, BookOpen, HelpCircle, Trophy } from "lucide-react";
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

// Helper to get a fallback icon component if the provided icon is invalid
const getBadgeIconComponent = (icon: string | null | undefined): React.ReactNode => {
  // For now, we'll use a default Trophy icon component instead of emoji
  // In the future, you could map icon strings to specific icon components
  return <Trophy className="h-5 w-5" />;
};

export function StudentBottomRow({ deadlines, badges, badgeStats }: Props) {
  const router = useRouter();
  const locale = useLocale();

  const handleViewAllBadges = () => {
    // Navigate to badges/portfolio page if available
    router.push(`/${locale}/student/portfolio`);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {/* Upcoming deadlines */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md border-l-4 border-l-slate-900 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <Calendar className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Upcoming Deadlines
            </h2>
          </div>
        </div>
        {deadlines.length > 0 ? (
          <ul className="space-y-2">
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
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-6 w-6 text-slate-400 mb-1.5" />
            <p className="text-[11px] text-slate-500">No upcoming deadlines</p>
          </div>
        )}
      </div>

      {/* Recent badges */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md border-l-4 border-l-slate-900 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
              <Award className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-[10px] font-bold uppercase tracking-wide text-slate-900">
              Recent Badges
            </h2>
          </div>
          <button
            onClick={handleViewAllBadges}
            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            View all
          </button>
        </div>

        {badges.length > 0 ? (
          <>
            <div className="flex gap-1.5 mb-3">
              {badges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  className={`flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${
                    badge.locked ? "bg-slate-50 text-slate-400" : getBadgeColorClass(badge.color)
                  }`}
                  title={badge.name}
                >
                  <div className="flex items-center justify-center">
                    {getBadgeIconComponent(badge.icon)}
                  </div>
                  <span className="text-center text-[9px] leading-tight px-1">{badge.name}</span>
                </div>
              ))}
            </div>
            <BadgePoints badgesCount={badgeStats.totalBadges} points={badgeStats.totalPoints} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Award className="h-6 w-6 text-slate-400 mb-1.5" />
            <p className="text-[11px] text-slate-500">No badges earned yet</p>
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md border-l-4 border-l-slate-900 sm:p-5">
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900">
            <Lightbulb className="h-3.5 w-3.5 text-white" />
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-wide text-slate-900">
            Quick Access
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <QuickAccessTile icon={<Lightbulb className="h-4 w-4" />} label="Hackathon" />
          <QuickAccessTile icon={<BookOpen className="h-4 w-4" />} label="Resources" />
          <QuickAccessTile icon={<Calendar className="h-4 w-4" />} label="Calendar" />
          <QuickAccessTile icon={<HelpCircle className="h-4 w-4" />} label="Support" />
        </div>
      </div>
    </div>
  );
}


