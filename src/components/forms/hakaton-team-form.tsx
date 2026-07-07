"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/field-shell";
import { hakatonTeamSchema, type HakatonTeamInput } from "@/lib/validations";

const MAX_MEMBERS = 6;
const MIN_MEMBERS = 3;

export function HakatonTeamForm({
  token,
  trackName,
  defaultTeamName,
}: {
  token: string;
  trackName: string;
  defaultTeamName: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<HakatonTeamInput>({
    resolver: zodResolver(hakatonTeamSchema),
    mode: "onBlur",
    defaultValues: {
      teamName: defaultTeamName ?? "",
      githubOrgUsername: "",
      members: [
        { fullName: "", phone: "+998", telegramUsername: "@" },
        { fullName: "", phone: "+998", telegramUsername: "@" },
        { fullName: "", phone: "+998", telegramUsername: "@" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  async function onSubmit(values: HakatonTeamInput) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hakaton/${token}`, {
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
      router.push("/tasdiqlash?event=hakaton");
    } catch {
      toast.error("Internet aloqasini tekshiring va qaytadan urinib ko'ring.");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide text-accent-teal">
          <Users className="h-3.5 w-3.5" />
          Yo'nalish: {trackName}
        </div>
        <h1 className="mt-2 font-display text-2xl font-bold text-text-primary">
          Hakaton jamoa arizasi
        </h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Jamoa vakili sifatida barcha a'zolar ma'lumotini kiriting.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6" noValidate>
          <FieldShell
            label="Jamoa nomi"
            error={errors.teamName?.message}
            touched={touchedFields.teamName}
          >
            <Input placeholder="NEXUS Squad" {...register("teamName")} />
          </FieldShell>

          <FieldShell
            label="GitHub tashkilot username"
            optional
            error={errors.githubOrgUsername?.message}
          >
            <Input className="font-mono" placeholder="github.com/..." {...register("githubOrgUsername")} />
          </FieldShell>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">Jamoa a'zolari</p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-text-muted">
                {fields.length}/{MAX_MEMBERS} a'zo
              </span>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-4"
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
                      <FieldShell
                        label="Ism-familya"
                        error={errors.members?.[index]?.fullName?.message}
                        className="sm:col-span-1"
                      >
                        <Input {...register(`members.${index}.fullName` as const)} />
                      </FieldShell>
                      <FieldShell
                        label="Telefon"
                        error={errors.members?.[index]?.phone?.message}
                      >
                        <Input className="font-mono" {...register(`members.${index}.phone` as const)} />
                      </FieldShell>
                      <FieldShell
                        label="Telegram"
                        error={errors.members?.[index]?.telegramUsername?.message}
                      >
                        <Input className="font-mono" {...register(`members.${index}.telegramUsername` as const)} />
                      </FieldShell>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {errors.members?.root && (
              <p className="mt-2 text-xs text-danger">{errors.members.root.message}</p>
            )}
            {errors.members?.message && (
              <p className="mt-2 text-xs text-danger">{errors.members.message}</p>
            )}

            {fields.length < MAX_MEMBERS && (
              <Button
                type="button"
                variant="secondary"
                className="mt-4 w-full gap-1.5"
                onClick={() => append({ fullName: "", phone: "+998", telegramUsername: "@" })}
              >
                <Plus className="h-4 w-4" />
                Yana a'zo qo'shish
              </Button>
            )}
          </div>

          <Button type="submit" size="lg" disabled={submitting} className="w-full gap-1.5">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Jamoa arizasini yuborish
          </Button>
        </form>
      </Card>
    </div>
  );
}
