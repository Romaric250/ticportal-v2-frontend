import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIC Summit Portal",
  description: "TIC Summit Portal V2 frontend",
  icons: {
    icon: [
      { url: "/tic.ico", sizes: "any" },
      { url: "/tic.ico", type: "image/x-icon" },
    ],
    apple: "/tic.ico",
  },
  openGraph: {
    title: "TIC Summit Portal",
    description: "TIC Summit Portal",
    images: [
      {
        url: "/ticsummit-logo.png",
        width: 1200,
        height: 630,
        alt: "TIC Summit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TIC Summit Portal",
    description: "TIC Summit Portal",
    images: ["/ticsummit-logo.png"],
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
        <meta name="theme-color" content="#111827" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

