import ExcelJS from "exceljs";
import { calculateAge } from "@/lib/validations";
import { STATUS_LABELS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const STATUS_FILL: Record<string, string> = {
  shortlisted: "FF2DD4BF",
  rejected: "FFF2555A",
  pending: "FFD4A94E",
};

const HEADER_FILL = "FF191D3A";

function styleHeaderRow(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFF5F6FA" } };
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle" };
  });
}

function styleStatusCell(cell: ExcelJS.Cell, status: string) {
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: STATUS_FILL[status] ?? "FFFFFFFF" },
  };
  cell.font = { color: { argb: "FF0B0E1F" }, bold: true };
}

type IdeationRow = Prisma.IdeationApplicationGetPayload<{
  include: { participant: true; track: true; checkedInBy: true; checkedOutBy: true };
}>;

export function addIdeationSheet(workbook: ExcelJS.Workbook, apps: IdeationRow[]) {
  const sheet = workbook.addWorksheet("Ideaton");
  sheet.columns = [
    { header: "Ism-Familya", key: "name", width: 26 },
    { header: "Telefon", key: "phone", width: 16 },
    { header: "Telegram", key: "telegram", width: 20 },
    { header: "Yosh", key: "age", width: 8 },
    { header: "Trek", key: "track", width: 20 },
    { header: "Motivatsiya", key: "motivation", width: 50 },
    { header: "Status", key: "status", width: 16 },
    { header: "Keldi vaqti", key: "checkedInAt", width: 20 },
    { header: "Keldi (volontyor)", key: "checkedInBy", width: 22 },
    { header: "Ketdi vaqti", key: "checkedOutAt", width: 20 },
    { header: "Ketdi (volontyor)", key: "checkedOutBy", width: 22 },
  ];
  styleHeaderRow(sheet.getRow(1));

  for (const app of apps) {
    const row = sheet.addRow({
      name: app.participant.fullName,
      phone: app.participant.phone,
      telegram: app.participant.telegramUsername,
      age: calculateAge(app.participant.birthDate),
      track: app.track.name,
      motivation: app.motivationText,
      status: STATUS_LABELS[app.status],
      checkedInAt: app.checkedInAt ? app.checkedInAt.toLocaleString("uz-UZ") : "",
      checkedInBy: app.checkedInBy?.fullName ?? "",
      checkedOutAt: app.checkedOutAt ? app.checkedOutAt.toLocaleString("uz-UZ") : "",
      checkedOutBy: app.checkedOutBy?.fullName ?? "",
    });
    styleStatusCell(row.getCell("status"), app.status);
    if (!app.participant.ageValid) {
      row.getCell("age").font = { color: { argb: "FFF2555A" }, bold: true };
    }
  }

  sheet.autoFilter = { from: "A1", to: "K1" };
  return sheet;
}

type HakatonRow = Prisma.TeamGetPayload<{
  include: { track: true; members: true; checkedInBy: true; checkedOutBy: true };
}>;

export function addHakatonSheet(workbook: ExcelJS.Workbook, teams: HakatonRow[]) {
  const sheet = workbook.addWorksheet("Hakaton");
  sheet.columns = [
    { header: "Jamoa nomi", key: "team", width: 24 },
    { header: "Trek", key: "track", width: 20 },
    { header: "A'zolar soni", key: "memberCount", width: 12 },
    { header: "A'zolar", key: "members", width: 55 },
    { header: "GitHub", key: "github", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Keldi vaqti", key: "checkedInAt", width: 20 },
    { header: "Keldi (volontyor)", key: "checkedInBy", width: 22 },
    { header: "Ketdi vaqti", key: "checkedOutAt", width: 20 },
    { header: "Ketdi (volontyor)", key: "checkedOutBy", width: 22 },
  ];
  styleHeaderRow(sheet.getRow(1));

  for (const team of teams) {
    const row = sheet.addRow({
      team: team.teamName,
      track: team.track.name,
      memberCount: team.members.length,
      members: team.members
        .map((m) => `${m.fullName} (${m.phone}, ${m.telegramUsername})`)
        .join("; "),
      github: team.githubOrgUsername ?? "",
      status: STATUS_LABELS[team.status],
      checkedInAt: team.checkedInAt ? team.checkedInAt.toLocaleString("uz-UZ") : "",
      checkedInBy: team.checkedInBy?.fullName ?? "",
      checkedOutAt: team.checkedOutAt ? team.checkedOutAt.toLocaleString("uz-UZ") : "",
      checkedOutBy: team.checkedOutBy?.fullName ?? "",
    });
    styleStatusCell(row.getCell("status"), team.status);
  }

  sheet.autoFilter = { from: "A1", to: "J1" };
  return sheet;
}

type StartupRow = Prisma.StartupApplicationGetPayload<{
  include: {
    participant: true;
    team: { include: { members: true } };
    track: true;
    checkedInBy: true;
    checkedOutBy: true;
  };
}>;

export function addStartupSheet(workbook: ExcelJS.Workbook, apps: StartupRow[]) {
  const sheet = workbook.addWorksheet("Startup");
  sheet.columns = [
    { header: "Ism / Jamoa", key: "name", width: 26 },
    { header: "Telefon", key: "phone", width: 16 },
    { header: "Telegram", key: "telegram", width: 20 },
    { header: "G'oya", key: "idea", width: 50 },
    { header: "Pitch deck", key: "pitchDeck", width: 30 },
    { header: "Prototip", key: "prototype", width: 30 },
    { header: "Sotuv bormi", key: "hasSales", width: 12 },
    { header: "Daromad", key: "revenue", width: 14 },
    { header: "Foydalanuvchilar", key: "users", width: 16 },
    { header: "Trek", key: "track", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Keldi vaqti", key: "checkedInAt", width: 20 },
    { header: "Keldi (volontyor)", key: "checkedInBy", width: 22 },
    { header: "Ketdi vaqti", key: "checkedOutAt", width: 20 },
    { header: "Ketdi (volontyor)", key: "checkedOutBy", width: 22 },
  ];
  styleHeaderRow(sheet.getRow(1));

  for (const app of apps) {
    const name = app.participant?.fullName ?? app.team?.teamName ?? "Noma'lum";
    const phone = app.participant?.phone ?? app.team?.members[0]?.phone ?? "";
    const telegram =
      app.participant?.telegramUsername ?? app.team?.members[0]?.telegramUsername ?? "";
    const row = sheet.addRow({
      name,
      phone,
      telegram,
      idea: app.ideaDescription,
      pitchDeck: app.pitchDeckLink,
      prototype: app.prototypeLink ?? "",
      hasSales: app.hasSales ? "Ha" : "Yo'q",
      revenue: app.revenueAmount ? Number(app.revenueAmount) : "",
      users: app.userCount ?? "",
      track: app.track.name,
      status: STATUS_LABELS[app.status],
      checkedInAt: app.checkedInAt ? app.checkedInAt.toLocaleString("uz-UZ") : "",
      checkedInBy: app.checkedInBy?.fullName ?? "",
      checkedOutAt: app.checkedOutAt ? app.checkedOutAt.toLocaleString("uz-UZ") : "",
      checkedOutBy: app.checkedOutBy?.fullName ?? "",
    });
    styleStatusCell(row.getCell("status"), app.status);
  }

  sheet.autoFilter = { from: "A1", to: "O1" };
  return sheet;
}
