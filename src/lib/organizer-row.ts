import type { ApplicationDetail } from "@/app/api/organizer/[event]/[id]/route";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";

/** Maps the full application detail payload down to the flat row shape used by the table. */
export function detailToRow(detail: ApplicationDetail): OrganizerRow {
  return {
    id: detail.id,
    displayName: detail.displayName,
    phone: detail.phone ?? detail.members?.[0]?.phone ?? "—",
    telegramUsername: detail.telegramUsername ?? detail.members?.[0]?.telegramUsername ?? "—",
    trackName: detail.trackName,
    status: detail.status,
    checkedIn: detail.checkedIn,
    checkedInAt: detail.checkedInAt,
    checkedOutAt: detail.checkedOutAt,
    createdAt: detail.createdAt,
    ageValid: detail.ageValid ?? true,
    memberCount: detail.members?.length,
    hasSales: detail.hasSales,
    inviteLink: detail.inviteLink,
  };
}
