import Link from "next/link";
import { Lock } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HakatonArizaInfoPage() {
  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="px-4 py-16 sm:px-6">
        <Card className="mx-auto max-w-xl p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-violet/15 text-accent-violet">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold text-text-primary">
            Hakaton forma ochiq emas
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Hakaton arizasi faqat Ideatondan saralangan jamoalar uchun maxsus link
            orqali ochiladi. Agar jamoangiz saralangan bo'lsa, tashkilotchilar
            Telegram orqali sizga shaxsiy link yuboradi.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/ideaton/ariza">Avval Ideatonga ariza topshiring</Link>
          </Button>
        </Card>
      </main>
    </div>
  );
}
