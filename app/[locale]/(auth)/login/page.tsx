"use client";

import { FormEvent, useState } from "react";
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
  const { setUser, setTokens, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      console.log("Login response:", response);
      
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
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-white font-bold">
              T
            </div>
          </div>
          <Link
            href="#"
            className="text-sm font-medium text-slate-600 hover:text-[#111827] transition-colors"
          >
            Help Center
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-7xl items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-6xl rounded-2xl bg-white shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2">
            {/* Left Section - Login Form */}
            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-12 xl:p-16">
              <div className="mx-auto w-full max-w-md">
                <h1 className="mb-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">Sign in</h1>
                <p className="mb-6 sm:mb-8 text-sm sm:text-base text-slate-600">
                  Welcome back to your academic workspace.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Email or Username
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                        placeholder="student@school.edu"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Password</label>
                      <Link
                        href={`/${locale}/forgot-password`}
                        className="text-sm font-medium text-[#111827] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                      className="h-4 w-4 rounded border-slate-300 text-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    />
                    <label htmlFor="remember" className="text-sm text-slate-700 cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? "Signing in..." : "Log in"}
                  </button>

                  {/* Create Account */}
                  <p className="text-center text-sm text-slate-600">
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
            <div className="relative hidden lg:block bg-gradient-to-br from-teal-600 to-teal-800 min-h-[500px]">
              {/* Background Image Placeholder - Replace with actual image */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-600 to-teal-800" />
              <div className="relative z-10 flex h-full flex-col justify-center p-8 xl:p-12 text-white">
                {/* Pagination Dots */}
                <div className="mb-6 xl:mb-8 flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-white" />
                  <div className="h-2 w-2 rounded-full bg-white/40" />
                  <div className="h-2 w-2 rounded-full bg-white/40" />
                </div>

                <h2 className="mb-4 text-3xl xl:text-4xl font-bold leading-tight">
                  Empowering the next generation of innovators.
                </h2>
                <p className="text-base xl:text-lg text-white/90">
                  Manage your hackathon teams, submit your scores, and build your academic portfolio
                  all in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-500">
          © 2024 TIC Summit. All rights reserved.{" "}
          <Link href="#" className="hover:text-[#111827] hover:underline">
            Privacy Policy
          </Link>{" "}
          •{" "}
          <Link href="#" className="hover:text-[#111827] hover:underline">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
