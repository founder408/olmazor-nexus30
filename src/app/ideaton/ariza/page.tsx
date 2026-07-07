import { SiteHeader } from "@/components/site-header";
import { IdeationForm } from "@/components/forms/ideation-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function IdeatonArizaPage() {
  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6 sm:py-16">
        <IdeationForm tracks={tracks} />
      </main>
    </div>
  );
}
