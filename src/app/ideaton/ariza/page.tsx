import { SiteHeader } from "@/components/site-header";
import { IdeationForm } from "@/components/forms/ideation-form";
import { RegistrationClosedCard } from "@/components/registration-closed-card";
import { prisma } from "@/lib/prisma";
import { isRegistrationOpen, getRegistrationStatus } from "@/lib/registration-deadlines";

export const dynamic = "force-dynamic";

export default async function IdeatonArizaPage() {
  const open = isRegistrationOpen("ideaton");
  const tracks = open ? await prisma.track.findMany({ orderBy: { name: "asc" } }) : [];
  const status = getRegistrationStatus("ideaton");

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        {open ? (
          <IdeationForm tracks={tracks} deadlineLabel={status.closesAtLabel} />
        ) : (
          <RegistrationClosedCard event="ideaton" />
        )}
      </main>
    </div>
  );
}
