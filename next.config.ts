import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // You can put additional Next.js config here
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);

