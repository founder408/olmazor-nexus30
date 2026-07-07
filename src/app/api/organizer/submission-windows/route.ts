import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export type OrganizerSubmissionWindowRow = {
  id: string;
  event: "ideaton" | "hakaton";
  title: string;
  closesAt: string;
  closedEarly: boolean;
  isOpen: boolean;
  submissionCount: number;
  reviewedCount: number;
};

export async function GET() {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const windows = await prisma.submissionWindow.findMany({
    include: { submissions: true },
    orderBy: { createdAt: "desc" },
  });

  const rows: OrganizerSubmissionWindowRow[] = windows.map((w) => ({
    id: w.id,
    event: w.event,
    title: w.title,
    closesAt: w.closesAt.toISOString(),
    closedEarly: w.closedEarly,
    isOpen: !w.closedEarly && w.closesAt.getTime() > Date.now(),
    submissionCount: w.submissions.length,
    reviewedCount: w.submissions.filter((s) => s.reviewed).length,
  }));

  return NextResponse.json({ rows });
}
