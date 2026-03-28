import { redirect } from "next/navigation";

export default async function AffiliateTeamGradingRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; teamId: string }>;
}) {
  const { locale, teamId } = await params;
  redirect(`/${locale}/reviewer/grading/${encodeURIComponent(teamId)}`);
}
