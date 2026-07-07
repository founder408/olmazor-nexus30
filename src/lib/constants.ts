export const TRACK_NAMES = [
  "Tibbiyot",
  "Ta'lim",
  "Turizm",
  "Davlat Boshqaruvi",
  "Fintech",
] as const;

export const STARTUP_TRACK_NAMES = [...TRACK_NAMES, "Boshqa"] as const;

export const DEFAULT_MIN_AGE = 14;
export const DEFAULT_MAX_AGE = 30;

export const AGE_RANGE_LABEL = `${DEFAULT_MIN_AGE}–${DEFAULT_MAX_AGE} yosh`;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda",
  shortlisted: "Saralangan",
  rejected: "Rad etilgan",
};

export const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "status-pending",
  shortlisted: "status-shortlisted",
  rejected: "status-rejected",
};

export const ROLE_LABELS: Record<string, string> = {
  volunteer: "Volontyor",
  organizer: "Tashkilotchi",
  admin: "Admin",
};

export type EventKey = "ideaton" | "hakaton" | "startup";

export const EVENT_LABELS: Record<EventKey, string> = {
  ideaton: "Ideaton",
  hakaton: "Hakaton",
  startup: "AI Startup Kuni",
};

/** Tadbir kunlari (Toshkent vaqti) */
export const EVENT_DATES: Record<EventKey, { iso: string; label: string }> = {
  ideaton: { iso: "2026-07-16", label: "16-iyul" },
  hakaton: { iso: "2026-07-17", label: "17-iyul" },
  startup: { iso: "2026-07-18", label: "18-iyul" },
};

export const EVENT_DATE_RANGE_LABEL = "16–18 iyul, 2026";

/** Rasmiy NEXUS30 Telegram kanali */
export const TELEGRAM_CHANNEL_URL = "https://t.me/nexus30uz";
export const TELEGRAM_CHANNEL_HANDLE = "@nexus30uz";
