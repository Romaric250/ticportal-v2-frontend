import { getRequestConfig } from "next-intl/server";

export type AppLocale = "en" | "fr";

export const locales: AppLocale[] = ["en", "fr"];
export const defaultLocale: AppLocale = "en";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as AppLocale)) {
    locale = defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});


