import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submissionSubmitSchema } from "@/lib/validations";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export type PublicSubmissionWindow = {
  id: string;
  event: "ideaton" | "hakaton";
  title: string;
  closesAt: string;
  closedEarly: boolean;
  isOpen: boolean;
};

function isWindowOpen(window: { closesAt: Date; closedEarly: boolean }) {
  return !window.closedEarly && window.closesAt.getTime() > Date.now();
}

/** Public — fetch deadline window info + open/closed status. */
export async function GET(_req: NextRequest, { params }: { params: { token: string } }) {
  const window = await prisma.submissionWindow.findUnique({ where: { token: params.token } });
  if (!window) return NextResponse.json({ error: "Havola topilmadi" }, { status: 404 });

  const payload: PublicSubmissionWindow = {
    id: window.id,
    event: window.event,
    title: window.title,
    closesAt: window.closesAt.toISOString(),
    closedEarly: window.closedEarly,
    isOpen: isWindowOpen(window),
  };
  return NextResponse.json({ window: payload });
}

/** Public — submit (or update) a link + description for the given participant/team. */
export async function POST(req: NextRequest, { params }: { params: { token: string } }) {
  const ip = getClientIp(req.headers);
  const { allowed } = rateLimit(`submission:${ip}`, 15, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Juda ko'p urinish. Iltimos, bir necha daqiqadan so'ng qayta urinib ko'ring." },
      { status: 429 }
    );
  }

  const window = await prisma.submissionWindow.findUnique({ where: { token: params.token } });
  if (!window) return NextResponse.json({ error: "Havola topilmadi" }, { status: 404 });
  if (!isWindowOpen(window)) {
    return NextResponse.json({ error: "Yuklash muddati tugagan" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submissionSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
      { status: 400 }
    );
  }
  const { targetId, link, description } = parsed.data;

  try {
    if (window.event === "ideaton") {
      const app = await prisma.ideationApplication.findUnique({ where: { id: targetId } });
      if (!app || app.status !== "shortlisted") {
        return NextResponse.json({ error: "Ishtirokchi topilmadi" }, { status: 404 });
      }
      await prisma.submission.upsert({
        where: {
          submissionWindowId_ideationApplicationId: {
            submissionWindowId: window.id,
            ideationApplicationId: targetId,
          },
        },
        update: { link, description },
        create: {
          submissionWindowId: window.id,
          ideationApplicationId: targetId,
          link,
          description,
        },
      });
    } else {
      const team = await prisma.team.findUnique({ where: { id: targetId } });
      if (!team || team.status !== "shortlisted") {
        return NextResponse.json({ error: "Jamoa topilmadi" }, { status: 404 });
      }
      await prisma.submission.upsert({
        where: {
          submissionWindowId_teamId: { submissionWindowId: window.id, teamId: targetId },
        },
        update: { link, description },
        create: { submissionWindowId: window.id, teamId: targetId, link, description },
      });
    }
  } catch {
    return NextResponse.json({ error: "Yuborishda xatolik yuz berdi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
