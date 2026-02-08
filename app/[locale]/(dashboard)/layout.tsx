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
import { paymentService } from "../../../src/lib/services/paymentService";
import { affiliateService, type AffiliateProfile } from "../../../src/lib/services/affiliateService";
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
    | "super-admin"
    | "affiliate";

  const { user, accessToken, initialize, initialized, logout } = useAuthStore();
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
  const [validatingAuth, setValidatingAuth] = useState(true);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [affiliateProfileChecked, setAffiliateProfileChecked] = useState(false);
  const [affiliateProfile, setAffiliateProfile] = useState<AffiliateProfile | null>(null);

  // Validate authentication on mount - check if tokens are valid
  useEffect(() => {
    const validateAuth = async () => {
      // Wait for auth store to be initialized
      if (!initialized) {
        return;
      }

      // Check if tokens exist
      const hasToken = accessToken || (typeof window !== "undefined" && tokenStorage.getAccessToken());
      
      if (!hasToken) {
        // No token, redirect to login
        logout();
        router.replace(`/${locale}/login`);
        return;
      }

      // Validate token by calling getProfile API
      try {
        await userService.getProfile();
        // Token is valid, allow access
        setValidatingAuth(false);
      } catch (error: any) {
        // Only logout on 401 (Unauthorized) errors - not 403 (Forbidden) or other errors
        // 403 means user is authenticated but lacks permission, which is fine for validation
        const status = error?.response?.status;
        if (status === 401) {
          // Token is invalid or expired
          console.error("Authentication validation failed: Unauthorized", error);
          logout();
          router.replace(`/${locale}/login`);
          return;
        } else if (status === 403) {
          // User is authenticated but may not have permission for getProfile
          // This is okay - they're still authenticated, just continue
          console.warn("Permission denied during auth validation, but user is authenticated");
          setValidatingAuth(false);
          return;
        } else {
          // Other errors (network, 500, etc.) - don't logout, just allow access
          // Token might still be valid, just a temporary server issue
          console.warn("Auth validation error (non-401):", error);
          setValidatingAuth(false);
          return;
        }
      }
    };

    validateAuth();
  }, [initialized, accessToken, router, locale, logout]);

  // Protect admin routes - check immediately and redirect silently if not authorized
  useEffect(() => {
    // Wait for auth validation to complete
    if (validatingAuth || !initialized) {
      return;
    }

    if (role === "admin" || role === "super-admin") {
      if (user) {
        const userRole = user.role?.toLowerCase();
        if (userRole !== "admin" && userRole !== "super-admin") {
          const redirectRole = userRole || "student";
          router.replace(`/${locale}/${redirectRole}`);
          return;
        }
      }
      setAuthChecked(true);
    } else if (role === "affiliate") {
      if (user) {
        const userRole = user.role?.toLowerCase();
        if (userRole !== "affiliate") {
          const redirectRole = userRole || "student";
          router.replace(`/${locale}/${redirectRole}`);
          return;
        }
      }
      setAuthChecked(true);
    } else {
      setAuthChecked(true);
    }
  }, [role, user, router, locale, initialized, validatingAuth]);

  // Check affiliate profile - verify user is affiliate and fetch profile before showing dashboard
  useEffect(() => {
    const checkAffiliateProfile = async () => {
      // Wait for auth validation and role check to complete
      if (validatingAuth || !initialized || !authChecked) {
        return;
      }

      // Only check for affiliate role
      if (role !== "affiliate") {
        setAffiliateProfileChecked(true);
        return;
      }

      // Verify user role is affiliate
      if (!user || user.role?.toLowerCase() !== "affiliate") {
        logout();
        router.replace(`/${locale}/login`);
        return;
      }

      // Fetch affiliate profile
      try {
        const profile = await affiliateService.getProfile();
        setAffiliateProfile(profile);
        setAffiliateProfileChecked(true);
      } catch (error: any) {
        console.error("Error fetching affiliate profile:", error);
        const status = error?.response?.status;
        if (status === 404 || status === 403 || status === 401) {
          // User doesn't have an affiliate profile, doesn't have permission, or is unauthorized
          toast.error("Affiliate profile not found. Please contact admin.");
          logout();
          router.replace(`/${locale}/login`);
          return;
        } else {
          // Other errors - allow access but log the error
          console.warn("Failed to fetch affiliate profile:", error);
          setAffiliateProfileChecked(true);
        }
      }
    };

    checkAffiliateProfile();
  }, [validatingAuth, initialized, authChecked, role, user, router, locale]);

  // Check payment status - redirect to payment page if payment is required but not paid
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Wait for auth validation to complete
      if (validatingAuth || !initialized || !user) {
        return;
      }

      // Only check payment for student role (other roles don't need payment)
      if (role !== "student") {
        setPaymentChecked(true);
        return;
      }

      try {
        const paymentStatus = await paymentService.checkUserPaymentStatus();
        
        // If payment is required but user hasn't paid, redirect to payment page
        if (paymentStatus.isRequired && !paymentStatus.hasPaid) {
          router.replace(`/${locale}/pay`);
          return;
        }

        setPaymentChecked(true);
      } catch (error: any) {
        console.error("Error checking payment status:", error);
        // On error, allow access (might be network issue or user doesn't need payment)
        // Don't block dashboard access on payment check errors
        setPaymentChecked(true);
      }
    };

    checkPaymentStatus();
  }, [validatingAuth, initialized, user, role, router, locale]);

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
      } catch (error: any) {
        // Don't fail onboarding check on errors - might be permission issues
        // Only log for debugging, don't block the UI
        console.warn("Failed to load profile for onboarding check:", error);
        // If profile fetch fails, don't show modal - user might not have permission
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
      }).catch((error) => {
        // Don't fail on error - might be permission issues
        console.warn("Failed to refresh profile after onboarding:", error);
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

  // Don't render anything until auth is validated and checked - show nothing (invisible)
  // This check happens AFTER all hooks are called to follow Rules of Hooks
  if (
    validatingAuth || 
    ((role === "admin" || role === "super-admin" || role === "affiliate") && !authChecked) ||
    (role === "affiliate" && !affiliateProfileChecked) ||
    (role === "student" && !paymentChecked)
  ) {
    return null; // Render nothing - completely invisible
  }

  return (
    <div className="flex h-screen bg-[#f9fafb] text-slate-900" style={{ overflow: 'visible', position: 'relative' }}>
      <Sidebar role={role} affiliateProfile={affiliateProfile || undefined} />
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto px-1 py-4 sm:px-5 sm:py-5 md:px-8 md:py-6">{children}</main>
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


