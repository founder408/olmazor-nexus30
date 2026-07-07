import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { hakatonPublicRegistrationSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { isRegistrationOpen, registrationClosedMessage } from "@/lib/registration-deadlines";

export async function POST(req: NextRequest) {
  if (!isRegistrationOpen("hakaton")) {
    return NextResponse.json({ error: registrationClosedMessage("hakaton") }, { status: 403 });
  }

  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`hakaton-public:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = hakatonPublicRegistrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const phones = data.members.map((m) => m.phone.trim());

  const duplicateName = await prisma.team.findFirst({
    where: {
      teamName: { equals: data.teamName.trim(), mode: "insensitive" },
      formSubmitted: true,
    },
  });
  if (duplicateName) {
    return NextResponse.json(
      { error: "Bu nomdagi jamoa allaqachon ro'yxatdan o'tgan" },
      { status: 409 }
    );
  }

  const duplicateMember = await prisma.teamMember.findFirst({
    where: {
      phone: { in: phones },
      team: { formSubmitted: true },
    },
    select: { phone: true },
  });
  if (duplicateMember) {
    return NextResponse.json(
      {
        error: `${duplicateMember.phone} raqami boshqa Hakaton jamoasida allaqachon ro'yxatdan o'tgan`,
      },
      { status: 409 }
    );
  }

  const track = await prisma.track.findUnique({ where: { id: data.trackId } });
  if (!track) {
    return NextResponse.json({ error: "Yo'nalish topilmadi" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      teamName: data.teamName.trim(),
      trackId: data.trackId,
      githubOrgUsername: data.githubOrgUsername?.trim() || null,
      motivation: data.motivation.trim(),
      source: "manual",
      formSubmitted: true,
      status: "pending",
      inviteToken: nanoid(16),
      members: {
        create: data.members.map((m) => ({
          fullName: m.fullName.trim(),
          phone: m.phone.trim(),
          telegramUsername: m.telegramUsername.trim(),
          domain: m.domain.trim(),
          skills: m.skills.trim(),
        })),
      },
    },
  });

  return NextResponse.json({ success: true, id: team.id }, { status: 201 });
}
