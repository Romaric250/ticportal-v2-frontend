"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { authService } from "../../../../src/lib/services/authService";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email, type: "PASSWORD_RESET" });
      toast.success("If this email exists, a reset code has been sent to your email.");
      // Redirect to reset password page with email
      router.push(`/${locale}/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error(error);
      // Don't reveal if email exists or not for security
      toast.success("If this email exists, a reset code has been sent to your email.");
      // Still redirect to reset password page
      router.push(`/${locale}/reset-password?email=${encodeURIComponent(email)}`);
    } finally {
      setSubmitting(false);
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
      <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-6xl items-center justify-center px-4 py-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#111827]">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </div>
            </div>

            {/* Heading */}
            <h1 className="mb-1.5 text-center text-xl font-bold text-slate-900">Reset password</h1>
            <p className="mb-5 text-center text-xs text-slate-600">
              Enter the email associated with your account and we&apos;ll send you a link to reset
              your password.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">
                  Email address or Username
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
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-4 text-center">
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-[#111827] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to login
              </Link>
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
