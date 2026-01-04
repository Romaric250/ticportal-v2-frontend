"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: call backend endpoint, e.g. /auth/forgot-password
      toast.success("If this email exists, a reset link was sent.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Unable to send reset link. Please try again.");
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
                <svg
                  width="32"
                  height="32"
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
            <h1 className="mb-3 text-center text-2xl font-bold text-slate-900">Reset password</h1>
            <p className="mb-8 text-center text-sm text-slate-600">
              Enter the email associated with your account and we&apos;ll send you a link to reset
              your password.
            </p>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Email address or Username
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
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
                <ArrowRight size={18} />
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

          {/* Support Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Having trouble?{" "}
              <Link href="#" className="font-semibold text-slate-700 hover:text-[#111827] hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
