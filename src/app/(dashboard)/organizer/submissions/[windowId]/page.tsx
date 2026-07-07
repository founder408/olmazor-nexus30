"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_LABELS, type EventKey } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { SubmissionRow } from "@/app/api/organizer/submission-windows/[id]/submissions/route";

type WindowInfo = {
  id: string;
  event: EventKey;
  title: string;
  closesAt: string;
  closedEarly: boolean;
};

export default function OrganizerSubmissionWindowPage({
  params,
}: {
  params: { windowId: string };
}) {
  const [windowInfo, setWindowInfo] = useState<WindowInfo | null>(null);
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizer/submission-windows/${params.windowId}/submissions`);
      const json = await res.json();
      setWindowInfo(json.window ?? null);
      setRows(json.rows ?? []);
      setNotes(
        Object.fromEntries((json.rows ?? []).map((r: SubmissionRow) => [r.id, r.reviewNote ?? ""]))
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.windowId]);

  async function setReviewed(row: SubmissionRow, reviewed: boolean) {
    setSavingId(row.id);
    try {
      const res = await fetch(
        `/api/organizer/submission-windows/${params.windowId}/submissions`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            submissionId: row.id,
            reviewed,
            reviewNote: notes[row.id] ?? "",
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      toast.success(reviewed ? "Ko'rib chiqilgan deb belgilandi" : "Belgi bekor qilindi");
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, reviewed, reviewNote: notes[row.id] ?? null, reviewedAt: new Date().toISOString() }
            : r
        )
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {windowInfo && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
              {windowInfo.title}
            </h1>
            <Badge variant="outline">{EVENT_LABELS[windowInfo.event]}</Badge>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Yopilish: {formatDateTime(windowInfo.closesAt)} · {rows.length} ta yuklama
          </p>
        </>
      )}

      <div className="mt-6 space-y-4">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            Hali hech kim yuklamagan.
          </p>
        )}
        {!loading &&
          rows.map((row) => (
            <Card key={row.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{row.displayName}</p>
                    {row.reviewed && <Badge variant="checkedIn">Ko&apos;rib chiqilgan</Badge>}
                  </div>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    {row.trackName} · {row.phone} · {row.telegramUsername}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Yuborilgan: {formatDateTime(row.submittedAt)}
                    {row.reviewedByName && ` · Ko'rib chiqdi: ${row.reviewedByName}`}
                  </p>
                </div>
                <a
                  href={row.link}
                  target="_blank"
                  className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-accent-teal transition-colors hover:bg-white/5"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Havolani ochish
                </a>
              </div>

              <p className="mt-3 whitespace-pre-wrap rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm text-text-primary">
                {row.description}
              </p>

              <div className="mt-3 space-y-2">
                <Textarea
                  rows={2}
                  placeholder="Izoh qoldiring (ixtiyoriy)"
                  value={notes[row.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [row.id]: e.target.value }))}
                />
                <div className="flex justify-end gap-2">
                  {row.reviewed ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === row.id}
                      className="gap-1.5"
                      onClick={() => setReviewed(row, false)}
                    >
                      {savingId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Undo2 className="h-3.5 w-3.5" />
                      )}
                      Belgini bekor qilish
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={savingId === row.id}
                      className="gap-1.5"
                      onClick={() => setReviewed(row, true)}
                    >
                      {savingId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Ko&apos;rib chiqildi
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
}
