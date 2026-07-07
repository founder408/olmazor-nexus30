"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork, Loader2, Plus, Sparkles, Trash2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldShell } from "@/components/forms/field-shell";
import {
  hakatonTeamSchema,
  hakatonPublicRegistrationSchema,
  type HakatonTeamInput,
  type HakatonPublicRegistrationInput,
} from "@/lib/validations";

const MAX_MEMBERS = 5;
const MIN_MEMBERS = 3;

const defaultMembers = [
  { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
  { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
  { fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" },
];

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Users;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-teal/20 to-accent-violet/20 text-accent-teal ring-1 ring-inset ring-white/10">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

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
      motivation: "",
      members: defaultMembers,
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
      <HakatonFormShell
        badge={`Yo'nalish: ${trackName}`}
        title="Hakaton jamoa arizasi"
        description="Jamoa vakili sifatida barcha a'zolar ma'lumotini kiriting."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <HakatonTeamFields
            register={register}
            errors={errors}
            touchedFields={touchedFields}
            fields={fields}
            append={append}
            remove={remove}
          />
          <Button type="submit" size="lg" disabled={submitting} className="w-full gap-1.5">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Jamoa arizasini yuborish
          </Button>
        </form>
      </HakatonFormShell>
    </div>
  );
}

export function HakatonPublicRegistrationForm({
  tracks,
  deadlineLabel,
}: {
  tracks: { id: string; name: string }[];
  deadlineLabel?: string | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<HakatonPublicRegistrationInput>({
    resolver: zodResolver(hakatonPublicRegistrationSchema),
    mode: "onBlur",
    defaultValues: {
      trackId: "",
      teamName: "",
      githubOrgUsername: "",
      motivation: "",
      members: defaultMembers,
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "members" });

  async function onSubmit(values: HakatonPublicRegistrationInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/hakaton", {
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
      <HakatonFormShell
        badge="Hakaton · ochiq ro'yxatdan o'tish"
        title="Hakaton jamoa arizasi"
        description="Ideatondan saralangan jamoalar maxsus link orqali ham ro'yxatdan o'tadi. Agar jamoangiz tayyor bo'lsa, shu yerda to'g'ridan-to'g'ri ariza topshiring — tashkilotchilar qo'shimcha jamoalarni ham saralaydi."
        deadlineLabel={deadlineLabel}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <div>
            <SectionHeading icon={Sparkles} title="Yo'nalish" subtitle="Qaysi yo'nalishda ishtirok etasiz?" />
            <FieldShell label="Yo'nalish" error={errors.trackId?.message} touched={touchedFields.trackId}>
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
          </div>

          <HakatonTeamFields
            register={register}
            errors={errors}
            touchedFields={touchedFields}
            fields={fields}
            append={append}
            remove={remove}
          />

          <Button type="submit" size="lg" disabled={submitting} className="w-full gap-1.5">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Jamoa arizasini yuborish
          </Button>
        </form>
      </HakatonFormShell>
    </div>
  );
}

function HakatonFormShell({
  badge,
  title,
  description,
  deadlineLabel,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  deadlineLabel?: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-teal/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-accent-violet/10 blur-3xl" />

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-teal/20 bg-accent-teal/[0.08] px-3 py-1 text-xs font-mono uppercase tracking-wide text-accent-teal">
          <Users className="h-3.5 w-3.5" />
          {badge}
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-text-primary sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
        {deadlineLabel && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-text-muted">
            Ariza qabuli yopiladi:{" "}
            <span className="font-mono text-accent-gold">{deadlineLabel}</span> (Toshkent vaqti)
          </p>
        )}

        <div className="mt-8">{children}</div>
      </div>
    </Card>
  );
}

type HakatonTeamFieldsProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  errors: Record<string, unknown>;
  touchedFields: Record<string, unknown>;
  fields: { id: string }[];
  append: (value: {
    fullName: string;
    phone: string;
    telegramUsername: string;
    domain: string;
    skills: string;
  }) => void;
  remove: (index: number) => void;
};

function HakatonTeamFields({
  register,
  errors,
  touchedFields,
  fields,
  append,
  remove,
}: HakatonTeamFieldsProps) {
  const teamNameError = (errors.teamName as { message?: string } | undefined)?.message;
  const githubError = (errors.githubOrgUsername as { message?: string } | undefined)?.message;
  const motivationError = (errors.motivation as { message?: string } | undefined)?.message;
  const membersErrors = errors.members as
    | Array<{
        fullName?: { message?: string };
        phone?: { message?: string };
        telegramUsername?: { message?: string };
        domain?: { message?: string };
        skills?: { message?: string };
      }>
    | { root?: { message?: string }; message?: string }
    | undefined;

  return (
    <>
      <div>
        <SectionHeading icon={Users} title="Jamoa haqida" subtitle="Jamoa nomi va (ixtiyoriy) GitHub tashkilot" />
        <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
          <FieldShell label="Jamoa nomi" error={teamNameError} touched={Boolean(touchedFields.teamName)}>
            <Input placeholder="NEXUS Squad" {...register("teamName")} />
          </FieldShell>
          <FieldShell label="GitHub tashkilot username" optional error={githubError}>
            <div className="relative">
              <GitFork className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input className="pl-9 font-mono" placeholder="github.com/..." {...register("githubOrgUsername")} />
            </div>
          </FieldShell>
        </div>
      </div>

      <div>
        <SectionHeading
          icon={Sparkles}
          title="Nima uchun Hakatonda qatnashmoqchisiz?"
          subtitle="Jamoangizning maqsadi, g'oyasi yoki motivatsiyasini yozing"
        />
        <FieldShell label="Motivatsiya" error={motivationError} touched={Boolean(touchedFields.motivation)}>
          <Textarea
            rows={4}
            placeholder="Bizning jamoa... (kamida 50 belgi)"
            {...register("motivation")}
          />
        </FieldShell>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <SectionHeading
            icon={UserRound}
            title="Jamoa a'zolari"
            subtitle="Har bir a'zoning ko'nikmalari va sohasini kiriting"
          />
          <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-xs text-text-muted">
            {fields.length}/{MAX_MEMBERS} a'zo
          </span>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {fields.map((field, index) => {
              const memberErr = Array.isArray(membersErrors) ? membersErrors[index] : undefined;
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-4 sm:p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-violet/10 px-2.5 py-0.5 font-mono text-xs text-accent-violet">
                      A'zo #{index + 1}
                    </span>
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
                    <FieldShell label="Ism-familya" error={memberErr?.fullName?.message}>
                      <Input {...register(`members.${index}.fullName` as const)} />
                    </FieldShell>
                    <FieldShell label="Telefon" error={memberErr?.phone?.message}>
                      <Input className="font-mono" {...register(`members.${index}.phone` as const)} />
                    </FieldShell>
                    <FieldShell label="Telegram" error={memberErr?.telegramUsername?.message}>
                      <Input className="font-mono" {...register(`members.${index}.telegramUsername` as const)} />
                    </FieldShell>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <FieldShell
                      label="Sohasi"
                      error={memberErr?.domain?.message}
                    >
                      <Input
                        placeholder="Masalan: Frontend dasturchi"
                        {...register(`members.${index}.domain` as const)}
                      />
                    </FieldShell>
                    <FieldShell
                      label="Ko'nikmalari"
                      error={memberErr?.skills?.message}
                    >
                      <Input
                        placeholder="Masalan: React, Figma, SMM"
                        {...register(`members.${index}.skills` as const)}
                      />
                    </FieldShell>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!Array.isArray(membersErrors) && membersErrors?.root && (
          <p className="mt-2 text-xs text-danger">{membersErrors.root.message}</p>
        )}
        {!Array.isArray(membersErrors) && membersErrors?.message && (
          <p className="mt-2 text-xs text-danger">{membersErrors.message}</p>
        )}

        {fields.length < MAX_MEMBERS && (
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full gap-1.5"
            onClick={() =>
              append({ fullName: "", phone: "+998", telegramUsername: "@", domain: "", skills: "" })
            }
          >
            <Plus className="h-4 w-4" />
            Yana a'zo qo'shish
          </Button>
        )}
      </div>
    </>
  );
}
