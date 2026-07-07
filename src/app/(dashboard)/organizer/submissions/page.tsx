"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { OrganizerSubmissionWindowRow } from "@/app/api/organizer/submission-windows/route";

export default function OrganizerSubmissionsPage() {
  const [rows, setRows] = useState<OrganizerSubmissionWindowRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/organizer/submission-windows")
      .then((res) => res.json())
      .then((json) => setRows(json.rows ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Taqdimot deadline'lari
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Har bir deadline uchun kelgan taqdimot/ish yuklamalarini ko&apos;rib chiqing.
      </p>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            Hozircha deadline yaratilmagan. Admin panelidan yaratilishi mumkin.
          </p>
        )}
        {!loading &&
          rows.map((row) => (
            <Link key={row.id} href={`/organizer/submissions/${row.id}`}>
              <Card className="flex items-center justify-between gap-3 p-5 transition-colors hover:bg-white/[0.04]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text-primary">{row.title}</p>
                    <Badge variant="outline">{row.event === "ideaton" ? "Ideaton" : "Hakaton"}</Badge>
                    {row.isOpen ? (
                      <Badge variant="checkedIn">Ochiq</Badge>
                    ) : (
                      <Badge variant="rejected">Yopiq</Badge>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-text-muted">
                    Yopilish: {formatDateTime(row.closesAt)} · {row.reviewedCount}/{row.submissionCount} ko&apos;rib
                    chiqilgan
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-text-muted" />
              </Card>
            </Link>
          ))}
      </div>
    </div>
  );
}
