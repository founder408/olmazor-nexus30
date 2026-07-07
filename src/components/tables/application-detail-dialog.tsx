"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Pencil, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IdeationAdminForm } from "@/components/tables/ideation-admin-form";
import { HakatonAdminForm } from "@/components/tables/hakaton-admin-form";
import { StartupAdminForm } from "@/components/tables/startup-admin-form";
import { EVENT_LABELS, STATUS_LABELS, type EventKey } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";
import type { ApplicationDetail } from "@/app/api/organizer/[event]/[id]/route";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-white/5 py-2.5 text-sm last:border-0">
      <dt className="text-text-muted">{label}</dt>
      <dd className="col-span-2 text-text-primary">{value}</dd>
    </div>
  );
}

export function ApplicationDetailDialog({
  event,
  id,
  tracks,
  onUpdated,
  onDeleted,
}: {
  event: EventKey;
  id: string;
  tracks: { id: string; name: string }[];
  onUpdated: (row: OrganizerRow) => void;
  onDeleted: (id: string) => void;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? "volunteer";
  const isAdmin = role === "admin";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function loadDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizer/${event}/${id}`);
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Yuklashda xatolik");
        return;
      }
      setDetail(json.detail);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    setEditing(false);
    setConfirmingDelete(false);
    if (next) loadDetail();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/organizer/${event}/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "O'chirishda xatolik");
        return;
      }
      toast.success("Ariza o'chirildi");
      onDeleted(id);
      setOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => handleOpenChange(true)}
      >
        Batafsil
      </Button>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {EVENT_LABELS[event]} — {editing ? "tahrirlash" : "batafsil"}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}

        {!loading && detail && editing && (
          <>
            {event === "ideaton" && (
              <IdeationAdminForm
                mode="edit"
                id={id}
                tracks={tracks}
                initialData={detail}
                onSaved={(row) => {
                  onUpdated(row);
                  setEditing(false);
                  loadDetail();
                }}
                onCancel={() => setEditing(false)}
              />
            )}
            {event === "hakaton" && (
              <HakatonAdminForm
                mode="edit"
                id={id}
                tracks={tracks}
                initialData={detail}
                onSaved={(row) => {
                  onUpdated(row);
                  setEditing(false);
                  loadDetail();
                }}
                onCancel={() => setEditing(false)}
              />
            )}
            {event === "startup" && (
              <StartupAdminForm
                mode="edit"
                id={id}
                tracks={tracks}
                initialData={detail}
                onSaved={(row) => {
                  onUpdated(row);
                  setEditing(false);
                  loadDetail();
                }}
                onCancel={() => setEditing(false)}
              />
            )}
          </>
        )}

        {!loading && detail && !editing && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={detail.status}>{STATUS_LABELS[detail.status]}</Badge>
              {detail.checkedIn && <Badge variant="checkedIn">Keldi</Badge>}
              {detail.checkedOutAt && <Badge variant="outline">Ketdi</Badge>}
              {detail.ageValid === false && (
                <Badge variant="rejected">Yosh mos emas</Badge>
              )}
            </div>

            <dl className="mt-2">
              {event === "ideaton" && (
                <>
                  <DetailRow label="Ism-familya" value={detail.fullName} />
                  <DetailRow label="Telefon" value={<span className="font-mono">{detail.phone}</span>} />
                  <DetailRow
                    label="Telegram"
                    value={<span className="font-mono">{detail.telegramUsername}</span>}
                  />
                  <DetailRow label="Tug'ilgan sana" value={detail.birthDate} />
                  <DetailRow label="Yo'nalish" value={detail.trackName} />
                  <DetailRow label="Motivatsiya" value={<span className="whitespace-pre-wrap">{detail.motivationText}</span>} />
                  <DetailRow
                    label="Tajriba"
                    value={detail.experienceText ? <span className="whitespace-pre-wrap">{detail.experienceText}</span> : "—"}
                  />
                  <DetailRow label="3 kun tasdiqlagan" value={detail.timeConfirmed ? "Ha" : "Yo'q"} />
                </>
              )}

              {event === "hakaton" && (
                <>
                  <DetailRow label="Jamoa nomi" value={detail.teamName} />
                  <DetailRow label="Yo'nalish" value={detail.trackName} />
                  <DetailRow label="GitHub" value={detail.githubOrgUsername || "—"} />
                  <DetailRow
                    label="Motivatsiya"
                    value={
                      detail.motivation ? (
                        <span className="whitespace-pre-wrap">{detail.motivation}</span>
                      ) : (
                        "—"
                      )
                    }
                  />
                  <DetailRow
                    label="A'zolar"
                    value={
                      detail.members && detail.members.length > 0 ? (
                        <ul className="space-y-2.5">
                          {detail.members.map((m, i) => (
                            <li
                              key={i}
                              className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-xs"
                            >
                              <div className="font-medium text-text-primary">{m.fullName}</div>
                              <div className="mt-0.5 font-mono text-text-muted">
                                {m.phone} — {m.telegramUsername}
                              </div>
                              {(m.domain || m.skills) && (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  {m.domain && (
                                    <span className="rounded-full bg-accent-teal/10 px-2 py-0.5 text-[11px] text-accent-teal">
                                      {m.domain}
                                    </span>
                                  )}
                                  {m.skills && (
                                    <span className="rounded-full bg-accent-violet/10 px-2 py-0.5 text-[11px] text-accent-violet">
                                      {m.skills}
                                    </span>
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "—"
                      )
                    }
                  />
                  {detail.inviteLink && (
                    <DetailRow
                      label="Taklif linki"
                      value={
                        <a
                          href={detail.inviteLink}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-accent-teal hover:underline"
                        >
                          {detail.inviteLink} <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  )}
                </>
              )}

              {event === "startup" && (
                <>
                  <DetailRow label="Ism / Jamoa" value={detail.displayName} />
                  <DetailRow label="Telefon" value={<span className="font-mono">{detail.phone}</span>} />
                  <DetailRow
                    label="Telegram"
                    value={<span className="font-mono">{detail.telegramUsername}</span>}
                  />
                  <DetailRow label="Yo'nalish" value={detail.trackName} />
                  <DetailRow
                    label="G'oya"
                    value={<span className="whitespace-pre-wrap">{detail.ideaDescription}</span>}
                  />
                  <DetailRow
                    label="Pitch deck"
                    value={
                      <a href={detail.pitchDeckLink} target="_blank" className="inline-flex items-center gap-1 text-accent-teal hover:underline">
                        Havolani ochish <ExternalLink className="h-3 w-3" />
                      </a>
                    }
                  />
                  {detail.prototypeLink && (
                    <DetailRow
                      label="Prototip"
                      value={
                        <a href={detail.prototypeLink} target="_blank" className="inline-flex items-center gap-1 text-accent-teal hover:underline">
                          Havolani ochish <ExternalLink className="h-3 w-3" />
                        </a>
                      }
                    />
                  )}
                  <DetailRow label="Sotuvi bormi" value={detail.hasSales ? "Ha" : "Yo'q"} />
                  {detail.hasSales && (
                    <>
                      <DetailRow label="Daromad" value={detail.revenueAmount ?? "—"} />
                      <DetailRow label="Foydalanuvchilar" value={detail.userCount ?? "—"} />
                    </>
                  )}
                </>
              )}

              <DetailRow label="Yuborilgan sana" value={formatDateTime(detail.createdAt)} />
              <DetailRow label="Keldi vaqti" value={formatDateTime(detail.checkedInAt)} />
              <DetailRow label="Ketdi vaqti" value={formatDateTime(detail.checkedOutAt)} />
            </dl>

            <DialogFooter className="mt-2">
              {isAdmin && (
                <div className="mr-auto">
                  {!confirmingDelete ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="gap-1.5 text-danger hover:bg-danger/10 hover:text-danger"
                      onClick={() => setConfirmingDelete(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      O'chirish
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Ishonchingiz komilmi?</span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setConfirmingDelete(false)}
                      >
                        Yo'q
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={deleting}
                        className="gap-1.5"
                        onClick={handleDelete}
                      >
                        {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Ha, o'chirish
                      </Button>
                    </div>
                  )}
                </div>
              )}
              <Button type="button" className="gap-1.5" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Tahrirlash
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
