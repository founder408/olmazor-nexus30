import ExcelJS from "exceljs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { addHakatonSheet, addIdeationSheet, addStartupSheet } from "@/lib/excel";
import type { EventKey } from "@/lib/constants";

export async function GET(_req: NextRequest, { params }: { params: { event: string } }) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const event = params.event as EventKey;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NEXUS30";
  workbook.created = new Date();

  if (event === "ideaton") {
    const apps = await prisma.ideationApplication.findMany({
      include: { participant: true, track: true, checkedInBy: true, checkedOutBy: true },
      orderBy: { createdAt: "desc" },
    });
    addIdeationSheet(workbook, apps);
  } else if (event === "hakaton") {
    const teams = await prisma.team.findMany({
      include: { track: true, members: true, checkedInBy: true, checkedOutBy: true },
      orderBy: { createdAt: "desc" },
    });
    addHakatonSheet(workbook, teams);
  } else if (event === "startup") {
    const apps = await prisma.startupApplication.findMany({
      include: {
        participant: true,
        team: { include: { members: true } },
        track: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
      orderBy: { createdAt: "desc" },
    });
    addStartupSheet(workbook, apps);
  } else {
    return NextResponse.json({ error: "Noto'g'ri event" }, { status: 400 });
  }

  await prisma.auditLog.create({
    data: { userId: user.id, action: "exported_excel", targetTable: event, targetId: "-" },
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="nexus30-${event}-${Date.now()}.xlsx"`,
    },
  });
}
