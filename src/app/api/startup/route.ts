import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startupApplicationSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`startup:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = startupApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  let track = await prisma.track.findUnique({ where: { name: data.trackName } });
  if (!track) {
    track = await prisma.track.create({ data: { name: data.trackName } });
  }

  const existingParticipant = await prisma.participant.findUnique({
    where: { phone: data.phone },
  });

  const participant = await prisma.participant.upsert({
    where: { phone: data.phone },
    update: {
      fullName: data.fullName,
      telegramUsername: data.telegramUsername,
    },
    create: {
      fullName: data.fullName,
      phone: data.phone,
      telegramUsername: data.telegramUsername,
      // Startup form has no birth date field per spec; default to a
      // neutral date so the shared age-validity flag doesn't block anyone.
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
      trackId: track.id,
    },
  });

  return NextResponse.json({ success: true, id: application.id }, { status: 201 });
}
