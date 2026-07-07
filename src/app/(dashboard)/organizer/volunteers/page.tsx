"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_LABELS, type EventKey } from "@/lib/constants";
import type { VolunteerRow } from "@/app/api/organizer/volunteers/route";

export default function OrganizerVolunteersPage() {
  const [event, setEvent] = useState<EventKey>("ideaton");
  const [rows, setRows] = useState<VolunteerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/organizer/volunteers");
      const json = await res.json();
      setRows(json.rows ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAction(volunteer: VolunteerRow, action: "checkin" | "checkout") {
    setMarkingId(volunteer.id);
    try {
      const res = await fetch("/api/organizer/volunteers/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ volunteerId: volunteer.id, event, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      const now = new Date().toISOString();
      setRows((prev) =>
        prev.map((r) =>
          r.id === volunteer.id
            ? {
                ...r,
                attendance: {
                  ...r.attendance,
                  [event]: {
                    checkedInAt: action === "checkin" ? now : r.attendance[event].checkedInAt,
                    checkedOutAt: action === "checkout" ? now : r.attendance[event].checkedOutAt,
                  },
                },
              }
            : r
        )
      );
      toast.success(
        `${volunteer.fullName} — ${action === "checkin" ? "keldi" : "ketdi"} deb belgilandi`
      );
    } finally {
      setMarkingId(null);
    }
  }

  function formatTime(iso: string | null) {
    if (!iso) return null;
    return new Intl.DateTimeFormat("uz-UZ", { hour: "2-digit", minute: "2-digit" }).format(
      new Date(iso)
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Volontyorlar davomati
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Har bir event uchun volontyorlarning keldi/ketdi vaqtini tashkilotchi belgilaydi.
      </p>

      <Tabs value={event} onValueChange={(v) => setEvent(v as EventKey)} className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(EVENT_LABELS) as EventKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="h-14 text-base">
              {EVENT_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="flex justify-center py-10 text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            Hozircha volontyor foydalanuvchilar yo&apos;q. Ularni Foydalanuvchilar bo&apos;limidan
            qo&apos;shing.
          </p>
        )}

        {!loading &&
          rows.map((v) => {
            const att = v.attendance[event];
            return (
              <Card
                key={v.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-primary">
                    {v.fullName}
                  </p>
                  <p className="mt-1 truncate font-mono text-sm text-text-muted">
                    {v.phone} · {v.email}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {att.checkedInAt && (
                      <Badge variant="checkedIn">Keldi {formatTime(att.checkedInAt)}</Badge>
                    )}
                    {att.checkedOutAt && (
                      <Badge variant="outline">Ketdi {formatTime(att.checkedOutAt)}</Badge>
                    )}
                  </div>
                </div>

                {!att.checkedInAt ? (
                  <Button
                    size="lg"
                    variant="success"
                    disabled={markingId === v.id}
                    onClick={() => markAction(v, "checkin")}
                    className="w-full flex-shrink-0 gap-2 sm:w-auto"
                  >
                    {markingId === v.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Keldi
                  </Button>
                ) : !att.checkedOutAt ? (
                  <Button
                    size="lg"
                    variant="destructive"
                    disabled={markingId === v.id}
                    onClick={() => markAction(v, "checkout")}
                    className="w-full flex-shrink-0 gap-2 sm:w-auto"
                  >
                    {markingId === v.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LogOut className="h-4 w-4" />
                    )}
                    Ketdi
                  </Button>
                ) : (
                  <Badge variant="outline" className="px-4 py-2 text-sm">
                    Yakunlangan
                  </Badge>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
