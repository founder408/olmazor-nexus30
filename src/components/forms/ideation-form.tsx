"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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
import { NetworkProgress } from "@/components/network-progress";
import { AGE_RANGE_LABEL, EVENT_DATE_RANGE_LABEL } from "@/lib/constants";
import {
  ideationApplicationSchema,
  type IdeationApplicationInput,
} from "@/lib/validations";

const STEPS = [
  { id: "shaxsiy", label: "Shaxsiy ma'lumot" },
  { id: "motivatsiya", label: "Motivatsiya" },
  { id: "tasdiqlash", label: "Yo'nalish" },
];

const STEP_FIELDS: (keyof IdeationApplicationInput)[][] = [
  ["fullName", "phone", "telegramUsername", "birthDate"],
  ["motivationText", "experienceText"],
  ["trackId", "timeConfirmed"],
];

export function IdeationForm({
  tracks,
  deadlineLabel,
}: {
  tracks: { id: string; name: string }[];
  deadlineLabel?: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, touchedFields },
  } = useForm<IdeationApplicationInput>({
    resolver: zodResolver(ideationApplicationSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      phone: "+998",
      telegramUsername: "@",
      birthDate: "",
      motivationText: "",
      experienceText: "",
      trackId: "",
      timeConfirmed: false,
    },
  });

  const motivationText = watch("motivationText") ?? "";

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: IdeationApplicationInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/ideaton", {
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
      router.push("/tasdiqlash?event=ideaton");
    } catch {
      toast.error("Internet aloqasini tekshiring va qaytadan urinib ko'ring.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8">
        <NetworkProgress steps={STEPS} currentIndex={step} />
      </div>

      <Card className="p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold text-text-primary">
          Ideaton arizasi
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          3 bosqichda to'ldiring — bor-yo'g'i 3-5 daqiqa vaqt oladi.
        </p>
        {deadlineLabel && (
          <p className="mt-2 rounded-lg border border-accent-violet/20 bg-accent-violet/10 px-3 py-2 text-xs text-text-muted">
            Ariza qabuli <span className="font-medium text-text-primary">{deadlineLabel}</span>{" "}
            gacha ochiq (Toshkent vaqti, 00:00 da yopiladi).
          </p>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6"
          noValidate
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
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
                    hint="+998 bilan boshlang"
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
                  label="Tug'ilgan sana"
                  error={errors.birthDate?.message}
                  touched={touchedFields.birthDate}
                  hint={`Yosh chegarasi: ${AGE_RANGE_LABEL}`}
                >
                  <Input type="date" className="font-mono" {...register("birthDate")} />
                </FieldShell>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <FieldShell
                  label="Nega Ideatonda qatnashmoqchisiz?"
                  error={errors.motivationText?.message}
                  touched={touchedFields.motivationText}
                  hint={`${motivationText.length}/500 belgi (kamida 50)`}
                >
                  <Textarea
                    rows={5}
                    placeholder="2-3 gapda motivatsiyangizni yozing..."
                    {...register("motivationText")}
                  />
                </FieldShell>
                <FieldShell
                  label="Oldingi tajribangiz"
                  optional
                  error={errors.experienceText?.message}
                  touched={touchedFields.experienceText}
                  hint="Portfolio / GitHub / LinkedIn linki yoki qisqa tavsif"
                >
                  <Textarea rows={3} {...register("experienceText")} />
                </FieldShell>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <FieldShell
                  label="Qaysi yo'nalishga qiziqasiz?"
                  error={errors.trackId?.message}
                  touched={touchedFields.trackId}
                >
                  <Controller
                    control={control}
                    name="trackId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Yo'nalishni tanlang" />
                        </SelectTrigger>
                        <SelectContent>
                          {tracks.map((track) => (
                            <SelectItem key={track.id} value={track.id}>
                              {track.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FieldShell>

                <Controller
                  control={control}
                  name="timeConfirmed"
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-0.5"
                      />
                      <span className="text-sm text-text-primary">
                        Men Ideatonning barcha 3 kunida ({EVENT_DATE_RANGE_LABEL}) to&apos;liq
                        qatnasha olishimni tasdiqlayman
                      </span>
                    </label>
                  )}
                />
                {errors.timeConfirmed && (
                  <p className="text-xs text-danger">{errors.timeConfirmed.message}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Orqaga
            </Button>

            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={goNext} size="lg" className="gap-1.5">
                Keyingi qadam
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" size="lg" disabled={submitting} className="gap-1.5">
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Arizani yuborish
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
