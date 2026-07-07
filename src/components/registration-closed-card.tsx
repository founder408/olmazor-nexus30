import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { RegistrationEvent } from "@/lib/registration-deadlines";
import { getRegistrationStatus, registrationClosedMessage } from "@/lib/registration-deadlines";
import { TELEGRAM_CHANNEL_URL } from "@/lib/constants";

const EVENT_TITLES: Record<RegistrationEvent, string> = {
  ideaton: "Ideaton arizasi",
  hakaton: "Hakaton arizasi",
  startup: "AI Startup Kuni arizasi",
};

export function RegistrationClosedCard({ event }: { event: RegistrationEvent }) {
  const status = getRegistrationStatus(event);

  return (
    <Card className="mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/15 text-danger">
        <Lock className="h-5 w-5" />
      </div>
      <h1 className="mt-4 font-display text-xl font-bold text-text-primary">
        {EVENT_TITLES[event]} — qabul yopilgan
      </h1>
      <p className="mt-2 text-sm leading-6 text-text-muted">{registrationClosedMessage(event)}</p>
      {status.closesAtLabel && (
        <p className="mt-3 font-mono text-xs text-text-muted">
          Yopilish vaqti: {status.closesAtLabel} (Toshkent)
        </p>
      )}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href="/">Bosh sahifa</Link>
        </Button>
        <Button asChild variant="secondary">
          <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            Telegram kanal
          </a>
        </Button>
      </div>
    </Card>
  );
}
