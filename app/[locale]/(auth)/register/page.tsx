"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { authService } from "../../../../src/lib/services/authService";
import { toast } from "sonner";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "fair" | "good" | "strong">("weak");

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength("weak");
      return;
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;

    if (score <= 1) setPasswordStrength("weak");
    else if (score === 2) setPasswordStrength("fair");
    else if (score === 3) setPasswordStrength("good");
    else setPasswordStrength("strong");
  }, [password]);

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "weak":
        return "bg-red-500";
      case "fair":
        return "bg-yellow-500";
      case "good":
        return "bg-blue-500";
      case "strong":
        return "bg-green-500";
      default:
        return "bg-slate-300";
    }
  };

  const getStrengthText = () => {
    return passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    // Split full name into first and last name
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!firstName) {
      toast.error("Please enter your full name");
      return;
    }

    setSubmitting(true);

    try {
      await authService.register({
        email,
        password,
        firstName,
        lastName,
        role: "STUDENT",
      });
      
      toast.success("Registration successful! Please check your email for the verification code.");
      router.push(`/${locale}/verify-email?email=${encodeURIComponent(email)}&role=STUDENT`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-3 flex-shrink-0">
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
      <div className="flex-1 flex items-center justify-center px-4 py-3 overflow-hidden">
        <div className="w-full max-w-6xl h-full">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] h-full rounded-xl bg-white shadow-lg overflow-hidden">
            {/* Left Section - Register Form */}
            <div className="flex flex-col justify-center p-4 sm:p-5 lg:p-6 overflow-y-auto">
              <div className="mx-auto w-full max-w-sm">
                {/* Title */}
                <div className="mb-4">
                  <h3 className="mb-1 text-lg sm:text-xl lg:text-2xl font-bold text-[#111827]">
                    Create Account
                  </h3>
                  <p className="text-xs text-slate-600">
                    Join TIC Summit Portal and start your journey.
                  </p>
                </div>

                {/* Form Card */}
                <form onSubmit={onSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="e.g. jane@school.edu"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {/* Password Strength Indicator */}
                {password && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{
                          width:
                            passwordStrength === "weak"
                              ? "25%"
                              : passwordStrength === "fair"
                              ? "50%"
                              : passwordStrength === "good"
                              ? "75%"
                              : "100%",
                        }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        passwordStrength === "weak"
                          ? "text-red-600"
                          : passwordStrength === "fair"
                          ? "text-yellow-600"
                          : passwordStrength === "good"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Confirm Password</label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-10 py-2 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-[#111827] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60 mt-2"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>

              {/* Social Login Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-slate-500">Or register with</span>
                </div>
              </div>

              {/* Social Login Buttons - Disabled */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400 cursor-not-allowed opacity-60"
                >
                  {/* Google Logo */}
                  <svg width="14" height="14" viewBox="0 0 18 18">
                    <path
                      fill="#4285F4"
                      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    />
                    <path
                      fill="#34A853"
                      d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.332C2.438 15.983 5.482 18 9 18z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M3.947 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.97H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.03l2.99-2.332z"
                    />
                    <path
                      fill="#EA4335"
                      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.97L3.947 7.3C4.66 5.163 6.65 3.58 9 3.58z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  disabled
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400 cursor-not-allowed opacity-60"
                >
                  {/* Microsoft Logo */}
                  <svg width="14" height="14" viewBox="0 0 18 18">
                    <path fill="#F25022" d="M0 0h8.4v8.4H0z" />
                    <path fill="#00A4EF" d="M9.6 0H18v8.4H9.6z" />
                    <path fill="#7FBA00" d="M0 9.6h8.4V18H0z" />
                    <path fill="#FFB900" d="M9.6 9.6H18V18H9.6z" />
                  </svg>
                  Microsoft
                </button>
              </div>
            </form>

                {/* Footer Links */}
                <div className="mt-4 text-center space-y-1.5">
                  <p className="text-xs text-slate-600">
                    Already have an account?{" "}
                    <Link
                      href={`/${locale}/login`}
                      className="font-semibold text-[#111827] hover:underline"
                    >
                      Log in
                    </Link>
                  </p>
                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
                    <Link href="#" className="hover:text-[#111827] hover:underline">
                      Privacy Policy
                    </Link>
                    <span>•</span>
                    <Link href="#" className="hover:text-[#111827] hover:underline">
                      Terms of Service
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Image */}
            <div className="relative hidden lg:block bg-[#111827] h-full overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src="https://g9kbtbs1bu.ufs.sh/f/woziFUfAWTFp7ZAqdZvRlS1GrWLQhwZMzocm87npUf63sV5v"
                  alt="TIC Summit"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#111827]/40 to-[#111827]/70 transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-2 flex-shrink-0">
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
