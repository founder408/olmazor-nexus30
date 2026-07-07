import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/tables/applications-table";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";

export const dynamic = "force-dynamic";

export default async function OrganizerIdeatonPage() {
  const [apps, tracks] = await Promise.all([
    prisma.ideationApplication.findMany({
      include: { participant: true, track: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: OrganizerRow[] = apps.map((a) => ({
    id: a.id,
    displayName: a.participant.fullName,
    phone: a.participant.phone,
    telegramUsername: a.participant.telegramUsername,
    trackName: a.track.name,
    status: a.status,
    checkedIn: a.checkedIn,
    checkedInAt: a.checkedInAt?.toISOString() ?? null,
    checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    ageValid: a.participant.ageValid,
  }));

  return <ApplicationsTable event="ideaton" initialRows={rows} tracks={tracks} />;
}
