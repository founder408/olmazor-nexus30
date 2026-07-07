"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
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
import { startupApplicationAdminSchema, type StartupApplicationAdminInput } from "@/lib/validations";
import { detailToRow } from "@/lib/organizer-row";
import type { OrganizerRow } from "@/app/api/organizer/[event]/route";
import type { ApplicationDetail } from "@/app/api/organizer/[event]/[id]/route";

const STATUSES = ["pending", "shortlisted", "rejected"] as const;

export function StartupAdminForm({
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
  } = useForm<StartupApplicationAdminInput>({
    resolver: zodResolver(startupApplicationAdminSchema),
    defaultValues: {
      fullName: initialData?.fullName ?? "",
      phone: initialData?.phone ?? "+998",
      telegramUsername: initialData?.telegramUsername ?? "@",
      ideaDescription: initialData?.ideaDescription ?? "",
      pitchDeckLink: initialData?.pitchDeckLink ?? "",
      prototypeLink: initialData?.prototypeLink ?? "",
      hasSales: initialData?.hasSales ?? false,
      revenueAmount: initialData?.revenueAmount ?? undefined,
      userCount: initialData?.userCount ?? undefined,
      trackId: initialData?.trackId ?? "",
      status: initialData?.status ?? "pending",
    },
  });

  const hasSales = watch("hasSales");
  const ideaDescription = watch("ideaDescription") ?? "";
  const identityEditable = initialData ? initialData.identityEditable !== false : true;

  async function onSubmit(values: StartupApplicationAdminInput) {
    setSubmitting(true);
    try {
      const url = mode === "create" ? "/api/organizer/startup" : `/api/organizer/startup/${id}`;
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
        const detailRes = await fetch(`/api/organizer/startup/${targetId}`);
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
      {!identityEditable && (
        <p className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-text-muted">
          Bu ariza jamoa a'zosi orqali bog'langan — ism/telefon/telegram jamoa bo'limida tahrirlanadi.
        </p>
      )}
      <FieldShell label="Ism va Familya" error={errors.fullName?.message}>
        <Input placeholder="Aziz Karimov" disabled={!identityEditable} {...register("fullName")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Telefon raqam" error={errors.phone?.message}>
          <Input
            className="font-mono"
            placeholder="+998901234567"
            disabled={!identityEditable}
            {...register("phone")}
          />
        </FieldShell>
        <FieldShell label="Telegram username" error={errors.telegramUsername?.message}>
          <Input
            className="font-mono"
            placeholder="@username"
            disabled={!identityEditable}
            {...register("telegramUsername")}
          />
        </FieldShell>
      </div>
      <FieldShell
        label="G'oya tavsifi"
        error={errors.ideaDescription?.message}
        hint={`${ideaDescription.length}/1500 belgi (kamida 80)`}
      >
        <Textarea rows={4} {...register("ideaDescription")} />
      </FieldShell>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldShell label="Pitch deck linki" error={errors.pitchDeckLink?.message}>
          <Input placeholder="https://..." {...register("pitchDeckLink")} />
        </FieldShell>
        <FieldShell label="Prototip linki" optional error={errors.prototypeLink?.message}>
          <Input placeholder="https://..." {...register("prototypeLink")} />
        </FieldShell>
      </div>
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
        name="hasSales"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
            <span className="text-sm text-text-primary">Sotuvi bor</span>
          </label>
        )}
      />

      <AnimatePresence initial={false}>
        {hasSales && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 pt-1 sm:grid-cols-2">
              <FieldShell label="Daromad (UZS)" error={errors.revenueAmount?.message}>
                <Input type="number" min={0} {...register("revenueAmount")} />
              </FieldShell>
              <FieldShell label="Foydalanuvchilar soni" error={errors.userCount?.message}>
                <Input type="number" min={0} {...register("userCount")} />
              </FieldShell>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
