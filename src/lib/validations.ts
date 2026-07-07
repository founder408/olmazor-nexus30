import { z } from "zod";
import { DEFAULT_MAX_AGE, DEFAULT_MIN_AGE, STARTUP_TRACK_NAMES, TRACK_NAMES } from "./constants";

/** Shared age-range validation used by all 3 forms (Ideaton/Hakaton/Startup). */
export function calculateAge(birthDate: Date, at: Date = new Date()): number {
  let age = at.getFullYear() - birthDate.getFullYear();
  const monthDiff = at.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAgeValid(
  birthDate: Date,
  minAge: number = DEFAULT_MIN_AGE,
  maxAge: number = DEFAULT_MAX_AGE
): boolean {
  const age = calculateAge(birthDate);
  return age >= minAge && age <= maxAge;
}

// +998 followed by 9 digits (Uzbekistan mobile format)
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+998\d{9}$/, "Telefon raqamni +998 bilan, 9 raqam qo'shib kiriting");

export const telegramSchema = z
  .string()
  .trim()
  .regex(/^@[A-Za-z0-9_]{4,32}$/, "Telegram username @ bilan boshlanishi kerak (masalan @ism)");

export const urlSchema = z
  .string()
  .trim()
  .url("To'g'ri link kiriting (https:// bilan boshlansin)");

export const birthDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Tug'ilgan sanani to'g'ri kiriting");

export const ideationApplicationSchema = z.object({
  fullName: z.string().trim().min(2, "Ism va familyani kiriting"),
  phone: phoneSchema,
  telegramUsername: telegramSchema,
  birthDate: birthDateSchema,
  motivationText: z
    .string()
    .trim()
    .min(50, "Kamida 50 belgi yozing")
    .max(500, "Ko'pi bilan 500 belgi"),
  experienceText: z.string().trim().max(1000).optional().or(z.literal("")),
  trackId: z.string().min(1, "Yo'nalishni tanlang"),
  timeConfirmed: z
    .boolean()
    .refine((v) => v === true, "3 kun qatnashishni tasdiqlang"),
});
export type IdeationApplicationInput = z.infer<typeof ideationApplicationSchema>;

/** Used by organizer/admin to create or edit an Ideaton application directly (e.g. paper sign-ups). */
export const ideationApplicationAdminSchema = ideationApplicationSchema.extend({
  status: z.enum(["pending", "shortlisted", "rejected"]).optional(),
});
export type IdeationApplicationAdminInput = z.infer<typeof ideationApplicationAdminSchema>;

export const teamMemberSchema = z.object({
  fullName: z.string().trim().min(2, "Ism va familyani kiriting"),
  phone: phoneSchema,
  telegramUsername: telegramSchema,
  domain: z.string().trim().min(2, "Sohasini kiriting (masalan: Frontend, Dizayn, Marketing)").max(80),
  skills: z.string().trim().min(2, "Ko'nikmalarini kiriting (masalan: React, Figma, SMM)").max(300),
});

export const hakatonTeamSchema = z.object({
  teamName: z.string().trim().min(2, "Jamoa nomini kiriting"),
  githubOrgUsername: z.string().trim().optional().or(z.literal("")),
  motivation: z
    .string()
    .trim()
    .min(50, "Kamida 50 belgi yozing")
    .max(800, "Ko'pi bilan 800 belgi"),
  members: z
    .array(teamMemberSchema)
    .min(3, "Kamida 3 ta a'zo bo'lishi kerak")
    .max(5, "Ko'pi bilan 5 ta a'zo"),
});
export type HakatonTeamInput = z.infer<typeof hakatonTeamSchema>;

/** Ochiq Hakaton ro'yxatdan o'tish (Ideatondan mustaqil qo'shimcha jamoalar) */
export const hakatonPublicRegistrationSchema = hakatonTeamSchema.extend({
  trackId: z.string().min(1, "Yo'nalishni tanlang"),
});
export type HakatonPublicRegistrationInput = z.infer<typeof hakatonPublicRegistrationSchema>;

/** Used by organizer/admin to create or edit a Hakaton team directly (trackId + optional status). */
export const hakatonTeamAdminSchema = hakatonTeamSchema.extend({
  trackId: z.string().min(1, "Yo'nalishni tanlang"),
  status: z.enum(["pending", "shortlisted", "rejected"]).optional(),
});
export type HakatonTeamAdminInput = z.infer<typeof hakatonTeamAdminSchema>;

const startupApplicationBaseSchema = z.object({
  fullName: z.string().trim().min(2, "Ism va familyani kiriting"),
  phone: phoneSchema,
  telegramUsername: telegramSchema,
  ideaDescription: z
    .string()
    .trim()
    .min(80, "Kamida 80 belgi yozing")
    .max(1500, "Ko'pi bilan 1500 belgi"),
  pitchDeckLink: urlSchema,
  prototypeLink: z.union([urlSchema, z.literal("")]).optional(),
  hasSales: z.boolean().default(false),
  revenueAmount: z.coerce.number().nonnegative().optional().nullable(),
  userCount: z.coerce.number().int().nonnegative().optional().nullable(),
});

function refineSalesFields<T extends { hasSales: boolean; revenueAmount?: number | null; userCount?: number | null }>(
  val: T,
  ctx: z.RefinementCtx
) {
  if (val.hasSales && (val.revenueAmount === undefined || val.revenueAmount === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Daromad miqdorini kiriting",
      path: ["revenueAmount"],
    });
  }
  if (val.hasSales && (val.userCount === undefined || val.userCount === null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Foydalanuvchilar sonini kiriting",
      path: ["userCount"],
    });
  }
}

export const startupApplicationSchema = startupApplicationBaseSchema
  .extend({ trackName: z.enum(STARTUP_TRACK_NAMES) })
  .superRefine(refineSalesFields);
export type StartupApplicationInput = z.infer<typeof startupApplicationSchema>;

/** Used by organizer/admin to create or edit a Startup application directly (trackId + optional status). */
export const startupApplicationAdminSchema = startupApplicationBaseSchema
  .extend({
    trackId: z.string().min(1, "Yo'nalishni tanlang"),
    status: z.enum(["pending", "shortlisted", "rejected"]).optional(),
  })
  .superRefine(refineSalesFields);
export type StartupApplicationAdminInput = z.infer<typeof startupApplicationAdminSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("To'g'ri email kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin"),
});

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: phoneSchema,
  email: z.string().trim().email(),
  password: z.string().min(6),
  role: z.enum(["volunteer", "organizer", "admin"]),
});

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Joriy parol kamida 6 belgidan iborat bo'lsin"),
    newPassword: z.string().min(6, "Yangi parol kamida 6 belgidan iborat bo'lsin"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Yangi parollar mos kelmayapti",
    path: ["confirmPassword"],
  });

export const resetUserPasswordSchema = z.object({
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lsin"),
});

export const settingsSchema = z.object({
  minAge: z.coerce.number().int().min(0).max(120),
  maxAge: z.coerce.number().int().min(0).max(120),
  eventName: z.string().trim().min(1),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["pending", "shortlisted", "rejected"]),
});

export const checkinActionSchema = z.object({
  event: z.enum(["ideaton", "hakaton", "startup"]),
  id: z.string().min(1),
  action: z.enum(["checkin", "checkout"]),
});

export const volunteerAttendanceActionSchema = z.object({
  volunteerId: z.string().min(1),
  event: z.enum(["ideaton", "hakaton", "startup"]),
  action: z.enum(["checkin", "checkout"]),
});

export const submissionWindowSchema = z.object({
  event: z.enum(["ideaton", "hakaton"]),
  title: z.string().trim().min(2, "Sarlavhani kiriting").max(120),
  closesAt: z
    .string()
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Yopilish vaqtini to'g'ri kiriting"),
});
export type SubmissionWindowInput = z.infer<typeof submissionWindowSchema>;

export const submissionSubmitSchema = z.object({
  targetId: z.string().min(1, "Ishtirokchi/jamoani tanlang"),
  link: urlSchema,
  description: z
    .string()
    .trim()
    .min(10, "Kamida 10 belgi yozing")
    .max(1000, "Ko'pi bilan 1000 belgi"),
});

export const submissionReviewSchema = z.object({
  reviewed: z.boolean(),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export { TRACK_NAMES };
