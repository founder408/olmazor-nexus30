"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle2, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EVENT_LABELS, STATUS_LABELS, type EventKey } from "@/lib/constants";
import type { CheckinResult } from "@/app/api/checkin/search/route";

export default function VolunteerCheckinPage() {
  const [event, setEvent] = useState<EventKey>("ideaton");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CheckinResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const search = useCallback(async (ev: EventKey, q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/search?event=${ev}&q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.results ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(event, query), 250);
    return () => clearTimeout(t);
  }, [event, query, search]);

  async function markAction(item: CheckinResult, action: "checkin" | "checkout") {
    setMarkingId(item.id);
    try {
      const res = await fetch("/api/checkin/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: item.event, id: item.id, action }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      const now = new Date().toISOString();
      if (action === "checkout") {
        toast.success(`${item.displayName} — ketdi deb belgilandi`);
        setResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, checkedOutAt: now } : r))
        );
      } else {
        toast.success(`${item.displayName} — keldi deb belgilandi`);
        setResults((prev) =>
          prev.map((r) => (r.id === item.id ? { ...r, checkedIn: true, checkedInAt: now } : r))
        );
      }
    } finally {
      setMarkingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Check-in paneli
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Eventni tanlang, ism/telefon/telegram bo'yicha qidiring va kelganlarni belgilang.
      </p>

      <Tabs
        value={event}
        onValueChange={(v) => setEvent(v as EventKey)}
        className="mt-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          {(Object.keys(EVENT_LABELS) as EventKey[]).map((key) => (
            <TabsTrigger key={key} value={key} className="h-14 text-base">
              {EVENT_LABELS[key]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ism, telefon yoki telegram bo'yicha qidiring..."
          className="h-16 rounded-2xl pl-12 text-base"
          autoFocus
        />
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="flex justify-center py-10 text-text-muted">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loading && results.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            {query
              ? "Hech narsa topilmadi. Boshqa kalit so'z bilan qidirib ko'ring."
              : "Qidiruv natijalari shu yerda ko'rinadi."}
          </p>
        )}

        {!loading &&
          results.map((item) => (
            <Card
              key={item.id}
              className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-text-primary">
                    {item.displayName}
                    {item.memberCount ? (
                      <span className="ml-1.5 font-mono text-xs text-text-muted">
                        ({item.memberCount} a'zo)
                      </span>
                    ) : null}
                  </p>
                  <Badge variant={item.status as "pending" | "shortlisted" | "rejected"}>
                    {STATUS_LABELS[item.status]}
                  </Badge>
                </div>
                <p className="mt-1 truncate font-mono text-sm text-text-muted">
                  {item.trackName} · {item.phone} · {item.telegramUsername}
                </p>
              </div>

              {item.checkedOutAt ? (
                <Badge variant="outline" className="h-14 flex-shrink-0 px-4 text-sm sm:h-auto">
                  Yakunlangan (Keldi ✓ · Ketdi ✓)
                </Badge>
              ) : !item.checkedIn ? (
                <Button
                  size="xl"
                  variant="success"
                  disabled={markingId === item.id || item.status !== "shortlisted"}
                  onClick={() => markAction(item, "checkin")}
                  className="min-h-[56px] w-full flex-shrink-0 gap-2 sm:w-auto"
                >
                  {markingId === item.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Keldi
                </Button>
              ) : (
                <Button
                  size="xl"
                  variant="destructive"
                  disabled={markingId === item.id}
                  onClick={() => markAction(item, "checkout")}
                  className="min-h-[56px] w-full flex-shrink-0 gap-2 sm:w-auto"
                >
                  {markingId === item.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                  Ketdi
                </Button>
              )}
            </Card>
          ))}
      </div>
    </div>
  );
}
