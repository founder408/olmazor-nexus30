import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { settingsSchema } from "@/lib/validations";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  const tracks = await prisma.track.findMany({ orderBy: { name: "asc" } });

  return NextResponse.json({ settings, tracks });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.minAge > parsed.data.maxAge) {
    return NextResponse.json(
      { error: "Minimal yosh maksimaldan katta bo'lmasligi kerak" },
      { status: 400 }
    );
  }

  const settings = await prisma.setting.upsert({
    where: { id: 1 },
    update: parsed.data,
    create: { id: 1, ...parsed.data },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "settings_updated",
      targetTable: "settings",
      targetId: "1",
      metadata: parsed.data,
    },
  });

  return NextResponse.json({ settings });
}
