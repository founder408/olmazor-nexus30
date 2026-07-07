import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hakatonTeamSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`hakaton:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const team = await prisma.team.findUnique({ where: { inviteToken: params.token } });
  if (!team) {
    return NextResponse.json({ error: "Jamoa linki topilmadi" }, { status: 404 });
  }
  if (team.formSubmitted) {
    return NextResponse.json(
      { error: "Bu link orqali ariza allaqachon yuborilgan" },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = hakatonTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  await prisma.$transaction([
    prisma.team.update({
      where: { id: team.id },
      data: {
        teamName: data.teamName,
        githubOrgUsername: data.githubOrgUsername || null,
        formSubmitted: true,
      },
    }),
    prisma.teamMember.deleteMany({ where: { teamId: team.id } }),
    prisma.teamMember.createMany({
      data: data.members.map((m) => ({
        teamId: team.id,
        fullName: m.fullName,
        phone: m.phone,
        telegramUsername: m.telegramUsername,
      })),
    }),
  ]);

  return NextResponse.json({ success: true }, { status: 201 });
}
