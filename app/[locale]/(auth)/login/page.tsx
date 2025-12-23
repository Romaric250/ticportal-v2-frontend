"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useAuthStore } from "../../../../src/state/auth-store";
import { toast } from "sonner";

export default function LoginPage() {
  const t = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { setUser, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // Respect stored language preference, or store the current one
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("tp_locale");
    if (saved && saved !== locale) {
      router.replace(`/${saved}/login`);
    } else if (!saved) {
      window.localStorage.setItem("tp_locale", locale);
    }
  }, [locale, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLoading(true);

    try {
      // TEMP: Mock login until backend auth is ready.
      const redirectTo = searchParams.get("redirect") ?? "/student";
      const user = {
        id: "mock-user",
        name: email.split("@")[0] || "Student",
        email,
        role: "student" as const,
      };

      setUser(user);

      if (typeof document !== "undefined") {
        // Non-httpOnly cookie so the proxy can treat this as "authenticated" during development.
        document.cookie = "tp_auth=1; path=/";
      }

      toast.success("Logged in (mock)");
      router.push(`/${locale}${redirectTo}`);
    } catch (error) {
      console.error(error);
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          {t("login")}
        </h1>
        <p className="text-sm text-slate-500">
          Sign in to access your TIC Summit dashboard.
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

        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>
            Don&apos;t have an account?{" "}
            <Link
              href={`/${locale}/register`}
              className="font-semibold text-[#111827] hover:underline"
            >
              Sign up
            </Link>
          </span>
          <Link
            href={`/${locale}/forgot-password`}
            className="font-semibold text-[#111827] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#111827] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Signing in..." : t("login")}
        </button>
      </form>
    </div>
  );
}


