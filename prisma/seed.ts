import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE, TRACK_NAMES } from "../src/lib/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding tracks...");

  const legacyTrackNames: Record<string, string> = {
    EdTech: "Ta'lim",
    MedTech: "Tibbiyot",
    TourTech: "Turizm",
  };

  for (const [oldName, newName] of Object.entries(legacyTrackNames)) {
    const existing = await prisma.track.findUnique({ where: { name: oldName } });
    if (!existing) continue;

    const renamed = await prisma.track.findUnique({ where: { name: newName } });
    if (!renamed) {
      await prisma.track.update({
        where: { id: existing.id },
        data: { name: newName },
      });
    }
  }

  for (const name of TRACK_NAMES) {
    await prisma.track.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seeding default settings...");
  await prisma.setting.upsert({
    where: { id: 1 },
    update: { minAge: DEFAULT_MIN_AGE, maxAge: DEFAULT_MAX_AGE },
    create: { id: 1, minAge: DEFAULT_MIN_AGE, maxAge: DEFAULT_MAX_AGE, eventName: "NEXUS30" },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@nexus30.uz";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const adminName = process.env.SEED_ADMIN_NAME ?? "NEXUS30 Admin";

  console.log(`Seeding admin user (${adminEmail})...`);
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      fullName: adminName,
      phone: "+998900000000",
      email: adminEmail,
      passwordHash,
      role: "admin",
    },
  });

  console.log("Done. Admin login:", adminEmail, "/", adminPassword);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
