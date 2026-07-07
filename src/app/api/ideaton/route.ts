import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ideationApplicationSchema, isAgeValid } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isRegistrationOpen, registrationClosedMessage } from "@/lib/registration-deadlines";

export async function POST(req: NextRequest) {
  if (!isRegistrationOpen("ideaton")) {
    return NextResponse.json({ error: registrationClosedMessage("ideaton") }, { status: 403 });
  }

  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`ideaton:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = ideationApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
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
      { error: "Bu telefon raqami bilan Ideaton arizasi allaqachon yuborilgan" },
      { status: 409 }
    );
  }

  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  const minAge = settings?.minAge ?? 17;
  const maxAge = settings?.maxAge ?? 25;
  const birthDate = new Date(data.birthDate);
  const ageValid = isAgeValid(birthDate, minAge, maxAge);

  const track = await prisma.track.findUnique({ where: { id: data.trackId } });
  if (!track) {
    return NextResponse.json({ error: "Yo'nalish topilmadi" }, { status: 400 });
  }

  const participant = await prisma.participant.upsert({
    where: { phone: data.phone },
    update: {
      fullName: data.fullName,
      telegramUsername: data.telegramUsername,
      birthDate,
      ageValid,
    },
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
    },
  });

  return NextResponse.json({ success: true, id: application.id }, { status: 201 });
}
