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
        icon: <Home size={20} className="text-[#111827]" />,
      },
      "tic-feed": {
        title: "TIC Feed",
        subtitle: "Stay updated with summit news, official posts, and mentorship announcements",
        icon: <Activity size={20} className="text-[#111827]" />,
      },
      community: {
        title: "TIC Community",
        subtitle: "Live discussions and updates",
        icon: <MessageSquare size={20} className="text-[#111827]" />,
        showOnlineCount: true,
      },
      "learning-path": {
        title: "Learning Path",
        subtitle: "Track your progress and complete courses",
        icon: <BookOpen size={20} className="text-[#111827]" />,
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Showcase your projects and achievements",
        icon: <User size={20} className="text-[#111827]" />,
      },
      team: {
        title: "My Team",
        subtitle: "Collaborate with your team members",
        icon: <Users size={20} className="text-[#111827]" />,
      },
      leaderboard: {
        title: "Leaderboard",
        subtitle: "Rankings based on Total TIC Points (TP)",
        icon: <Trophy size={20} className="text-[#111827]" />,
      },
      hackathons: {
        title: "Hackathons",
        subtitle: "Participate in coding challenges",
        icon: <Flag size={20} className="text-[#111827]" />,
      },
      settings: {
        title: "Profile Settings",
        subtitle: "Manage your personal information, school details, and notification preferences",
        icon: <Settings size={20} className="text-[#111827]" />,
      },
      users: {
        title: "User Management",
        subtitle: "Oversee users, approve registrations, and manage roles for your jurisdiction",
        icon: <User size={20} className="text-[#111827]" />,
      },
      // hackathons: {
      //   title: "Hackathons",
      //   subtitle: "Manage hackathon events, create new hackathons, and oversee submissions",
      //   icon: <Flag size={20} className="text-[#111827]" />,
      // },
      teams: {
        title: "Teams",
        subtitle: "View all teams, manage team members, and oversee team activities",
        icon: <Users size={20} className="text-[#111827]" />,
      },
      // "learning-path": {
      //   title: "Learning Path",
      //   subtitle: "Manage learning paths, courses, and track student progress",
      //   icon: <BookOpen size={20} className="text-[#111827]" />,
      // },
      mentorship: {
        title: "Mentorship",
        subtitle: "Manage mentorship requests, assign mentors, and track mentorship sessions",
        icon: <GraduationCap size={20} className="text-[#111827]" />,
      },
      judging: {
        title: "Judging",
        subtitle: "Assign judges to hackathons, manage judging assignments, and review scores",
        icon: <Gavel size={20} className="text-[#111827]" />,
      },
    };

    return pageMap[route] || {
      title: "Dashboard",
      subtitle: t("dashboard"),
      icon: <Home size={20} className="text-[#111827]" />,
    };
  };

  const pageInfo = getPageInfo();

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 text-sm text-slate-700">
        <div className="flex items-center gap-3">
          {pageInfo.icon}
          <div>
            <h2 className="text-lg font-bold text-slate-900">{pageInfo.title}</h2>
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
              <div className="flex md:hidden items-center gap-2 mt-1">
                <Circle size={8} className="fill-emerald-500 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-600">42 online</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLocaleSwitch}
            className="cursor-pointer rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:border-[#111827] hover:text-[#111827]"
          >
            {otherLocale === "en" ? t("english") : t("french")}
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
