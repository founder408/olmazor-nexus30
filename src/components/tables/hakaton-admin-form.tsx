"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "@/components/forms/field-shell";
import { STATUS_LABELS } from "@/lib/constants";
import { hakatonTeamAdminSchema, type HakatonTeamAdminInput } from "@/lib/validations";
import { detailToRow } from "@/lib/organizer-row";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";
import type { ApplicationDetail } from "@/app/api/organizer/[event]/[id]/route";

const STATUSES = ["pending", "shortlisted", "rejected"] as const;
const MIN_MEMBERS = 3;
const MAX_MEMBERS = 5;

export function HakatonAdminForm({
  mode,
  id,
  tracks,
  initialData,
  onSaved,
  onCancel,
}: {
  mode: "create" | "edit";
  id?: string;
  tracks: { id: string; name: string }[];
  initialData?: ApplicationDetail;
  onSaved: (row: OrganizerRow) => void;
  onCancel?: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HakatonTeamAdminInput>({
    resolver: zodResolver(hakatonTeamAdminSchema),
    defaultValues: {
      teamName: initialData?.teamName ?? "",
      githubOrgUsername: initialData?.githubOrgUsername ?? "",
      motivation: initialData?.motivation ?? "",
      trackId: initialData?.trackId ?? "",
      status: initialData?.status ?? "pending",
      members:
        initialData?.members && initialData.members.length > 0
          ? initialData.members.map((m) => ({
              fullName: m.fullName,
              phone: m.phone,
              telegramUsername: m.telegramUsername,
              domain: m.domain ?? "",
              skills: m.skills ?? "",
            }))
          : [
              { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
              { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
              { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
            ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  async function onSubmit(values: HakatonTeamAdminInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/organizer/hakaton" : `/api/organizer/hakaton/${id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi");
        return;
      }

      const targetId = json.id ?? id;
      if (json.detail) {
        onSaved(detailToRow(json.detail));
      } else if (targetId) {
        const detailRes = await fetch(`/api/organizer/hakaton/${targetId}`);
        const detailJson = await detailRes.json();
        if (detailJson.detail) onSaved(detailToRow(detailJson.detail));
      }
      toast.success(mode === "create" ? "Jamoa yaratildi" : "O'zgarishlar saqlandi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FieldShell label="Jamoa nomi" error={errors.teamName?.message}>
        <Input placeholder="NEXUS Squad" {...register("teamName")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Yo'nalish" error={errors.trackId?.message}>
          <Controller
            control={control}
            name="trackId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Yo'nalishni tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldShell>
        <FieldShell label="Status" error={errors.status?.message}>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FieldShell>
      </div>
      <FieldShell label="GitHub tashkilot username" optional error={errors.githubOrgUsername?.message}>
        <Input className="font-mono" {...register("githubOrgUsername")} />
      </FieldShell>

      <FieldShell label="Nima uchun qatnashmoqchi (motivatsiya)" error={errors.motivation?.message}>
        <Textarea rows={4} {...register("motivation")} />
      </FieldShell>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-text-primary">Jamoa a'zolari</p>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-text-muted">
            {fields.length}/{MAX_MEMBERS} a'zo
          </span>
        </div>
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs text-text-muted">A'zo #{index + 1}</span>
                {fields.length > MIN_MEMBERS && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg p-1 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="A'zoni o'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldShell label="Ism-familya" error={errors.members?.[index]?.fullName?.message}>
                  <Input {...register(`members.${index}.fullName` as const)} />
                </FieldShell>
                <FieldShell label="Telefon" error={errors.members?.[index]?.phone?.message}>
                  <Input className="font-mono" {...register(`members.${index}.phone` as const)} />
                </FieldShell>
                <FieldShell
                  label="Telegram"
                  error={errors.members?.[index]?.telegramUsername?.message}
                >
                  <Input className="font-mono" {...register(`members.${index}.telegramUsername` as const)} />
                </FieldShell>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <FieldShell label="Sohasi" error={errors.members?.[index]?.domain?.message}>
                  <Input placeholder="Masalan: Frontend dasturchi" {...register(`members.${index}.domain` as const)} />
                </FieldShell>
                <FieldShell label="Ko'nikmalari" error={errors.members?.[index]?.skills?.message}>
                  <Input placeholder="Masalan: React, Figma, SMM" {...register(`members.${index}.skills` as const)} />
                </FieldShell>
              </div>
            </div>
          ))}
        </div>
        {errors.members?.message && <p className="mt-2 text-xs text-danger">{errors.members.message}</p>}
        {fields.length < MAX_MEMBERS && (
          <Button
            type="button"
            variant="secondary"
            className="mt-3 w-full gap-1.5"
            onClick={() => append({ fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" })}
          >
            <Plus className="h-4 w-4" />
            Yana a'zo qo'shish
          </Button>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Saqlash
        </Button>
      </DialogFooter>
    </form>
  );
}
