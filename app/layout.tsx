import type { Metadata } from "next";
import "./globals.css";

// Get the base URL for absolute image URLs (required for Open Graph)
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  title: "TIC Summit Portal",
  description: "TIC Summit Portal V2 frontend",
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
    title: "TIC Summit Portal",
    description: "TIC Summit Portal - Manage your learning, team, and hackathon journey",
    type: "website",
    url: baseUrl,
    images: [
      {
        url: `${baseUrl}/ticsummit-logo.png`,
        width: 1200,
        height: 630,
        alt: "TIC Summit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TIC Summit Portal",
    description: "TIC Summit Portal - Manage your learning, team, and hackathon journey",
    images: [`${baseUrl}/ticsummit-logo.png`],
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
        <link rel="icon" href="/tic.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/tic.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/tic.ico" />
        <link rel="manifest" href="/tic.ico" />
        <meta name="theme-color" content="#111827" />
        <meta property="og:image" content={`${baseUrl}/ticsummit-logo.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={baseUrl} />
        <meta name="twitter:image" content={`${baseUrl}/ticsummit-logo.png`} />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

