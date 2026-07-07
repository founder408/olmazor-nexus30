import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { addHakatonSheet, addIdeationSheet, addStartupSheet } from "@/lib/excel";

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NEXUS30";
  workbook.created = new Date();

  const [ideationApps, teams, startupApps] = await Promise.all([
    prisma.ideationApplication.findMany({
      include: { participant: true, track: true, checkedInBy: true, checkedOutBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.team.findMany({
      include: { track: true, members: true, checkedInBy: true, checkedOutBy: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.startupApplication.findMany({
      include: {
        participant: true,
        team: { include: { members: true } },
        track: true,
        checkedInBy: true,
        checkedOutBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  addIdeationSheet(workbook, ideationApps);
  addHakatonSheet(workbook, teams);
  addStartupSheet(workbook, startupApps);

  await prisma.auditLog.create({
    data: { userId: user.id, action: "exported_excel", targetTable: "all", targetId: "-" },
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="nexus30-full-export-${Date.now()}.xlsx"`,
    },
  });
}
