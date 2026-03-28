import { redirect } from "next/navigation";

export default async function AffiliateGradingRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/reviewer/grading`);
}
