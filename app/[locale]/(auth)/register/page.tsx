"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { authService } from "../../../../src/lib/services/authService";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      await authService.register({ email, password });
      toast.success("Registered! Please verify your email.");
      router.push("/en/login");
    } catch (error) {
      console.error(error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("register")}
        </h1>
        <p className="text-sm text-slate-500">
          Create your TIC Summit student or mentor account.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4 text-left">
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

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-800">
            {t("password")}
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 ring-offset-0 placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-800">
            {t("confirmPassword")}
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-0 ring-offset-0 placeholder:text-slate-400 focus:border-[#111827] focus:ring-1 focus:ring-[#111827]"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Creating account..." : t("register")}
        </button>

        <p className="pt-2 text-center text-xs text-slate-600">
          Already have an account?{" "}
          <a
            href={`/${locale}/login`}
            className="font-semibold text-[#111827] hover:underline"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}


