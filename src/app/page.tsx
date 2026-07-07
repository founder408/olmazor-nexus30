import Link from "next/link";
import { ArrowRight, Lightbulb, Rocket, Send, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { HeroNetwork } from "@/components/hero-network";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL } from "@/lib/constants";

const STAGES = [
  {
    key: "ideaton",
    title: "Ideaton",
    icon: Lightbulb,
    accent: "text-accent-violet",
    ring: "border-accent-violet/30 hover:border-accent-violet/60",
    description:
      "G'oyangizni taqdim eting. Yakka tartibda ariza to'ldiring, saralovdan o'ting va eng yaxshi jamoalar Hakatonga chiqadi.",
    href: "/ideaton/ariza",
    cta: "Ideatonga ariza topshirish",
  },
  {
    key: "hakaton",
    title: "Hakaton",
    icon: Users,
    accent: "text-accent-teal",
    ring: "border-accent-teal/30 hover:border-accent-teal/60",
    description:
      "Saralangan jamoalar 48 soat ichida g'oyani ishlaydigan mahsulotga aylantiradi. Faqat maxsus taklif linki orqali.",
    href: "/hakaton/ariza",
    cta: "Jamoa uchun ma'lumot",
    disabled: true,
  },
  {
    key: "startup",
    title: "AI Startup Kuni",
    icon: Rocket,
    accent: "text-accent-gold",
    ring: "border-accent-gold/30 hover:border-accent-gold/60",
    description:
      "Tayyor loyihangiz bormi? Investorlar va mentorlar oldida pitch qiling — yakka founder yoki jamoa bo'lib qatnashish mumkin.",
    href: "/startup/ariza",
    cta: "Startup arizasi topshirish",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:gap-10 sm:px-6 sm:py-16 md:py-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-28 xl:py-32">
            <div className="animate-fade-in order-2 text-center lg:order-1 lg:text-left">
              <p className="mx-auto mb-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-mono leading-snug text-text-muted sm:text-xs lg:mx-0 lg:justify-start">
                <span>Olmazor tumani</span>
                <span className="hidden text-white/20 sm:inline">·</span>
                <span>17–25 yosh</span>
                <span className="hidden text-white/20 sm:inline">·</span>
                <span>3 bosqichli tech-tadbir</span>
              </p>
              <h1 className="font-display text-[1.75rem] font-bold leading-[1.15] text-text-primary min-[400px]:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08] xl:text-[64px] xl:leading-[1.05]">
                G&apos;oyadan mahsulotgacha —{" "}
                <span className="bg-gradient-to-r from-accent-violet to-accent-teal bg-clip-text text-transparent">
                  bitta tarmoqda
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-muted sm:mt-6 sm:text-base sm:leading-7 lg:mx-0">
                NEXUS30 — Olmazor tumani yoshlari uchun Ideaton, Hakaton va AI Startup
                Kunini birlashtirgan uch bosqichli tanlov. G&apos;oyangizni yozing, jamoa
                tuzing, mahsulotingizni namoyish eting.
              </p>
              <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3 sm:mt-8 sm:max-w-none sm:flex-row sm:justify-center lg:mx-0 lg:justify-start">
                <Button asChild size="lg" className="group h-12 w-full text-sm sm:h-14 sm:text-base lg:w-auto lg:px-6">
                  <Link href="/ideaton/ariza">
                    Ideatonga ariza topshirish
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full text-sm sm:h-14 sm:text-base lg:w-auto lg:px-6"
                >
                  <Link href="/startup/ariza">AI Startup Kuniga ariza</Link>
                </Button>
              </div>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-auto mt-4 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-accent-teal lg:mx-0"
              >
                <Send className="h-4 w-4" />
                Yangiliklar: {TELEGRAM_CHANNEL_HANDLE}
              </a>
            </div>

            <div className="order-1 mx-auto aspect-square w-full max-w-[260px] sm:max-w-xs md:max-w-sm lg:order-2 lg:max-w-md xl:max-w-lg">
              <HeroNetwork />
            </div>
          </div>
        </section>

        {/* Stages */}
        <section
          id="bosqichlar"
          className="scroll-mt-20 mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24"
        >
          <div className="mb-8 max-w-2xl text-center sm:mb-10 lg:text-left">
            <h2 className="font-display text-xl font-bold text-text-primary sm:text-2xl md:text-3xl">
              3 bosqich, bitta g&apos;alaba yo&apos;li
            </h2>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
              Har bir bosqich oldingisidan meros oladi: Ideatondan Hakatonga, Hakatondan
              AI Startup Kuniga — g&apos;oyangiz bilan birga o&apos;sing.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((stage) => (
              <Card
                key={stage.key}
                className={`flex flex-col justify-between p-5 transition-colors sm:p-6 ${stage.ring}`}
              >
                <div>
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 sm:h-11 sm:w-11 ${stage.accent}`}
                  >
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-text-primary sm:text-lg">
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-text-muted">
                    {stage.description}
                  </p>
                </div>
                <Button
                  asChild
                  variant="secondary"
                  className="mt-5 w-full sm:mt-6"
                  disabled={stage.disabled}
                >
                  <Link href={stage.href} aria-disabled={stage.disabled}>
                    {stage.cta}
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-text-muted sm:flex-row sm:gap-4 sm:px-6 sm:text-left lg:px-8">
          <span>© {new Date().getFullYear()} NEXUS30. Barcha huquqlar himoyalangan.</span>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-accent-teal"
            >
              <Send className="h-3.5 w-3.5" />
              Telegram kanal
            </a>
            <Link href="/login" className="hover:text-text-primary">
              Tashkilotchi / Volontyor kirishi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
