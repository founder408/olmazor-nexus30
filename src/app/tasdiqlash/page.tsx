import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EVENT_LABELS, TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL, type EventKey } from "@/lib/constants";
import { ConfettiNode } from "@/components/confirmation-animation";

export default function TasdiqlashPage({
  searchParams,
}: {
  searchParams: { event?: string };
}) {
  const event = (searchParams.event ?? "ideaton") as EventKey;
  const label = EVENT_LABELS[event] ?? "NEXUS30";

  return (
    <div className="relative min-h-screen">
      <SiteHeader />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <ConfettiNode />
        <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-accent-teal/15 text-accent-teal">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold text-text-primary sm:text-3xl">
          Arizangiz qabul qilindi!
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-muted">
          {label} uchun arizangiz muvaffaqiyatli yuborildi. Tashkilotchilar arizani ko'rib
          chiqadi va natija haqida Telegram orqali xabar beradi.
        </p>

        <Card className="mt-8 w-full p-6 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent-violet/15 text-accent-violet">
              <Send className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                Yangiliklarni kuzatib boring
              </p>
              <p className="mt-1 text-xs leading-5 text-text-muted">
                Natijalar va keyingi bosqich haqida birinchi bo'lib bilish uchun{" "}
                {TELEGRAM_CHANNEL_HANDLE} Telegram kanaliga qo'shiling.
              </p>
              <Button asChild size="sm" className="mt-4">
                <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                  Telegram kanalga o'tish
                </a>
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/">Bosh sahifaga qaytish</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
