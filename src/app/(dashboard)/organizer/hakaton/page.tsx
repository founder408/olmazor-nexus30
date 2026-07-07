import { prisma } from "@/lib/prisma";
import { ApplicationsTable } from "@/components/tables/applications-table";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";

export const dynamic = "force-dynamic";

export default async function OrganizerHakatonPage() {
  const [teams, tracks] = await Promise.all([
    prisma.team.findMany({
      include: { track: true, members: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.track.findMany({ orderBy: { name: "asc" } }),
  ]);

  const rows: OrganizerRow[] = teams.map((t) => ({
    id: t.id,
    displayName: t.teamName,
    phone: t.members[0]?.phone ?? "—",
    telegramUsername: t.members[0]?.telegramUsername ?? "—",
    trackName: t.track.name,
    status: t.status,
    checkedIn: t.checkedIn,
    checkedInAt: t.checkedInAt?.toISOString() ?? null,
    checkedOutAt: t.checkedOutAt?.toISOString() ?? null,
    createdAt: t.createdAt.toISOString(),
    ageValid: true,
    memberCount: t.members.length,
    inviteLink: t.formSubmitted ? undefined : `/hakaton/ariza/${t.inviteToken}`,
  }));

  return <ApplicationsTable event="hakaton" initialRows={rows} tracks={tracks} />;
}
