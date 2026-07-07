import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { submissionWindowSchema } from "@/lib/validations";

export type SubmissionWindowRow = {
  id: string;
  event: "ideaton" | "hakaton";
  title: string;
  token: string;
  closesAt: string;
  closedEarly: boolean;
  createdAt: string;
  createdByName: string;
  submissionCount: number;
};

export async function GET() {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const windows = await prisma.submissionWindow.findMany({
    include: { createdBy: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });

  const rows: SubmissionWindowRow[] = windows.map((w) => ({
    id: w.id,
    event: w.event,
    title: w.title,
    token: w.token,
    closesAt: w.closesAt.toISOString(),
    closedEarly: w.closedEarly,
    createdAt: w.createdAt.toISOString(),
    createdByName: w.createdBy.fullName,
    submissionCount: w._count.submissions,
  }));

  return NextResponse.json({ rows });
}

export async function POST(req: NextRequest) {
  const user = await requireRole(["admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = submissionWindowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const window = await prisma.submissionWindow.create({
    data: {
      event: data.event,
      title: data.title,
      closesAt: new Date(data.closesAt),
      createdById: user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "submission_window_created",
      targetTable: "submission_windows",
      targetId: window.id,
    },
  });

  return NextResponse.json(
    {
      success: true,
      row: {
        id: window.id,
        event: window.event,
        title: window.title,
        token: window.token,
        closesAt: window.closesAt.toISOString(),
        closedEarly: window.closedEarly,
        createdAt: window.createdAt.toISOString(),
        createdByName: user.name ?? "",
        submissionCount: 0,
      } satisfies SubmissionWindowRow,
    },
    { status: 201 }
  );
}
