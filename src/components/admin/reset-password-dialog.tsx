"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldShell } from "@/components/forms/field-shell";
import { resetUserPasswordSchema } from "@/lib/validations";

type FormValues = z.infer<typeof resetUserPasswordSchema>;

type Props = {
  user: { id: string; fullName: string; email: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ResetPasswordDialog({ user, open, onOpenChange }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { password: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Parolni o'zgartirishda xatolik");
        return;
      }
      toast.success(`${user.fullName} uchun parol yangilandi`);
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-accent-violet" />
            Parolni tiklash
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-text-muted">
          <span className="font-medium text-text-primary">{user.fullName}</span> ({user.email}) uchun
          yangi parol kiriting.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FieldShell label="Yangi parol" error={errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...register("password")} />
          </FieldShell>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
