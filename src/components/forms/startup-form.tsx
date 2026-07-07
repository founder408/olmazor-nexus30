"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "@/components/forms/field-shell";
import { STARTUP_TRACK_NAMES } from "@/lib/constants";
import {
  startupApplicationSchema,
  type StartupApplicationInput,
} from "@/lib/validations";

export function StartupForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<StartupApplicationInput>({
    resolver: zodResolver(startupApplicationSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "+998",
      telegramUsername: "@",
      ideaDescription: "",
      pitchDeckLink: "",
      prototypeLink: "",
      hasSales: false,
      revenueAmount: undefined,
      userCount: undefined,
      trackName: undefined,
    },
  });

  const hasSales = watch("hasSales");
  const ideaDescription = watch("ideaDescription") ?? "";

  async function onSubmit(values: StartupApplicationInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/startup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
        setSubmitting(false);
        return;
      }
      router.push("/tasdiqlash?event=startup");
    } catch {
      toast.error("Internet aloqasini tekshiring va qaytadan urinib ko'ring.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          AI Startup Kuni arizasi
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Yakka founder yoki jamoa vakili sifatida startup g'oyangizni yuboring.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
          <FieldShell
            label="Ism va Familya"
            error={errors.fullName?.message}
            touched={touchedFields.fullName}
          >
            <Input placeholder="Aziz Karimov" {...register("fullName")} />
          </FieldShell>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell
              label="Telefon raqam"
              error={errors.phone?.message}
              touched={touchedFields.phone}
            >
              <Input className="font-mono" placeholder="+998901234567" {...register("phone")} />
            </FieldShell>
            <FieldShell
              label="Telegram username"
              error={errors.telegramUsername?.message}
              touched={touchedFields.telegramUsername}
            >
              <Input className="font-mono" placeholder="@username" {...register("telegramUsername")} />
            </FieldShell>
          </div>

          <FieldShell
            label="G'oyangizni qisqacha tushuntiring"
            error={errors.ideaDescription?.message}
            touched={touchedFields.ideaDescription}
            hint={`${ideaDescription.length}/1500 belgi (kamida 80) — muammo, yechim, auditoriya va AI qismi haqida yozing`}
          >
            <Textarea rows={5} {...register("ideaDescription")} />
          </FieldShell>

          <div className="grid gap-5 sm:grid-cols-2">
            <FieldShell
              label="Pitch deck linki"
              error={errors.pitchDeckLink?.message}
              touched={touchedFields.pitchDeckLink}
              hint="Google Slides / Canva / PDF"
            >
              <Input placeholder="https://..." {...register("pitchDeckLink")} />
            </FieldShell>
            <FieldShell
              label="Loyiha prototipi linki"
              optional
              error={errors.prototypeLink?.message}
              touched={touchedFields.prototypeLink}
            >
              <Input placeholder="https://..." {...register("prototypeLink")} />
            </FieldShell>
          </div>

          <FieldShell
            label="Qaysi yo'nalishdagi startup"
            error={errors.trackName?.message}
            touched={touchedFields.trackName}
          >
            <Controller
              control={control}
              name="trackName"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Yo'nalishni tanlang" />
                  </SelectTrigger>
                  <SelectContent>
                    {STARTUP_TRACK_NAMES.map((track) => (
                      <SelectItem key={track} value={track}>
                        {track}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FieldShell>

          <Controller
            control={control}
            name="hasSales"
            render={({ field }) => (
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
                <span className="text-sm text-text-primary">Sotuvingiz bormi?</span>
              </label>
            )}
          />

          <AnimatePresence initial={false}>
            {hasSales && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 pt-1 sm:grid-cols-2">
                  <FieldShell
                    label="Qancha daromad kelgan"
                    error={errors.revenueAmount?.message}
                    touched={touchedFields.revenueAmount}
                    hint="UZS"
                  >
                    <Input type="number" min={0} {...register("revenueAmount")} />
                  </FieldShell>
                  <FieldShell
                    label="Nechta foydalanuvchi/mijoz bor"
                    error={errors.userCount?.message}
                    touched={touchedFields.userCount}
                  >
                    <Input type="number" min={0} {...register("userCount")} />
                  </FieldShell>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" disabled={submitting} className="w-full gap-1.5">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Arizani yuborish
          </Button>
        </form>
      </Card>
    </div>
  );
}
