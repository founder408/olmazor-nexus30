"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Clock, Loader2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/field-shell";
import { EVENT_LABELS, type EventKey } from "@/lib/constants";
import type { PublicSubmissionWindow } from "@/app/api/submissions/[token]/route";
import type { SubmissionSearchResult } from "@/app/api/submissions/[token]/search/route";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Muddat tugadi";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days}k`);
  parts.push(`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
  return parts.join(" ");
}

export default function PublicSubmissionPage({ params }: { params: { token: string } }) {
  const [window_, setWindow] = useState<PublicSubmissionWindow | null>(null);
  const [loadingWindow, setLoadingWindow] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubmissionSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SubmissionSearchResult | null>(null);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOk, setSubmittedOk] = useState(false);

  useEffect(() => {
    fetch(`/api/submissions/${params.token}`)
      .then((res) => res.json())
      .then((json) => setWindow(json.window ?? null))
      .finally(() => setLoadingWindow(false));
  }, [params.token]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(
          `/api/submissions/${params.token}/search?q=${encodeURIComponent(q)}`
        );
        const json = await res.json();
        setResults(json.results ?? []);
      } finally {
        setSearching(false);
      }
    },
    [params.token]
  );

  useEffect(() => {
    const t = setTimeout(() => search(query), 250);
    return () => clearTimeout(t);
  }, [query, search]);

  function selectResult(item: SubmissionSearchResult) {
    setSelected(item);
    setLink(item.existingLink ?? "");
    setDescription(item.existingDescription ?? "");
    setSubmittedOk(false);
  }

  async function submit() {
    if (!selected) return;
    if (!link.trim() || !description.trim()) {
      toast.error("Link va tavsifni to'ldiring");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/submissions/${params.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: selected.targetId, link, description }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      toast.success("Yuborildi!");
      setSubmittedOk(true);
      setResults((prev) =>
        prev.map((r) =>
          r.targetId === selected.targetId
            ? { ...r, alreadySubmitted: true, existingLink: link, existingDescription: description }
            : r
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  const isOpen = window_?.isOpen ?? false;
  const remainingMs = window_ ? new Date(window_.closesAt).getTime() - now : 0;

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        {loadingWindow && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        )}

        {!loadingWindow && !window_ && (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-danger" />
            <h1 className="mt-4 font-display text-xl font-bold text-text-primary">
              Havola topilmadi
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Link noto&apos;g&apos;ri yoki muddati tugagan bo&apos;lishi mumkin.
            </p>
          </Card>
        )}

        {!loadingWindow && window_ && (
          <>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-accent-teal">
                {EVENT_LABELS[window_.event as EventKey]}
              </div>
              <h1 className="mt-2 font-display text-2xl font-bold text-text-primary">
                {window_.title}
              </h1>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Clock className="h-5 w-5 flex-shrink-0 text-accent-gold" />
                {isOpen ? (
                  <p className="font-mono text-sm text-text-primary">
                    Qolgan vaqt: <span className="font-semibold">{formatRemaining(remainingMs)}</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-danger">
                    Yuklash muddati tugagan{window_.closedEarly ? " (muddatidan oldin yopilgan)" : ""}
                  </p>
                )}
              </div>
            </Card>

            {isOpen && (
              <Card className="mt-4 p-6 sm:p-8">
                {!selected ? (
                  <>
                    <p className="text-sm font-medium text-text-primary">
                      O&apos;zingizni toping
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      Telefon raqamingiz{window_.event === "hakaton" ? " yoki jamoa nomingiz" : ""}{" "}
                      orqali qidiring.
                    </p>
                    <div className="relative mt-4">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
                      <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                          window_.event === "hakaton" ? "Jamoa nomi yoki telefon" : "Telefon raqam"
                        }
                        className="h-14 rounded-2xl pl-12 text-base"
                        autoFocus
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {searching && (
                        <div className="flex justify-center py-6 text-text-muted">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      )}
                      {!searching && query.trim().length >= 2 && results.length === 0 && (
                        <p className="py-4 text-center text-sm text-text-muted">
                          Hech narsa topilmadi.
                        </p>
                      )}
                      {!searching &&
                        results.map((r) => (
                          <button
                            key={r.targetId}
                            onClick={() => selectResult(r)}
                            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-colors hover:bg-white/[0.05]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-text-primary">
                                {r.displayName}
                              </p>
                              <p className="truncate font-mono text-xs text-text-muted">
                                {r.trackName} · {r.phone}
                              </p>
                            </div>
                            {r.alreadySubmitted && (
                              <span className="ml-3 flex-shrink-0 rounded-full bg-accent-teal/15 px-2.5 py-0.5 text-[10px] font-medium text-accent-teal">
                                Yuborilgan
                              </span>
                            )}
                          </button>
                        ))}
                    </div>
                  </>
                ) : submittedOk ? (
                  <div className="text-center">
                    <CheckCircle2 className="mx-auto h-10 w-10 text-accent-teal" />
                    <h2 className="mt-4 font-display text-lg font-bold text-text-primary">
                      Yuborildi!
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                      {selected.displayName} uchun taqdimot muvaffaqiyatli qabul qilindi.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-6 gap-1.5"
                      onClick={() => {
                        setSelected(null);
                        setQuery("");
                        setResults([]);
                      }}
                    >
                      Boshqa ishtirokchi/jamoa uchun yuborish
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-text-primary">
                          {selected.displayName}
                        </p>
                        <p className="truncate font-mono text-xs text-text-muted">
                          {selected.trackName} · {selected.phone}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                        O&apos;zgartirish
                      </Button>
                    </div>

                    <div className="mt-5 space-y-4">
                      <FieldShell
                        label="Taqdimot/ish linki"
                        hint="Google Slides / Drive / GitHub / Figma"
                      >
                        <Input
                          placeholder="https://..."
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                        />
                      </FieldShell>
                      <FieldShell label="Qisqa tavsif">
                        <Textarea
                          rows={4}
                          placeholder="Nima qildingiz, qanday yechim taklif qildingiz..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </FieldShell>
                      {selected.existingLink && (
                        <p className="flex items-center gap-1.5 text-xs text-text-muted">
                          <ExternalLink className="h-3.5 w-3.5" />
                          Avval yuborilgan — qayta yuborsangiz eskisi yangilanadi.
                        </p>
                      )}
                      <Button
                        onClick={submit}
                        disabled={submitting}
                        size="lg"
                        className="w-full gap-1.5"
                      >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Yuborish
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
