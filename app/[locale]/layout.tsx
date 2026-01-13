import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { locales, type AppLocale } from "../../src/i18n/request";
import { Toaster } from "../../components/ui/toaster";

export const metadata: Metadata = {
  title: "TIC Summit Portal",
  description: "TIC Summit",
  icons: {
    icon: "/tic.ico",
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = (await params) as { locale: AppLocale };

  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = (await import(`../../src/messages/${locale}.json`)).default;
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="min-h-screen bg-white text-slate-900 antialiased">
        {children}
        <Toaster />
      </div>
    </NextIntlClientProvider>
  );
}


