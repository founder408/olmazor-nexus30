import { SiteHeader } from "@/components/site-header";
import { HakatonPublicRegistrationForm } from "@/components/forms/hakaton-team-form";
import { RegistrationClosedCard } from "@/components/registration-closed-card";
import { prisma } from "@/lib/prisma";
import { isRegistrationOpen, getRegistrationStatus } from "@/lib/registration-deadlines";

export const dynamic = "force-dynamic";

export default async function HakatonArizaPage() {
  const open = isRegistrationOpen("hakaton");
  const tracks = open ? await prisma.track.findMany({ orderBy: { name: "asc" } }) : [];
  const status = getRegistrationStatus("hakaton");

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        {open ? (
          <HakatonPublicRegistrationForm tracks={tracks} deadlineLabel={status.closesAtLabel} />
        ) : (
          <RegistrationClosedCard event="hakaton" />
        )}
      </main>
    </div>
  );
}
