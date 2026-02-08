import type { Metadata } from "next";
import "./globals.css";

// Get the base URL for absolute image URLs (required for Open Graph)
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
  manifest: "/tic.ico",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale and theming are handled in the per-locale layout.
  return (
    <html suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

