import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { locales, type AppLocale } from "../../src/i18n/request";
import { Toaster } from "../../components/ui/toaster";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "TIC Summit Portal",
  description: "TIC Summit Portal - Manage your learning, team, and hackathon journey in one place",
  keywords: ["TIC Summit", "Hackathon", "Education", "Cameroon", "Innovation"],
  authors: [{ name: "TIC Summit" }],
  creator: "TIC Summit",
  publisher: "TIC Summit",
  icons: {
    icon: [
      { url: "/tic.ico", sizes: "any" },
      { url: "/tic.ico", type: "image/x-icon" },
    ],
    apple: "/tic.ico",
    shortcut: "/tic.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "TIC Summit Portal",
    title: "TIC Summit Portal",
    description: "TIC Summit Portal - Manage your learning, team, and hackathon journey in one place",
    images: [
      {
        url: `${baseUrl}/ticsummit-logo.png`,
        width: 1200,
        height: 630,
        alt: "TIC Summit Logo",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TIC Summit Portal",
    description: "TIC Summit Portal - Manage your learning, team, and hackathon journey in one place",
    images: [`${baseUrl}/ticsummit-logo.png`],
    creator: "@ticsummit",
    site: "@ticsummit",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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


