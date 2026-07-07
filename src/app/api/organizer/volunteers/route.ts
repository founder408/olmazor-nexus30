import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { EventKey } from "@/lib/constants";

export type VolunteerAttendanceInfo = {
  checkedInAt: string | null;
  checkedOutAt: string | null;
};

export type VolunteerRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  attendance: Record<EventKey, VolunteerAttendanceInfo>;
};

export async function GET() {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const volunteers = await prisma.user.findMany({
    where: { role: "volunteer" },
    include: { volunteerAttendance: true },
    orderBy: { fullName: "asc" },
  });

  const rows: VolunteerRow[] = volunteers.map((v) => {
    const attendance: Record<EventKey, VolunteerAttendanceInfo> = {
      ideaton: { checkedInAt: null, checkedOutAt: null },
      hakaton: { checkedInAt: null, checkedOutAt: null },
      startup: { checkedInAt: null, checkedOutAt: null },
    };
    for (const a of v.volunteerAttendance) {
      attendance[a.event as EventKey] = {
        checkedInAt: a.checkedInAt?.toISOString() ?? null,
        checkedOutAt: a.checkedOutAt?.toISOString() ?? null,
      };
    }
    return { id: v.id, fullName: v.fullName, email: v.email, phone: v.phone, attendance };
  });

  return NextResponse.json({ rows });
}
