import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  statusUpdateSchema,
  ideationApplicationAdminSchema,
  hakatonTeamAdminSchema,
  startupApplicationAdminSchema,
  isAgeValid,
} from "@/lib/validations";
import type { EventKey } from "@/lib/constants";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE } from "@/lib/constants";

export type ApplicationDetail = {
  event: EventKey;
  id: string;
  displayName: string;
  status: "pending" | "shortlisted" | "rejected";
  trackId: string;
  trackName: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  checkedInByName: string | null;
  checkedOutAt: string | null;
  checkedOutByName: string | null;
  createdAt: string;
  // ideaton
  fullName?: string;
  phone?: string;
  telegramUsername?: string;
  birthDate?: string;
  ageValid?: boolean;
  motivationText?: string;
  experienceText?: string | null;
  timeConfirmed?: boolean;
  // hakaton
  teamName?: string;
  githubOrgUsername?: string | null;
  motivation?: string | null;
  members?: { fullName: string; phone: string; telegramUsername: string; domain?: string | null; skills?: string | null }[];
  inviteLink?: string;
  formSubmitted?: boolean;
  // startup
  ideaDescription?: string;
  pitchDeckLink?: string;
  prototypeLink?: string | null;
  hasSales?: boolean;
  revenueAmount?: number | null;
  userCount?: number | null;
  identityEditable?: boolean;
};

async function loadDetail(event: EventKey, id: string): Promise<ApplicationDetail | null> {
  if (event === "ideaton") {
    const a = await prisma.ideationApplication.findUnique({
      where: { id },
      include: { participant: true, track: true, checkedInBy: true, checkedOutBy: true },
    });
    if (!a) return null;
    return {
      event,
      id: a.id,
      displayName: a.participant.fullName,
      status: a.status,
      trackId: a.trackId,
      trackName: a.track.name,
      checkedIn: a.checkedIn,
      checkedInAt: a.checkedInAt?.toISOString() ?? null,
      checkedInByName: a.checkedInBy?.fullName ?? null,
      checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
      checkedOutByName: a.checkedOutBy?.fullName ?? null,
      createdAt: a.createdAt.toISOString(),
      fullName: a.participant.fullName,
      phone: a.participant.phone,
      telegramUsername: a.participant.telegramUsername,
      birthDate: a.participant.birthDate.toISOString().slice(0, 10),
      ageValid: a.participant.ageValid,
      motivationText: a.motivationText,
      experienceText: a.experienceText,
      timeConfirmed: a.timeConfirmed,
    };
  }

  if (event === "hakaton") {
    const t = await prisma.team.findUnique({
      where: { id },
      include: { track: true, members: true, checkedInBy: true, checkedOutBy: true },
    });
    if (!t) return null;
    return {
      event,
      id: t.id,
      displayName: t.teamName,
      status: t.status,
      trackId: t.trackId,
      trackName: t.track.name,
      checkedIn: t.checkedIn,
      checkedInAt: t.checkedInAt?.toISOString() ?? null,
      checkedInByName: t.checkedInBy?.fullName ?? null,
      checkedOutAt: t.checkedOutAt?.toISOString() ?? null,
      checkedOutByName: t.checkedOutBy?.fullName ?? null,
      createdAt: t.createdAt.toISOString(),
      teamName: t.teamName,
      githubOrgUsername: t.githubOrgUsername,
      motivation: t.motivation,
      members: t.members.map((m) => ({
        fullName: m.fullName,
        phone: m.phone,
        telegramUsername: m.telegramUsername,
        domain: m.domain,
        skills: m.skills,
      })),
      inviteLink: t.formSubmitted ? undefined : `/hakaton/ariza/${t.inviteToken}`,
      formSubmitted: t.formSubmitted,
    };
  }

  const a = await prisma.startupApplication.findUnique({
    where: { id },
    include: {
      participant: true,
      team: { include: { members: true } },
      track: true,
      checkedInBy: true,
      checkedOutBy: true,
    },
  });
  if (!a) return null;
  return {
    event,
    id: a.id,
    displayName: a.participant?.fullName ?? a.team?.teamName ?? "Noma'lum",
    status: a.status,
    trackId: a.trackId,
    trackName: a.track.name,
    checkedIn: a.checkedIn,
    checkedInAt: a.checkedInAt?.toISOString() ?? null,
    checkedInByName: a.checkedInBy?.fullName ?? null,
    checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
    checkedOutByName: a.checkedOutBy?.fullName ?? null,
    createdAt: a.createdAt.toISOString(),
    fullName: a.participant?.fullName ?? a.team?.members[0]?.fullName ?? "",
    phone: a.participant?.phone ?? a.team?.members[0]?.phone ?? "",
    telegramUsername:
      a.participant?.telegramUsername ?? a.team?.members[0]?.telegramUsername ?? "",
    ideaDescription: a.ideaDescription,
    pitchDeckLink: a.pitchDeckLink,
    prototypeLink: a.prototypeLink,
    hasSales: a.hasSales,
    revenueAmount: a.revenueAmount ? Number(a.revenueAmount) : null,
    userCount: a.userCount,
    identityEditable: Boolean(a.participantId),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { event: string; id: string } }
) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const detail = await loadDetail(params.event as EventKey, params.id);
  if (!detail) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json({ detail });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { event: string; id: string } }
) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;
  const body = await req.json().catch(() => null);
  const parsed = statusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 });
  }

  const { status } = parsed.data;

  try {
    if (event === "ideaton") {
      await prisma.ideationApplication.update({ where: { id: params.id }, data: { status } });
    } else if (event === "hakaton") {
      await prisma.team.update({ where: { id: params.id }, data: { status } });
    } else {
      await prisma.startupApplication.update({ where: { id: params.id }, data: { status } });
    }
  } catch {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "status_changed",
      targetTable: event,
      targetId: params.id,
      metadata: { status },
    },
  });

  return NextResponse.json({ success: true });
}

/** Full edit of an application's details (organizer + admin). */
export async function PUT(
  req: NextRequest,
  { params }: { params: { event: string; id: string } }
) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;
  const body = await req.json().catch(() => null);

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
      const existing = await prisma.ideationApplication.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

      const settings = await prisma.setting.findUnique({ where: { id: 1 } });
      const birthDate = new Date(data.birthDate);
      const ageValid = isAgeValid(birthDate, settings?.minAge ?? DEFAULT_MIN_AGE, settings?.maxAge ?? DEFAULT_MAX_AGE);

      await prisma.$transaction([
        prisma.participant.update({
          where: { id: existing.participantId },
          data: {
            fullName: data.fullName,
            phone: data.phone,
            telegramUsername: data.telegramUsername,
            birthDate,
            ageValid,
          },
        }),
        prisma.ideationApplication.update({
          where: { id: params.id },
          data: {
            motivationText: data.motivationText,
            experienceText: data.experienceText || null,
            trackId: data.trackId,
            timeConfirmed: data.timeConfirmed,
            ...(data.status ? { status: data.status } : {}),
          },
        }),
      ]);
    } else if (event === "hakaton") {
      const parsed = hakatonTeamAdminSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
          { status: 400 }
        );
      }
      const data = parsed.data;
      const existing = await prisma.team.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

      await prisma.$transaction([
        prisma.team.update({
          where: { id: params.id },
          data: {
            teamName: data.teamName,
            trackId: data.trackId,
            githubOrgUsername: data.githubOrgUsername || null,
            motivation: data.motivation,
            formSubmitted: true,
            ...(data.status ? { status: data.status } : {}),
          },
        }),
        prisma.teamMember.deleteMany({ where: { teamId: params.id } }),
        prisma.teamMember.createMany({
          data: data.members.map((m) => ({
            teamId: params.id,
            fullName: m.fullName,
            phone: m.phone,
            telegramUsername: m.telegramUsername,
            domain: m.domain,
            skills: m.skills,
          })),
        }),
      ]);
    } else {
      const parsed = startupApplicationAdminSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
          { status: 400 }
        );
      }
      const data = parsed.data;
      const existing = await prisma.startupApplication.findUnique({ where: { id: params.id } });
      if (!existing) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

      const updateApplication = prisma.startupApplication.update({
        where: { id: params.id },
        data: {
          ideaDescription: data.ideaDescription,
          pitchDeckLink: data.pitchDeckLink,
          prototypeLink: data.prototypeLink || null,
          hasSales: data.hasSales,
          revenueAmount: data.hasSales ? data.revenueAmount ?? null : null,
          userCount: data.hasSales ? data.userCount ?? null : null,
          trackId: data.trackId,
          ...(data.status ? { status: data.status } : {}),
        },
      });

      if (existing.participantId) {
        await prisma.$transaction([
          updateApplication,
          prisma.participant.update({
            where: { id: existing.participantId },
            data: {
              fullName: data.fullName,
              phone: data.phone,
              telegramUsername: data.telegramUsername,
            },
          }),
        ]);
      } else {
        await updateApplication;
      }
    }
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Bu telefon raqami boshqa ishtirokchida band" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Saqlashda xatolik yuz berdi" }, { status: 500 });
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: "application_edited", targetTable: event, targetId: params.id },
  });

  const detail = await loadDetail(event, params.id);
  return NextResponse.json({ success: true, detail });
}

/** Full deletion of an application record — admin only. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { event: string; id: string } }
) {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;

  try {
    if (event === "ideaton") {
      await prisma.ideationApplication.delete({ where: { id: params.id } });
    } else if (event === "hakaton") {
      await prisma.team.delete({ where: { id: params.id } });
    } else {
      await prisma.startupApplication.delete({ where: { id: params.id } });
    }
  } catch {
    return NextResponse.json(
      {
        error:
          "O'chirib bo'lmadi. Ariza bilan bog'liq boshqa ma'lumotlar mavjud (masalan, undan yaratilgan jamoa).",
      },
      { status: 409 }
    );
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: "application_deleted", targetTable: event, targetId: params.id },
  });

  return NextResponse.json({ success: true });
}
