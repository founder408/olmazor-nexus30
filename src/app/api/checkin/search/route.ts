import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { EventKey } from "@/lib/constants";

export type CheckinResult = {
  id: string;
  event: EventKey;
  displayName: string;
  phone: string;
  telegramUsername: string;
  trackName: string;
  status: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  memberCount?: number;
};

export async function GET(req: NextRequest) {
  const user = await requireRole(["volunteer", "organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const event = (searchParams.get("event") ?? "ideaton") as EventKey;
  const q = (searchParams.get("q") ?? "").trim();

  let results: CheckinResult[] = [];

  if (event === "ideaton") {
    const apps = await prisma.ideationApplication.findMany({
      where: q
        ? {
            participant: {
              OR: [
                { fullName: { contains: q, mode: "insensitive" } },
                { phone: { contains: q, mode: "insensitive" } },
                { telegramUsername: { contains: q, mode: "insensitive" } },
              ],
            },
          }
        : undefined,
      include: { participant: true, track: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    results = apps.map((a) => ({
      id: a.id,
      event: "ideaton",
      displayName: a.participant.fullName,
      phone: a.participant.phone,
      telegramUsername: a.participant.telegramUsername,
      trackName: a.track.name,
      status: a.status,
      checkedIn: a.checkedIn,
      checkedInAt: a.checkedInAt?.toISOString() ?? null,
      checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
    }));
  } else if (event === "hakaton") {
    const teams = await prisma.team.findMany({
      where: q
        ? {
            OR: [
              { teamName: { contains: q, mode: "insensitive" } },
              {
                members: {
                  some: {
                    OR: [
                      { fullName: { contains: q, mode: "insensitive" } },
                      { phone: { contains: q, mode: "insensitive" } },
                      { telegramUsername: { contains: q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            ],
          }
        : undefined,
      include: { track: true, members: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    results = teams.map((t) => ({
      id: t.id,
      event: "hakaton",
      displayName: t.teamName,
      phone: t.members[0]?.phone ?? "",
      telegramUsername: t.members[0]?.telegramUsername ?? "",
      trackName: t.track.name,
      status: t.status,
      checkedIn: t.checkedIn,
      checkedInAt: t.checkedInAt?.toISOString() ?? null,
      checkedOutAt: t.checkedOutAt?.toISOString() ?? null,
      memberCount: t.members.length,
    }));
  } else {
    const apps = await prisma.startupApplication.findMany({
      where: q
        ? {
            OR: [
              {
                participant: {
                  OR: [
                    { fullName: { contains: q, mode: "insensitive" } },
                    { phone: { contains: q, mode: "insensitive" } },
                    { telegramUsername: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
              {
                team: {
                  OR: [
                    { teamName: { contains: q, mode: "insensitive" } },
                    {
                      members: {
                        some: {
                          OR: [
                            { fullName: { contains: q, mode: "insensitive" } },
                            { phone: { contains: q, mode: "insensitive" } },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            ],
          }
        : undefined,
      include: { participant: true, team: { include: { members: true } }, track: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    results = apps.map((a) => ({
      id: a.id,
      event: "startup",
      displayName: a.participant?.fullName ?? a.team?.teamName ?? "Noma'lum",
      phone: a.participant?.phone ?? a.team?.members[0]?.phone ?? "",
      telegramUsername: a.participant?.telegramUsername ?? a.team?.members[0]?.telegramUsername ?? "",
      trackName: a.track.name,
      status: a.status,
      checkedIn: a.checkedIn,
      checkedInAt: a.checkedInAt?.toISOString() ?? null,
      checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
    }));
  }

  return NextResponse.json({ results });
}
