"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { authService } from "../../../../src/lib/services/authService";
import { useAuthStore } from "../../../../src/state/auth-store";
import { toast } from "sonner";
import { Mail, ArrowLeft, HelpCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  // Note: setUser and setTokens are not used in this page since verification redirects to login
  // But keeping the hook call to avoid errors if needed in the future
  const { setUser, setTokens } = useAuthStore();
  const email = searchParams.get("email") || "";
  const roleParam = searchParams.get("role") || "STUDENT";
  const role: "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN" = 
    roleParam as "STUDENT" | "MENTOR" | "JUDGE" | "SQUAD_LEAD" | "ADMIN" | "SUPER_ADMIN";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 42); // 9:42 in seconds
  const [submitting, setSubmitting] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-request OTP on mount if autoRequest param is present
  useEffect(() => {
    const autoRequest = searchParams.get("autoRequest") === "true";
    if (autoRequest && email && !otpRequested) {
      const requestOTP = async () => {
        try {
          await authService.sendOTP(email, "EMAIL_VERIFICATION");
          toast.success("Verification code sent to your email");
          setTimeLeft(10 * 60); // Reset timer to 10 minutes
          setCode(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        } catch (error: any) {
          const errorMessage = error?.message || "Failed to send code. Please try again.";
          toast.error(errorMessage);
        }
      };
      requestOTP();
      setOtpRequested(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value.replace(/\D/g, ""); // Only numbers
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
    const newCode = [...code];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pasted[i] || "";
      if (pasted[i]) {
        inputRefs.current[i]?.focus();
      }
    }
    setCode(newCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    if (!email) {
      toast.error("Email is required. Please go back and register again.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.verifyEmail(email, fullCode);

      toast.success("Email verified successfully! You can now log in.");
      router.push(`/${locale}/login`);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message || "Invalid verification code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      // Send OTP for email verification
      await authService.sendOTP(email, "EMAIL_VERIFICATION");
      toast.success("Verification code sent to your email");
      setTimeLeft(10 * 60); // Reset timer to 10 minutes
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to resend code. Please try again.";
      toast.error(errorMessage);
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
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#111827] transition-colors"
          >
            <HelpCircle size={18} />
            Need Help?
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#111827]">
                <Mail size={32} className="text-white" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-3 text-center text-2xl font-bold text-slate-900">
              Verify your email
            </h1>

            {/* Instructions */}
            <p className="mb-6 text-center text-sm text-slate-600">
              We&apos;ve sent a 6-digit verification code to
            </p>
            <p className="mb-2 text-center text-sm font-semibold text-slate-900">{email}</p>
            <p className="mb-8 text-center text-sm text-slate-600">
              Enter the code below to access the portal.
            </p>

            {/* Code Input */}
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4 flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-14 w-14 rounded-lg border-2 border-slate-300 bg-white text-center text-xl font-semibold text-slate-900 focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/20 focus:outline-none transition-colors"
                  />
                ))}
              </div>

              {/* Timer */}
              <p className="mb-6 text-center text-sm text-slate-500">
                Code expires in <span className="font-semibold text-slate-900">{formatTime(timeLeft)}</span>
              </p>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={submitting || code.join("").length !== 6}
                className="w-full rounded-lg bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Verifying..." : "Verify Account"}
              </button>
            </form>

            {/* Resend Link */}
            <p className="text-center text-sm text-slate-600">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={handleResend}
                className="font-semibold text-[#111827] hover:underline"
              >
                Click to resend
              </button>
            </p>
          </div>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#111827] transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Log In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

