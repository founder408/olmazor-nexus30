"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Loader2, Lock, Unlock, Plus } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "@/components/forms/field-shell";
import { submissionWindowSchema, type SubmissionWindowInput } from "@/lib/validations";
import { formatDateTime } from "@/lib/format";
import type { SubmissionWindowRow } from "@/app/api/admin/submission-windows/route";

export default function AdminSubmissionsPage() {
  const [rows, setRows] = useState<SubmissionWindowRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionWindowInput>({
    resolver: zodResolver(submissionWindowSchema),
    defaultValues: { event: "ideaton", title: "", closesAt: "" },
  });

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/submission-windows");
      const json = await res.json();
      setRows(json.rows ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(values: SubmissionWindowInput) {
    setSubmitting(true);
    try {
      // `datetime-local` values have no timezone; interpret them in the
      // browser's own local time (the admin's time) before sending as UTC ISO.
      const closesAtIso = new Date(values.closesAt).toISOString();
      const res = await fetch("/api/admin/submission-windows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, closesAt: closesAtIso }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      setRows((prev) => [json.row, ...prev]);
      toast.success("Deadline yaratildi");
      reset({ event: "ideaton", title: "", closesAt: "" });
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleClosed(row: SubmissionWindowRow) {
    setTogglingId(row.id);
    try {
      const res = await fetch(`/api/admin/submission-windows/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closedEarly: !row.closedEarly }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, closedEarly: !r.closedEarly } : r))
      );
      toast.success(!row.closedEarly ? "Muddat yopildi" : "Muddat qayta ochildi");
    } finally {
      setTogglingId(null);
    }
  }

  function copyLink(token: string) {
    const url = `${window.location.origin}/taqdim/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link nusxalandi");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-text-primary sm:text-3xl">
        Taqdimot deadline'lari
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Ideaton/Hakaton uchun ish/taqdimot yuklash muddatini belgilang va ochiq linkni
        tashkilotchilarga ulashing.
      </p>

      <Card className="mt-6 p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldShell label="Event" error={errors.event?.message}>
              <Controller
                control={control}
                name="event"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ideaton">Ideaton</SelectItem>
                      <SelectItem value="hakaton">Hakaton</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FieldShell>
            <FieldShell label="Yopilish vaqti" error={errors.closesAt?.message}>
              <Input type="datetime-local" {...register("closesAt")} />
            </FieldShell>
          </div>
          <FieldShell label="Sarlavha" error={errors.title?.message}>
            <Input placeholder="Ideaton — pitch deck yuklash" {...register("title")} />
          </FieldShell>
          <Button type="submit" disabled={submitting} className="gap-1.5">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Deadline yaratish
          </Button>
        </form>
      </Card>

      <div className="mt-8 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        )}
        {!loading && rows.length === 0 && (
          <p className="py-10 text-center text-sm text-text-muted">
            Hali deadline yaratilmagan.
          </p>
        )}
        {!loading &&
          rows.map((row) => {
            const isOpen = !row.closedEarly && new Date(row.closesAt).getTime() > Date.now();
            return (
              <Card key={row.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text-primary">{row.title}</p>
                      <Badge variant="outline">{row.event === "ideaton" ? "Ideaton" : "Hakaton"}</Badge>
                      {isOpen ? (
                        <Badge variant="checkedIn">Ochiq</Badge>
                      ) : (
                        <Badge variant="rejected">Yopiq</Badge>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-text-muted">
                      Yopilish: {formatDateTime(row.closesAt)} · {row.submissionCount} ta yuklama ·
                      yaratdi: {row.createdByName}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => copyLink(row.token)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Link
                    </Button>
                    <Button
                      size="sm"
                      variant={row.closedEarly ? "success" : "destructive"}
                      disabled={togglingId === row.id}
                      className="gap-1.5"
                      onClick={() => toggleClosed(row)}
                    >
                      {togglingId === row.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : row.closedEarly ? (
                        <Unlock className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      {row.closedEarly ? "Qayta ochish" : "Muddatidan oldin yopish"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
