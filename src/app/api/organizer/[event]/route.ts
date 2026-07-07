import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { nanoid } from "nanoid";
import type { EventKey } from "@/lib/constants";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE } from "@/lib/constants";
import {
  ideationApplicationAdminSchema,
  hakatonTeamAdminSchema,
  startupApplicationAdminSchema,
  isAgeValid,
} from "@/lib/validations";

export type OrganizerRow = {
  id: string;
  displayName: string;
  phone: string;
  telegramUsername: string;
  trackName: string;
  status: "pending" | "shortlisted" | "rejected";
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  ageValid: boolean;
  memberCount?: number;
  hasSales?: boolean;
  inviteLink?: string;
};

export async function GET(_req: NextRequest, { params }: { params: { event: string } }) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;

  if (event === "ideaton") {
    const apps = await prisma.ideationApplication.findMany({
      include: { participant: true, track: true },
      orderBy: { createdAt: "desc" },
    });
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
    return NextResponse.json({ rows });
  }

  if (event === "hakaton") {
    const teams = await prisma.team.findMany({
      include: { track: true, members: true },
      orderBy: { createdAt: "desc" },
    });
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
    return NextResponse.json({ rows });
  }

  const apps = await prisma.startupApplication.findMany({
    include: { participant: true, team: { include: { members: true } }, track: true },
    orderBy: { createdAt: "desc" },
  });
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
  return NextResponse.json({ rows });
}

/**
 * Organizer/Admin creates a new application by hand (e.g. paper sign-ups).
 * - Hakaton with no `members` in the body: creates a team shell + shareable
 *   invite link (legacy flow, team fills details themselves later).
 * - Hakaton with `members`: creates a fully-filled team directly.
 * - Ideaton/Startup: always creates a fully-filled application directly.
 */
export async function POST(req: NextRequest, { params }: { params: { event: string } }) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;
  const body = await req.json().catch(() => null);

  if (event === "hakaton" && !(body && Array.isArray(body.members))) {
    const teamName = (body?.teamName as string)?.trim() || "Nomsiz jamoa";
    const trackId = body?.trackId as string | undefined;
    const originIdeationAppId = body?.originIdeationAppId as string | undefined;

    if (!trackId) {
      return NextResponse.json({ error: "Yo'nalishni tanlang" }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: {
        teamName,
        trackId,
        source: originIdeationAppId ? "from_ideation" : "manual",
        originIdeationAppId: originIdeationAppId || null,
        inviteToken: nanoid(16),
      },
    });

    await prisma.auditLog.create({
      data: { userId: user.id, action: "team_created", targetTable: "teams", targetId: team.id },
    });

    return NextResponse.json(
      { success: true, id: team.id, inviteLink: `/hakaton/ariza/${team.inviteToken}` },
      { status: 201 }
    );
  }

  try {
    if (event === "ideaton") {
      const parsed = ideationApplicationAdminSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
          { status: 400 }
        );
      }
      const data = parsed.data;

      const existing = await prisma.participant.findUnique({
        where: { phone: data.phone },
        include: { ideationApplication: true },
      });
      if (existing?.ideationApplication) {
        return NextResponse.json(
          { error: "Bu telefon raqami bilan Ideaton arizasi allaqachon mavjud" },
          { status: 409 }
        );
      }

      const settings = await prisma.setting.findUnique({ where: { id: 1 } });
      const birthDate = new Date(data.birthDate);
      const ageValid = isAgeValid(birthDate, settings?.minAge ?? DEFAULT_MIN_AGE, settings?.maxAge ?? DEFAULT_MAX_AGE);

      const participant = await prisma.participant.upsert({
        where: { phone: data.phone },
        update: { fullName: data.fullName, telegramUsername: data.telegramUsername, birthDate, ageValid },
        create: {
          fullName: data.fullName,
          phone: data.phone,
          telegramUsername: data.telegramUsername,
          birthDate,
          ageValid,
        },
      });

      const application = await prisma.ideationApplication.create({
        data: {
          participantId: participant.id,
          motivationText: data.motivationText,
          experienceText: data.experienceText || null,
          trackId: data.trackId,
          timeConfirmed: data.timeConfirmed,
          status: data.status ?? "pending",
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "application_created",
          targetTable: "ideaton",
          targetId: application.id,
        },
      });

      return NextResponse.json({ success: true, id: application.id }, { status: 201 });
    }

    if (event === "hakaton") {
      const parsed = hakatonTeamAdminSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
          { status: 400 }
        );
      }
      const data = parsed.data;

      const team = await prisma.team.create({
        data: {
          teamName: data.teamName,
          trackId: data.trackId,
          githubOrgUsername: data.githubOrgUsername || null,
          motivation: data.motivation,
          source: "manual",
          formSubmitted: true,
          inviteToken: nanoid(16),
          status: data.status ?? "pending",
          members: {
            create: data.members.map((m) => ({
              fullName: m.fullName,
              phone: m.phone,
              telegramUsername: m.telegramUsername,
              domain: m.domain,
              skills: m.skills,
            })),
          },
        },
      });

      await prisma.auditLog.create({
        data: { userId: user.id, action: "application_created", targetTable: "hakaton", targetId: team.id },
      });

      return NextResponse.json({ success: true, id: team.id }, { status: 201 });
    }

    const parsed = startupApplicationAdminSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existingParticipant = await prisma.participant.findUnique({ where: { phone: data.phone } });
    const participant = await prisma.participant.upsert({
      where: { phone: data.phone },
      update: { fullName: data.fullName, telegramUsername: data.telegramUsername },
      create: {
        fullName: data.fullName,
        phone: data.phone,
        telegramUsername: data.telegramUsername,
        birthDate: existingParticipant?.birthDate ?? new Date(),
        ageValid: existingParticipant?.ageValid ?? true,
      },
    });

    const application = await prisma.startupApplication.create({
      data: {
        participantId: participant.id,
        ideaDescription: data.ideaDescription,
        pitchDeckLink: data.pitchDeckLink,
        prototypeLink: data.prototypeLink || null,
        hasSales: data.hasSales,
        revenueAmount: data.hasSales ? data.revenueAmount ?? null : null,
        userCount: data.hasSales ? data.userCount ?? null : null,
        trackId: data.trackId,
        status: data.status ?? "pending",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "application_created",
        targetTable: "startup",
        targetId: application.id,
      },
    });

    return NextResponse.json({ success: true, id: application.id }, { status: 201 });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ error: "Bu telefon raqami allaqachon mavjud" }, { status: 409 });
    }
    return NextResponse.json({ error: "Yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}
