"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/field-shell";
import { changeOwnPasswordSchema } from "@/lib/validations";

type FormValues = z.infer<typeof changeOwnPasswordSchema>;

export function ChangePasswordCard() {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(changeOwnPasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Parolni o'zgartirishda xatolik");
        return;
      }
      toast.success("Parol muvaffaqiyatli yangilandi");
      reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2">
        <Lock className="h-5 w-5 text-accent-violet" />
        <h2 className="font-display text-lg font-bold text-text-primary">Parolni o&apos;zgartirish</h2>
      </div>
      <p className="mt-1 text-sm text-text-muted">
        O&apos;z admin hisobingiz parolini yangilang. Joriy parolni bilishingiz kerak.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
        <FieldShell label="Joriy parol" error={errors.currentPassword?.message}>
          <Input type="password" autoComplete="current-password" {...register("currentPassword")} />
        </FieldShell>
        <FieldShell label="Yangi parol" error={errors.newPassword?.message}>
          <Input type="password" autoComplete="new-password" {...register("newPassword")} />
        </FieldShell>
        <FieldShell label="Yangi parolni tasdiqlang" error={errors.confirmPassword?.message}>
          <Input type="password" autoComplete="new-password" {...register("confirmPassword")} />
        </FieldShell>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Parolni yangilash
        </Button>
      </form>
    </Card>
  );
}
