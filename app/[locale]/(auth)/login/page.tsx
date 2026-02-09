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
  const [error, setError] = useState<string | null>(null);
  
  // Image carousel state
  const carouselImages = [
    "https://g9kbtbs1bu.ufs.sh/f/woziFUfAWTFp7ZAqdZvRlS1GrWLQhwZMzocm87npUf63sV5v",
    "https://g9kbtbs1bu.ufs.sh/f/woziFUfAWTFpoNpwDSkPzGkaL36tyc5b2rDVApeCUB9sIw7n",
    "https://g9kbtbs1bu.ufs.sh/f/woziFUfAWTFp6iO8wdS3MiEgWbCQeLxsT0ZAUJylzqIVHOm6"
    // Add more image URLs here if you have them
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate image carousel
  useEffect(() => {
    if (carouselImages.length <= 1) return; // Don't rotate if only one image
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

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
        : userRole === "affiliate"
          ? "/affiliate"
          : "/student";
      router.replace(`/${locale}${redirectTo}`);
    }
  }, [accessToken, user, initialized, router, locale]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setSubmitting(true);
    setLoading(true);

    try {
      const response = await authService.login({ email, password });
      
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
        role: (response.user.role?.toLowerCase() || "student") as "student" | "mentor" | "judge" | "admin" | "super-admin" | "affiliate" | null,
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
        } else if (userRole === "affiliate") {
          redirectTo = "/affiliate";
        } else {
          redirectTo = "/student";
        }
      }
      
      toast.success("Logged in successfully");
      router.push(`/${locale}${redirectTo}`);
    } catch (error: any) {
      // Check if error is due to unverified email
      const errorCode = error?.response?.data?.error?.code || error?.response?.data?.[0]?.code;
      const errorMessage = error?.response?.data?.error?.message || error?.message || "Login failed. Please check your credentials.";
      
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
        // Set form-level error for invalid credentials - preserve email and password fields
        setError("Invalid email or password");
        toast.error("Invalid email or password");
        // Don't clear email/password - let user see what they entered and try again
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
                filter: 'invert(1)',
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
                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-medium text-red-800">{error}</p>
                    </div>
                  )}

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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null); // Clear error when user starts typing
                        }}
                        className={`w-full rounded-lg border bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#111827]/20 ${
                          error ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-[#111827]"
                        }`}
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
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(null); // Clear error when user starts typing
                        }}
                        className={`w-full rounded-lg border bg-white pl-9 pr-11 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#111827]/20 ${
                          error ? "border-red-300 focus:border-red-500" : "border-slate-300 focus:border-[#111827]"
                        }`}
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

            {/* Right Section - Image Carousel */}
            <div className="relative hidden lg:block bg-[#111827] min-h-[400px] overflow-hidden">
              {/* Carousel Images */}
              {carouselImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={`TIC Summit ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-[#111827]/50" />
                </div>
              ))}
              
              {/* Pagination Dots - Only show if multiple images */}
              {carouselImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {carouselImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === currentImageIndex
                          ? "h-1.5 w-8 bg-white"
                          : "h-1.5 w-1.5 bg-white/40 hover:bg-white/60"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              )}
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
