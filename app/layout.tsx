import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIC Summit Portal",
  description: "TIC Summit Portal V2 frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale and theming are handled in the per-locale layout.
  return (
    <html suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}

