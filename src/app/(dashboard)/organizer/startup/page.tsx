import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/tables/applications-table";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";

export const dynamic = "force-dynamic";

export default async function OrganizerStartupPage() {
  const [apps, tracks] = await Promise.all([
    prisma.startupApplication.findMany({
      include: { participant: true, team: { include: { members: true } }, track: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: OrganizerRow[] = apps.map((a) => ({
    id: a.id,
    displayName: a.participant?.fullName ?? a.team?.teamName ?? "Noma'lum",
    phone: a.participant?.phone ?? a.team?.members[0]?.phone ?? "—",
    telegramUsername:
      a.participant?.telegramUsername ?? a.team?.members[0]?.telegramUsername ?? "—",
    trackName: a.track.name,
    status: a.status,
    checkedIn: a.checkedIn,
    checkedInAt: a.checkedInAt?.toISOString() ?? null,
    checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
    ageValid: a.participant?.ageValid ?? true,
    hasSales: a.hasSales,
  }));

  return <ApplicationsTable event="startup" initialRows={rows} tracks={tracks} />;
}
