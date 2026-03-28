"use client";

import { type ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useAuthStore } from "../../src/state/auth-store";

type Props = {
  children: ReactNode;
};

export function ReviewerGradingGate({ children }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    if (!user) return;
    const r = user.role?.toLowerCase();
    if (r === "judge") return;
    if (user.isReviewer === true) return;
    const home =
      r === "mentor"
        ? `/${locale}/mentor/tic-feed`
        : r === "student"
          ? `/${locale}/student`
          : r === "affiliate"
            ? `/${locale}/affiliate`
            : `/${locale}/student`;
    router.replace(home);
  }, [user, router, locale]);

  if (!user) {
    return <p className="text-sm text-slate-600">Loading…</p>;
  }

  const r = user.role?.toLowerCase();
  if (r !== "judge" && user.isReviewer !== true) {
    return null;
  }

  return <>{children}</>;
}
