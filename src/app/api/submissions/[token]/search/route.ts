import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type SubmissionSearchResult = {
  targetId: string;
  displayName: string;
  phone: string;
  telegramUsername: string;
  trackName: string;
  alreadySubmitted: boolean;
  existingLink?: string;
  existingDescription?: string;
};

/** Public, unauthenticated search scoped to shortlisted entries for the window's event. */
export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const window = await prisma.submissionWindow.findUnique({ where: { token: params.token } });
  if (!window) return NextResponse.json({ error: "Havola topilmadi" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  let results: SubmissionSearchResult[] = [];

  if (window.event === "ideaton") {
    const apps = await prisma.ideationApplication.findMany({
      where: {
        status: "shortlisted",
        participant: {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ],
        },
      },
      include: {
        participant: true,
        track: true,
        submissions: { where: { submissionWindowId: window.id } },
      },
      take: 20,
    });
    results = apps.map((a) => ({
      targetId: a.id,
      displayName: a.participant.fullName,
      phone: a.participant.phone,
      telegramUsername: a.participant.telegramUsername,
      trackName: a.track.name,
      alreadySubmitted: a.submissions.length > 0,
      existingLink: a.submissions[0]?.link,
      existingDescription: a.submissions[0]?.description,
    }));
  } else {
    const teams = await prisma.team.findMany({
      where: {
        status: "shortlisted",
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
      include: {
        track: true,
        members: true,
        submissions: { where: { submissionWindowId: window.id } },
      },
      take: 20,
    });
    results = teams.map((t) => ({
      targetId: t.id,
      displayName: t.teamName,
      phone: t.members[0]?.phone ?? "",
      telegramUsername: t.members[0]?.telegramUsername ?? "",
      trackName: t.track.name,
      alreadySubmitted: t.submissions.length > 0,
      existingLink: t.submissions[0]?.link,
      existingDescription: t.submissions[0]?.description,
    }));
  }

  return NextResponse.json({ results });
}
