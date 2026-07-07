import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { resetUserPasswordSchema } from "@/lib/validations";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["volunteer", "organizer", "admin"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Noto'g'ri ma'lumot" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role: parsed.data.role },
    select: { id: true, fullName: true, phone: true, email: true, role: true, createdAt: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "user_role_changed",
      targetTable: "users",
      targetId: user.id,
      metadata: { role: parsed.data.role },
    },
  });

  return NextResponse.json({ user });
}

/** Admin boshqa foydalanuvchi parolini tiklaydi */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = resetUserPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ma'lumotlar noto'g'ri", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.update({
    where: { id: params.id },
    data: { passwordHash },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "user_password_reset",
      targetTable: "users",
      targetId: params.id,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireRole(["admin"]);
  if (!admin) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  if (admin.id === params.id) {
    return NextResponse.json({ error: "O'zingizni o'chira olmaysiz" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: { userId: admin.id, action: "user_deleted", targetTable: "users", targetId: params.id },
  });

  return NextResponse.json({ success: true });
}
