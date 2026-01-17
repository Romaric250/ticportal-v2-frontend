"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Activity, Home, BookOpen, User, Users, Trophy, Flag, Circle, Settings, GraduationCap, Gavel } from "lucide-react";
import { UserProfileMenu } from "./UserProfileMenu";
import { NotificationsModal } from "./NotificationsModal";
import { NotificationsButton } from "./NotificationsButton";

type PageInfo = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  showOnlineCount?: boolean;
};

export function TopNav() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);

  const otherLocale = locale === "en" ? "fr" : "en";

  const handleLocaleSwitch = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("tp_locale", otherLocale);
    }

    const segments = pathname.split("/").filter(Boolean);
    
    // If no segments, go to root with new locale
    if (segments.length === 0) {
      router.push(`/${otherLocale}`);
      return;
    }

    // Replace the first segment (locale) with the new locale
    // This handles all cases: /en/student, /en/student/team, /en/student/hackathons/regional-finals-2024, etc.
    segments[0] = otherLocale;
    const localizedPath = `/${segments.join("/")}`;

    router.push(localizedPath);
  };

  // Get page info based on current route
  const getPageInfo = (): PageInfo => {
    const segments = pathname.split("/").filter(Boolean);
    const route = segments.slice(2).join("/") || "overview";

    const pageMap: Record<string, PageInfo> = {
      overview: {
        title: "Overview",
        subtitle: "Welcome to your dashboard",
        icon: <Home className="text-[#111827] w-full h-full" />,
      },
      "tic-feed": {
        title: "TIC Feed",
        subtitle: "Stay updated with summit news, official posts, and mentorship announcements",
        icon: <Activity className="text-[#111827] w-full h-full" />,
      },
      community: {
        title: "TIC Community",
        subtitle: "Live discussions and updates",
        icon: <MessageSquare className="text-[#111827] w-full h-full" />,
        showOnlineCount: true,
      },
      "learning-path": {
        title: "Learning Path",
        subtitle: "Track your progress and complete courses",
        icon: <BookOpen className="text-[#111827] w-full h-full" />,
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Showcase your projects and achievements",
        icon: <User className="text-[#111827] w-full h-full" />,
      },
      team: {
        title: "My Team",
        subtitle: "Collaborate with your team members",
        icon: <Users className="text-[#111827] w-full h-full" />,
      },
      leaderboard: {
        title: "Leaderboard",
        subtitle: "Rankings based on Total TIC Points (TP)",
        icon: <Trophy className="text-[#111827] w-full h-full" />,
      },
      hackathons: {
        title: "Hackathons",
        subtitle: "Participate in coding challenges",
        icon: <Flag className="text-[#111827] w-full h-full" />,
      },
      settings: {
        title: "Profile Settings",
        subtitle: "Manage your personal information, school details, and notification preferences",
        icon: <Settings className="text-[#111827] w-full h-full" />,
      },
      users: {
        title: "User Management",
        subtitle: "Oversee users, approve registrations, and manage roles for your jurisdiction",
        icon: <User className="text-[#111827] w-full h-full" />,
      },
      // hackathons: {
      //   title: "Hackathons",
      //   subtitle: "Manage hackathon events, create new hackathons, and oversee submissions",
      //   icon: <Flag className="text-[#111827] w-full h-full" />,
      // },
      teams: {
        title: "Teams",
        subtitle: "View all teams, manage team members, and oversee team activities",
        icon: <Users className="text-[#111827] w-full h-full" />,
      },
      // "learning-path": {
      //   title: "Learning Path",
      //   subtitle: "Manage learning paths, courses, and track student progress",
      //   icon: <BookOpen className="text-[#111827] w-full h-full" />,
      // },
      mentorship: {
        title: "Mentorship",
        subtitle: "Manage mentorship requests, assign mentors, and track mentorship sessions",
        icon: <GraduationCap className="text-[#111827] w-full h-full" />,
      },
      judging: {
        title: "Judging",
        subtitle: "Assign judges to hackathons, manage judging assignments, and review scores",
        icon: <Gavel className="text-[#111827] w-full h-full" />,
      },
    };

    return pageMap[route] || {
      title: "Dashboard",
      subtitle: t("dashboard"),
      icon: <Home className="text-[#111827] w-full h-full" />,
    };
  };

  const pageInfo = getPageInfo();

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
            {pageInfo.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">{pageInfo.title}</h2>
            <div className="hidden md:flex items-center gap-2">
              <p className="text-xs text-slate-500">{pageInfo.subtitle}</p>
              {pageInfo.showOnlineCount && (
                <>
                  <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600">42 online</span>
                </>
              )}
            </div>
            {pageInfo.showOnlineCount && (
              <div className="flex md:hidden items-center gap-1.5 mt-0.5">
                <Circle size={6} className="fill-emerald-500 text-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-600">42</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleLocaleSwitch}
            disabled
            className="cursor-not-allowed rounded-full border border-slate-200 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-slate-400 opacity-50 transition-colors"
          >
            <span className="hidden sm:inline">{otherLocale === "en" ? t("english") : t("french")}</span>
            <span className="sm:hidden uppercase">{otherLocale}</span>
          </button>

          {/* Notifications Button */}
          <NotificationsButton onOpen={() => setShowNotifications(true)} />

          {/* User Profile Menu */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Notifications Modal */}
      {showNotifications && (
        <NotificationsModal onClose={() => setShowNotifications(false)} />
      )}
    </>
  );
}
