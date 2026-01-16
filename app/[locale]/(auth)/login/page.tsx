"use client";

import { FormEvent, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "../../../../src/state/auth-store";
import { authService } from "../../../../src/lib/services/authService";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { user, accessToken, initialize, initialized } = useAuthStore();
  const { setUser, setTokens, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentSummit, setCurrentSummit] = useState(0);

  const summits = ["TIC21", "TIC22", "TIC23", "TIC24", "TIC25", "TIC26"];

  // Initialize auth store
  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (!initialized) return;

    // If user has tokens and user data, redirect to their dashboard
    if (accessToken && user) {
      const userRole = user.role?.toLowerCase() || "student";
      const redirectTo = userRole === "admin" || userRole === "super-admin" 
        ? `/${userRole}` 
        : "/student";
      router.replace(`/${locale}${redirectTo}`);
    }
  }, [accessToken, user, initialized, router, locale]);

  // Auto-cycle through summits
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSummit((prev) => (prev + 1) % summits.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [summits.length]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      console.log("Login response:", response);
      
      // Check if email is verified
      if (response.user.isVerified === false) {
        // User is not verified, redirect to verify-email page and auto-request OTP
        try {
          await authService.sendOTP(email, "EMAIL_VERIFICATION");
          toast.info("Please verify your email. A verification code has been sent to your email.");
        } catch (otpError) {
          // If sending OTP fails, still redirect but show a message
          toast.info("Please verify your email to continue.");
        }
        router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}&autoRequest=true`);
        return;
      }
      
      // Store tokens
      setTokens(response.accessToken, response.refreshToken);
      
      // Map API user to AuthUser type
      const user = {
        id: response.user.id || "",
        name: response.user.name || `${response.user.firstName || ""} ${response.user.lastName || ""}`.trim() || email.split("@")[0],
        email: response.user.email,
        role: (response.user.role?.toLowerCase() || "student") as "student" | "mentor" | "judge" | "admin" | "super-admin" | null,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
      };

      setUser(user);

      // Auto-redirect admins to admin dashboard
      const userRole = user.role?.toLowerCase();
      let redirectTo = searchParams.get("redirect");
      
      if (!redirectTo) {
        if (userRole === "admin" || userRole === "super-admin") {
          redirectTo = `/${userRole}`;
        } else {
          redirectTo = "/student";
        }
      }
      
      toast.success("Logged in successfully");
      router.push(`/${locale}${redirectTo}`);
    } catch (error: any) {
      console.error(error);
      
      // Check if error is due to unverified email
      const errorCode = error?.response?.data?.error?.code || error?.response?.data?.[0]?.code;
      const errorMessage = error?.message || "Login failed. Please check your credentials.";
      
      // Common error codes for unverified email: UNVERIFIED_EMAIL, EMAIL_NOT_VERIFIED, etc.
      if (
        errorCode === "UNVERIFIED_EMAIL" ||
        errorCode === "EMAIL_NOT_VERIFIED" ||
        errorMessage.toLowerCase().includes("verify") ||
        errorMessage.toLowerCase().includes("unverified")
      ) {
        // Resend OTP for email verification
        try {
          // Try to resend OTP by calling register (backend should handle existing users)
          await authService.register({
            email,
            password: "", // Not needed for resending OTP, but required by type
            firstName: "",
            lastName: "",
            role: "STUDENT", // Default, backend might ignore this for existing users
          });
          toast.info("Please verify your email. A verification code has been sent to your email.");
          router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
        } catch (resendError) {
          // If resend fails, still redirect to verify-email page
          toast.info("Please verify your email to continue.");
          router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/ticsummit-logo.png" 
              alt="TIC Summit" 
              className="h-8 w-auto"
              style={{ 
                maxWidth: '200px', 
                height: '32px', 
                width: 'auto',
                objectFit: 'contain',
                display: 'block',
                opacity: 1,
                visibility: 'visible',
                filter: 'none',
                mixBlendMode: 'normal',
                position: 'relative',
                zIndex: 10
              }}
              onError={(e) => {
                console.error("Logo image failed to load. Check if /ticsummit-logo.png exists in public folder.");
                (e.target as HTMLImageElement).style.border = '2px solid red';
              }}
              onLoad={() => {
                console.log("Logo loaded successfully");
              }}
            />
          </div>
          <Link
            href="#"
            className="text-xs font-medium text-slate-600 hover:text-[#111827] transition-colors"
          >
            Help Center
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-5xl rounded-xl bg-white shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Section - Login Form */}
            <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8 xl:p-10">
              <div className="mx-auto w-full max-w-md">
                <h1 className="mb-1.5 text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Sign in</h1>
                <p className="mb-4 sm:mb-5 text-xs sm:text-sm text-slate-600">
                  Welcome back to your academic workspace.
                </p>

                <form onSubmit={onSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                        placeholder="student@school.edu"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-700">Password</label>
                      <Link
                        href={`/${locale}/forgot-password`}
                        className="text-xs font-medium text-[#111827] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-11 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    />
                    <label htmlFor="remember" className="text-xs text-slate-700 cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Signing in..." : "Log in"}
                  </button>

                  {/* Create Account */}
                  <p className="text-center text-xs text-slate-600">
                    New to the platform?{" "}
                    <Link
                      href={`/${locale}/register`}
                      className="font-semibold text-[#111827] hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Section - Promotional */}
            <div className="relative hidden lg:block bg-[#111827] min-h-[400px] overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-[#111827]" />
              
              <div className="relative z-10 flex h-full flex-col items-center justify-center p-6">
                {/* Summit Year Display */}
                <div className="mb-8">
                  <div className="text-4xl xl:text-5xl font-light tracking-wider text-white/95">
                    {summits[currentSummit]}
                  </div>
                </div>

                {/* Minimal Pagination Dots */}
                <div className="flex gap-1.5">
                  {summits.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSummit(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentSummit
                          ? "h-1 w-6 bg-white"
                          : "h-1 w-1 bg-white/30 hover:bg-white/50"
                      }`}
                      aria-label={`Go to ${summits[index]}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-500">
          © 2026 TIC Summit. All rights reserved.{" "}
          <Link href="#" className="hover:text-[#111827] hover:underline">
            Privacy Policy
          </Link>{" "}
          
          {" "}
          <Link href="https://ticsummit.org"  target="_blank" className="text-[#111827] underline">
            ticsummit.org
          </Link>
        </div>
      </footer>
    </div>
  );
}
