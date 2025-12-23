import { redirect } from "next/navigation";

export default async function LocaleIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Redirect /en and /fr to their localized login pages
  redirect(`/${locale}/login`);
}


