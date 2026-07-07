import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

/** Admin closes a submission window early (before its scheduled `closesAt`). */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const closedEarly = Boolean(body?.closedEarly);

  try {
    await prisma.submissionWindow.update({
      where: { id: params.id },
      data: { closedEarly },
    });
  } catch {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: closedEarly ? "submission_window_closed_early" : "submission_window_reopened",
      targetTable: "submission_windows",
      targetId: params.id,
    },
  });

  return NextResponse.json({ success: true });
}
