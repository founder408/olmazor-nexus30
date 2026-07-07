import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { z } from "zod";

const trackSchema = z.object({ name: z.string().trim().min(2).max(60) });

export async function POST(req: NextRequest) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Noto'g'ri nom" }, { status: 400 });

  const existing = await prisma.track.findUnique({ where: { name: parsed.data.name } });
  if (existing) return NextResponse.json({ error: "Bu trek allaqachon mavjud" }, { status: 409 });

  const track = await prisma.track.create({ data: { name: parsed.data.name } });
  return NextResponse.json({ track }, { status: 201 });
}
