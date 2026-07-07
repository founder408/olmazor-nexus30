/** O'zbekiston vaqti (Toshkent) */
export const REGISTRATION_TIMEZONE = "Asia/Tashkent";

export type RegistrationEvent = "ideaton" | "hakaton" | "startup";

/** Ideaton: 14-iyul 00:00 · Startup: 16-iyul 00:00 · Hakaton: cheklovsiz (token orqali) */
const DEFAULT_DEADLINES: Record<"ideaton" | "startup", string> = {
  ideaton: "2026-07-14T00:00:00+05:00",
  startup: "2026-07-16T00:00:00+05:00",
};

function getDeadlineIso(event: "ideaton" | "startup"): string {
  if (event === "ideaton") {
    return process.env.REGISTRATION_IDEATON_CLOSES_AT ?? DEFAULT_DEADLINES.ideaton;
  }
  return process.env.REGISTRATION_STARTUP_CLOSES_AT ?? DEFAULT_DEADLINES.startup;
}

export function getRegistrationDeadline(event: RegistrationEvent): Date | null {
  if (event === "hakaton") return null;
  return new Date(getDeadlineIso(event));
}

export function isRegistrationOpen(event: RegistrationEvent, now = new Date()): boolean {
  const deadline = getRegistrationDeadline(event);
  if (!deadline) return true;
  return now.getTime() < deadline.getTime();
}

export function formatDeadlineUz(iso: Date): string {
  return new Intl.DateTimeFormat("uz-UZ", {
    timeZone: REGISTRATION_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(iso);
}

export function getRegistrationStatus(event: RegistrationEvent) {
  const deadline = getRegistrationDeadline(event);
  const open = isRegistrationOpen(event);
  return {
    open,
    closesAt: deadline?.toISOString() ?? null,
    closesAtLabel: deadline ? formatDeadlineUz(deadline) : null,
  };
}

export function registrationClosedMessage(event: RegistrationEvent): string {
  const { closesAtLabel } = getRegistrationStatus(event);
  if (event === "ideaton") {
    return closesAtLabel
      ? `Ideaton uchun ariza qabuli ${closesAtLabel} (Toshkent vaqti) da yopildi.`
      : "Ideaton uchun ariza qabuli yopildi.";
  }
  if (event === "hakaton") {
    return closesAtLabel
      ? `Hakaton uchun ariza qabuli ${closesAtLabel} (Toshkent vaqti) da yopildi.`
      : "Hakaton uchun ariza qabuli yopildi.";
  }
  return closesAtLabel
    ? `AI Startup Kuni uchun ariza qabuli ${closesAtLabel} (Toshkent vaqti) da yopildi.`
    : "AI Startup Kuni uchun ariza qabuli yopildi.";
}
