"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { ideationApplicationAdminSchema, type IdeationApplicationAdminInput } from "@/lib/validations";
import { detailToRow } from "@/lib/organizer-row";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";
import type { ApplicationDetail } from "@/app/api/organizer/[event]/[id]/route";

const STATUSES = ["pending", "shortlisted", "rejected"] as const;

export function IdeationAdminForm({
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
    watch,
    formState: { errors },
  } = useForm<IdeationApplicationAdminInput>({
    resolver: zodResolver(ideationApplicationAdminSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      phone: initialData?.phone ?? "+998",
      telegramUsername: initialData?.telegramUsername ?? "@",
      birthDate: initialData?.birthDate ?? "",
      motivationText: initialData?.motivationText ?? "",
      experienceText: initialData?.experienceText ?? "",
      trackId: initialData?.trackId ?? "",
      timeConfirmed: initialData?.timeConfirmed ?? true,
      status: initialData?.status ?? "pending",
    },
  });

  const motivationText = watch("motivationText") ?? "";

  async function onSubmit(values: IdeationApplicationAdminInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/organizer/ideaton" : `/api/organizer/ideaton/${id}`;
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
        const detailRes = await fetch(`/api/organizer/ideaton/${targetId}`);
        const detailJson = await detailRes.json();
        if (detailJson.detail) onSaved(detailToRow(detailJson.detail));
      }
      toast.success(mode === "create" ? "Ariza yaratildi" : "O'zgarishlar saqlandi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FieldShell label="Ism va Familya" error={errors.fullName?.message}>
        <Input placeholder="Aziz Karimov" {...register("fullName")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Telefon raqam" error={errors.phone?.message}>
          <Input className="font-mono" placeholder="+998901234567" {...register("phone")} />
        </FieldShell>
        <FieldShell label="Telegram username" error={errors.telegramUsername?.message}>
          <Input className="font-mono" placeholder="@username" {...register("telegramUsername")} />
        </FieldShell>
      </div>
      <FieldShell label="Tug'ilgan sana" error={errors.birthDate?.message}>
        <Input type="date" className="font-mono" {...register("birthDate")} />
      </FieldShell>
      <FieldShell
        label="Motivatsiya"
        error={errors.motivationText?.message}
        hint={`${motivationText.length}/500 belgi (kamida 50)`}
      >
        <Textarea rows={4} {...register("motivationText")} />
      </FieldShell>
      <FieldShell label="Oldingi tajriba" optional error={errors.experienceText?.message}>
        <Textarea rows={3} {...register("experienceText")} />
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
      <Controller
        control={control}
        name="timeConfirmed"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
            <span className="text-sm text-text-primary">3 kun qatnashishni tasdiqlagan</span>
          </label>
        )}
      />

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
