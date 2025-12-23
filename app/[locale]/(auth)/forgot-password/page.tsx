"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // TODO: call backend endpoint, e.g. /auth/forgot-password
      toast.success("If this email exists, a reset link was sent.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to send reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Forgot password
        </h1>
        <p className="text-sm text-slate-500">
          Enter your email to receive a password reset link.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-800">
            {t("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 ring-offset-0 placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send reset link"}
        </button>

        <p className="pt-2 text-center text-xs text-slate-500">
          Remember your password?{" "}
          <Link
            href={`/${locale}/login`}
            className="font-semibold text-[#111827] hover:underline"
          >
            Back to login
          </Link>
        </p>
      </form>
    </div>
  );
}


