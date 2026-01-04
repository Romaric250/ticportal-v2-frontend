"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { authService } from "../../../../src/lib/services/authService";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, Circle, ArrowLeft } from "lucide-react";

type PasswordStrength = "weak" | "fair" | "good" | "strong";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Password requirements
  const [requirements, setRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    passwordsMatch: false,
  });

  // Calculate password strength
  const getPasswordStrength = (): PasswordStrength => {
    if (newPassword.length < 8) return "weak";
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/\d/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score++;

    if (score <= 1) return "weak";
    if (score === 2) return "fair";
    if (score === 3) return "good";
    return "strong";
  };

  const passwordStrength = getPasswordStrength();

  // Update requirements
  useEffect(() => {
    setRequirements({
      minLength: newPassword.length >= 8,
      hasNumber: /\d/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      passwordsMatch: newPassword === confirmPassword && confirmPassword.length > 0,
    });
  }, [newPassword, confirmPassword]);

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

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case "weak":
        return "w-1/4";
      case "fair":
        return "w-1/2";
      case "good":
        return "w-3/4";
      case "strong":
        return "w-full";
      default:
        return "w-0";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!requirements.minLength || !requirements.hasNumber || !requirements.hasSpecialChar) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (!requirements.passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    if (!email) {
      toast.error("Email is required");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword({
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successfully");
      router.push(`/${locale}/login`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.error?.message || error?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111827] text-white font-bold">
              T
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg">
            {/* Heading */}
            <h1 className="mb-2 text-2xl font-bold text-slate-900">Reset Password</h1>
            <p className="mb-8 text-sm text-slate-600">
              Your new password must be different from previously used passwords.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input */}
              {email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit code sent to {email}
                  </p>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Password Strength */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Password Strength</label>
                    <span
                      className={`text-sm font-semibold ${
                        passwordStrength === "weak"
                          ? "text-red-600"
                          : passwordStrength === "fair"
                          ? "text-yellow-600"
                          : passwordStrength === "good"
                          ? "text-blue-600"
                          : "text-green-600"
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Use 8+ characters with a mix of letters, numbers & symbols.
                  </p>
                </div>
              )}

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  REQUIREMENTS
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {requirements.minLength ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                    <span
                      className={`text-sm ${
                        requirements.minLength ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {requirements.hasNumber ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                    <span
                      className={`text-sm ${
                        requirements.hasNumber ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Contains a number
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {requirements.hasSpecialChar ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                    <span
                      className={`text-sm ${
                        requirements.hasSpecialChar ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Contains a special character
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {requirements.passwordsMatch ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                    <span
                      className={`text-sm ${
                        requirements.passwordsMatch ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !requirements.passwordsMatch || !otp || otp.length !== 6}
                className="w-full rounded-lg bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#111827] transition-colors"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

