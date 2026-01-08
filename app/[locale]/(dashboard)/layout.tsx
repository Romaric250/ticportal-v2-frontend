"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Sidebar } from "../../../components/layout/Sidebar";
import { TopNav } from "../../../components/layout/TopNav";
import { OnboardingModal } from "../../../components/dashboard/OnboardingModal";
import { TeamModal } from "../../../components/dashboard/TeamModal";
import { useAuthStore } from "../../../src/state/auth-store";
import { userService } from "../../../src/lib/services/userService";
import { teamService } from "../../../src/lib/services/teamService";
import { tokenStorage } from "../../../src/lib/api-client";
import { toast } from "sonner";

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const role = (segments[2] ?? "student") as
    | "student"
    | "mentor"
    | "judge"
    | "admin"
    | "super-admin";

  const { user, initialize, initialized } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  // Initialize auth store on mount to sync tokens
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [profileData, setProfileData] = useState<{
    country?: string;
    region?: string;
    school?: string;
    grade?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Protect admin routes - check immediately and redirect silently if not authorized
  useEffect(() => {
    // Wait for auth store to be initialized before checking
    if (!initialized) {
      return;
    }

    if (role === "admin" || role === "super-admin") {
      // Check if tokens exist in storage (even if user not loaded yet)
      const hasToken = typeof window !== "undefined" && tokenStorage.getAccessToken();
      
      // If no token and no user, redirect to login
      if (!hasToken && !user) {
        router.replace(`/${locale}/login`);
        return;
      }
      
      // If user is loaded, check role
      if (user) {
        const userRole = user.role?.toLowerCase();
        if (userRole !== "admin" && userRole !== "super-admin") {
          // User is not an admin, redirect silently to their dashboard (no toast, no indication)
          const redirectRole = userRole || "student";
          router.replace(`/${locale}/${redirectRole}`);
          return;
        }
      }
      
      // User has token (and is admin if user is loaded), allow access
      setAuthChecked(true);
    } else {
      // Not an admin route, no need to check
      setAuthChecked(true);
    }
  }, [role, user, router, locale, initialized]);


  // Check if student needs onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (role !== "student" || !user) {
        setLoading(false);
        return;
      }

      try {
        const profile = await userService.getProfile();
        setProfileData({
          country: profile.country,
          region: profile.region,
          school: profile.school,
          grade: profile.grade,
        });

        // Show modal if any required field is missing
        // Region is required only if country is Cameroon
        const isRegionRequired = profile.country === "Cameroon";
        const hasRegion = isRegionRequired ? profile.region : true;
        
        if (!profile.country || !profile.school || !profile.grade || !hasRegion) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        // If profile fetch fails, don't show modal
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [role, user]);

  // Check if student is in a team
  useEffect(() => {
    const checkTeam = async () => {
      if (role !== "student" || !user) {
        setLoadingTeam(false);
        return;
      }

      // Only check team after onboarding is complete
      if (showOnboarding) {
        setLoadingTeam(false);
        return;
      }

      try {
        const myTeams = await teamService.getMyTeams();
        // Check for pending requests
        const pendingRequests = await teamService.getMyJoinRequests();
        const hasPendingRequest = Array.isArray(pendingRequests) && pendingRequests.length > 0;
        
        // If user has no teams and no pending requests, show the modal
        if (myTeams.length === 0 && !hasPendingRequest) {
          setShowTeamModal(true);
        } else {
          // User is in a team or has pending request, don't show modal
          setShowTeamModal(false);
        }
      } catch (error) {
        console.error("Error checking team status:", error);
        // If team check fails, don't show modal (might be a network issue)
      } finally {
        setLoadingTeam(false);
      }
    };

    // Only check team if onboarding is not showing
    if (!showOnboarding) {
      checkTeam();
    }
  }, [role, user, showOnboarding]);

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Refresh profile data after update
    if (user) {
      userService.getProfile().then((profile) => {
        setProfileData({
          country: profile.country,
          region: profile.region,
          school: profile.school,
          grade: profile.grade,
        });
      });
    }
  };

  const handleTeamModalClose = () => {
    // Check again if user is in a team or has pending request before closing
    const checkBeforeClose = async () => {
      try {
        const myTeams = await teamService.getMyTeams();
        const pendingRequests = await teamService.getMyJoinRequests();
        const hasPendingRequest = Array.isArray(pendingRequests) && pendingRequests.length > 0;
        const isInTeam = Array.isArray(myTeams) && myTeams.length > 0;
        
        if (isInTeam || hasPendingRequest) {
          // User is in a team or has pending request, allow closing
          setShowTeamModal(false);
        } else {
          // User still not in a team and no pending request, keep modal open
          // Don't show error toast - the modal itself will show the message
        }
      } catch (error) {
        console.error("Error checking team status:", error);
        // On error, allow closing (might be network issue)
        setShowTeamModal(false);
      }
    };
    checkBeforeClose();
  };

  // Don't render anything until auth is checked for admin routes - show nothing (invisible)
  // This check happens AFTER all hooks are called to follow Rules of Hooks
  if ((role === "admin" || role === "super-admin") && !authChecked) {
    return null; // Render nothing - completely invisible
  }

  return (
    <div className="flex h-screen bg-[#f9fafb] text-slate-900" style={{ overflow: 'visible', position: 'relative' }}>
      <Sidebar role={role} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
      
      {/* Onboarding Modal */}
      {!loading && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={handleOnboardingClose}
          initialData={profileData || undefined}
        />
      )}

      {/* Team Modal - Only show after onboarding is complete */}
      {!loading && !loadingTeam && !showOnboarding && (
        <TeamModal
          isOpen={showTeamModal}
          onClose={handleTeamModalClose}
        />
      )}
    </div>
  );
}


