import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HakatonTeamForm } from "@/components/forms/hakaton-team-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HakatonTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const team = await prisma.team.findUnique({
    where: { inviteToken: params.token },
    include: { track: true },
  });

  if (!team) return notFound();

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        {team.formSubmitted ? (
          <Card className="mx-auto max-w-xl p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-accent-gold" />
            <h1 className="mt-4 font-display text-xl font-bold text-text-primary">
              Ariza allaqachon yuborilgan
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Bu jamoa uchun Hakaton arizasi allaqachon to'ldirilgan. Savollar bo'lsa
              tashkilotchilarga murojaat qiling.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link href="/">Bosh sahifaga qaytish</Link>
            </Button>
          </Card>
        ) : (
          <HakatonTeamForm
            token={params.token}
            trackName={team.track.name}
            defaultTeamName={team.teamName}
          />
        )}
      </main>
    </div>
  );
}
