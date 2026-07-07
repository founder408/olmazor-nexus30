import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { submissionReviewSchema } from "@/lib/validations";

export type SubmissionRow = {
  id: string;
  displayName: string;
  phone: string;
  telegramUsername: string;
  trackName: string;
  link: string;
  description: string;
  reviewed: boolean;
  reviewNote: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  submittedAt: string;
};

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const window = await prisma.submissionWindow.findUnique({
    where: { id: params.id },
    include: {
      submissions: {
        include: {
          ideationApplication: { include: { participant: true, track: true } },
          team: { include: { members: true, track: true } },
          reviewedBy: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });
  if (!window) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });

  const rows: SubmissionRow[] = window.submissions.map((s) => {
    const displayName = s.ideationApplication?.participant.fullName ?? s.team?.teamName ?? "Noma'lum";
    const phone = s.ideationApplication?.participant.phone ?? s.team?.members[0]?.phone ?? "—";
    const telegramUsername =
      s.ideationApplication?.participant.telegramUsername ??
      s.team?.members[0]?.telegramUsername ??
      "—";
    const trackName = s.ideationApplication?.track.name ?? s.team?.track.name ?? "—";
    return {
      id: s.id,
      displayName,
      phone,
      telegramUsername,
      trackName,
      link: s.link,
      description: s.description,
      reviewed: s.reviewed,
      reviewNote: s.reviewNote,
      reviewedByName: s.reviewedBy?.fullName ?? null,
      reviewedAt: s.reviewedAt?.toISOString() ?? null,
      submittedAt: s.submittedAt.toISOString(),
    };
  });

  return NextResponse.json({
    window: {
      id: window.id,
      event: window.event,
      title: window.title,
      closesAt: window.closesAt.toISOString(),
      closedEarly: window.closedEarly,
    },
    rows,
  });
}

/** Organizer/admin marks a specific submission reviewed + optional note. Uses submission id in body. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireRole(["organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const submissionId = body?.submissionId as string | undefined;
  if (!submissionId) return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });

  const parsed = submissionReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Ma'lumotlar noto'g'ri" },
      { status: 400 }
    );
  }
  const { reviewed, reviewNote } = parsed.data;

  try {
    await prisma.submission.update({
      where: { id: submissionId, submissionWindowId: params.id },
      data: {
        reviewed,
        reviewNote: reviewNote || null,
        reviewedById: reviewed ? user.id : null,
        reviewedAt: reviewed ? new Date() : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
