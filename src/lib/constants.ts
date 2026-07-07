export const TRACK_NAMES = [
  "Tibbiyot",
  "Ta'lim",
  "Turizm",
  "Davlat Boshqaruvi",
  "Fintech",
] as const;

export const STARTUP_TRACK_NAMES = [...TRACK_NAMES, "Boshqa"] as const;

export const DEFAULT_MIN_AGE = 17;
export const DEFAULT_MAX_AGE = 25;

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

/** Rasmiy NEXUS30 Telegram kanali */
export const TELEGRAM_CHANNEL_URL = "https://t.me/nexus30uz";
export const TELEGRAM_CHANNEL_HANDLE = "@nexus30uz";
