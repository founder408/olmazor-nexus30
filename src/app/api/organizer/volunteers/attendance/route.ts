import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { volunteerAttendanceActionSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = volunteerAttendanceActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }
  const { volunteerId, event, action } = parsed.data;

  const volunteer = await prisma.user.findUnique({ where: { id: volunteerId } });
  if (!volunteer || volunteer.role !== "volunteer") {
    return NextResponse.json({ error: "Volontyor topilmadi" }, { status: 404 });
  }

  const existing = await prisma.volunteerAttendance.findUnique({
    where: { volunteerId_event: { volunteerId, event } },
  });

  if (action === "checkin") {
    if (existing?.checkedInAt) {
      return NextResponse.json({ error: "Allaqachon keldi deb belgilangan" }, { status: 400 });
    }
    await prisma.volunteerAttendance.upsert({
      where: { volunteerId_event: { volunteerId, event } },
      update: { checkedInAt: new Date(), recordedById: user.id },
      create: { volunteerId, event, checkedInAt: new Date(), recordedById: user.id },
    });
  } else {
    if (!existing?.checkedInAt) {
      return NextResponse.json(
        { error: "Avval keldi deb belgilanishi kerak" },
        { status: 400 }
      );
    }
    if (existing.checkedOutAt) {
      return NextResponse.json({ error: "Allaqachon ketdi deb belgilangan" }, { status: 400 });
    }
    await prisma.volunteerAttendance.update({
      where: { volunteerId_event: { volunteerId, event } },
      data: { checkedOutAt: new Date(), recordedById: user.id },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: action === "checkout" ? "volunteer_checked_out" : "volunteer_checked_in",
      targetTable: "volunteer_attendance",
      targetId: volunteerId,
      metadata: { event },
    },
  });

  return NextResponse.json({ success: true });
}
