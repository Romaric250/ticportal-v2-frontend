import { getRequestConfig } from "next-intl/server";

export type AppLocale = "en" | "fr";

export const locales: AppLocale[] = ["en", "fr"];
export const defaultLocale: AppLocale = "fr";

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is always a string
  let validLocale: AppLocale = defaultLocale;
  
  if (locale && locales.includes(locale as AppLocale)) {
    validLocale = locale as AppLocale;
  }

  const messages = (await import(`../messages/${validLocale}.json`)).default;

  return {
    locale: validLocale,
    messages,
  };
});


