import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import type { EventKey } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const user = await requireRole(["volunteer", "organizer", "admin"]);
  if (!user) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const event = body?.event as EventKey | undefined;
  const id = body?.id as string | undefined;
  const action = (body?.action as "checkin" | "checkout" | undefined) ?? "checkin";
  if (!event || !id) {
    return NextResponse.json({ error: "Noto'g'ri so'rov" }, { status: 400 });
  }

  const checkInData = {
    checkedIn: true,
    checkedInAt: new Date(),
    checkedInById: user.id,
  };
  const checkOutData = {
    checkedOutAt: new Date(),
    checkedOutById: user.id,
  };

  try {
    if (event === "ideaton") {
      const app = await prisma.ideationApplication.findUnique({ where: { id } });
      if (!app) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
      if (app.status !== "shortlisted") {
        return NextResponse.json(
          { error: "Faqat saralangan ishtirokchini belgilash mumkin" },
          { status: 400 }
        );
      }
      if (action === "checkout") {
        if (!app.checkedIn) {
          return NextResponse.json(
            { error: "Avval keldi deb belgilanishi kerak" },
            { status: 400 }
          );
        }
        if (app.checkedOutAt) {
          return NextResponse.json({ error: "Allaqachon ketdi deb belgilangan" }, { status: 400 });
        }
        await prisma.ideationApplication.update({ where: { id }, data: checkOutData });
      } else {
        if (app.checkedIn) {
          return NextResponse.json({ error: "Allaqachon keldi deb belgilangan" }, { status: 400 });
        }
        await prisma.ideationApplication.update({ where: { id }, data: checkInData });
      }
    } else if (event === "hakaton") {
      const team = await prisma.team.findUnique({ where: { id } });
      if (!team) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
      if (team.status !== "shortlisted") {
        return NextResponse.json(
          { error: "Faqat saralangan jamoani belgilash mumkin" },
          { status: 400 }
        );
      }
      if (action === "checkout") {
        if (!team.checkedIn) {
          return NextResponse.json(
            { error: "Avval keldi deb belgilanishi kerak" },
            { status: 400 }
          );
        }
        if (team.checkedOutAt) {
          return NextResponse.json({ error: "Allaqachon ketdi deb belgilangan" }, { status: 400 });
        }
        await prisma.team.update({ where: { id }, data: checkOutData });
      } else {
        if (team.checkedIn) {
          return NextResponse.json({ error: "Allaqachon keldi deb belgilangan" }, { status: 400 });
        }
        await prisma.team.update({ where: { id }, data: checkInData });
      }
    } else {
      const app = await prisma.startupApplication.findUnique({ where: { id } });
      if (!app) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
      if (app.status !== "shortlisted") {
        return NextResponse.json(
          { error: "Faqat saralangan arizani belgilash mumkin" },
          { status: 400 }
        );
      }
      if (action === "checkout") {
        if (!app.checkedIn) {
          return NextResponse.json(
            { error: "Avval keldi deb belgilanishi kerak" },
            { status: 400 }
          );
        }
        if (app.checkedOutAt) {
          return NextResponse.json({ error: "Allaqachon ketdi deb belgilangan" }, { status: 400 });
        }
        await prisma.startupApplication.update({ where: { id }, data: checkOutData });
      } else {
        if (app.checkedIn) {
          return NextResponse.json({ error: "Allaqachon keldi deb belgilangan" }, { status: 400 });
        }
        await prisma.startupApplication.update({ where: { id }, data: checkInData });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: action === "checkout" ? "checked_out" : "checked_in",
        targetTable: event,
        targetId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
