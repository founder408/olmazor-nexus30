import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  try {
    await prisma.track.delete({ where: { id: params.id } });
  } catch {
    return NextResponse.json(
      { error: "Trekni o'chirib bo'lmadi — unga bog'langan arizalar mavjud" },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
