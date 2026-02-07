"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function AffiliateManagementIndexPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/admin/affiliate-management/command-center`);
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-sm text-slate-500">Redirecting to Command Center…</p>
    </div>
  );
}
