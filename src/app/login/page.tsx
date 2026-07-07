"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldShell } from "@/components/forms/field-shell";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/organizer/dashboard";
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setFormError(null);
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
    });
    if (!res || res.error) {
      setFormError("Email yoki parol noto'g'ri");
      setSubmitting(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="mx-auto w-full max-w-sm p-6 sm:p-8">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-accent-violet/15 text-accent-violet">
        <LogIn className="h-5 w-5" />
      </div>
      <h1 className="mt-4 text-center font-display text-xl font-bold text-text-primary">
        Tizimga kirish
      </h1>
      <p className="mt-1 text-center text-sm text-text-muted">
        Volontyor, tashkilotchi va admin uchun
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <FieldShell label="Email" error={errors.email?.message}>
          <Input type="email" placeholder="ism@nexus30.uz" {...register("email")} />
        </FieldShell>
        <FieldShell label="Parol" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </FieldShell>

        {formError && <p className="text-sm text-danger">{formError}</p>}

        <Button type="submit" size="lg" className="w-full gap-1.5" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Kirish
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-text-muted">
        Ishtirokchimisiz?{" "}
        <Link href="/ideaton/ariza" className="text-accent-violet hover:underline">
          Ariza topshirish
        </Link>
      </p>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-16 sm:px-6">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
