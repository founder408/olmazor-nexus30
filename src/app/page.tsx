import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  Lightbulb,
  Rocket,
  Send,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { GirihStar, GirihDivider } from "@/components/girih";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import {
  EVENT_DATE_RANGE_LABEL,
  EVENT_DATES,
  TELEGRAM_CHANNEL_HANDLE,
  TELEGRAM_CHANNEL_URL,
  TRACK_NAMES,
  type EventKey,
} from "@/lib/constants";

const STAGES: Array<{
  key: EventKey;
  index: string;
  title: string;
  date: string;
  icon: typeof Lightbulb;
  accent: string;
  line: string;
  ring: string;
  description: string;
  href: string;
  cta: string;
}> = [
  {
    key: "ideaton",
    index: "01",
    title: "Ideaton",
    date: EVENT_DATES.ideaton.label,
    icon: Lightbulb,
    accent: "text-accent-violet",
    line: "bg-accent-violet",
    ring: "hover:border-accent-violet/50",
    description:
      "G'oyangizni taqdim eting. Yakka tartibda ariza to'ldiring, saralovdan o'ting va eng yaxshi g'oyalar Hakatonga yo'llanma oladi.",
    href: "/ideaton/ariza",
    cta: "Ariza topshirish",
  },
  {
    key: "hakaton",
    index: "02",
    title: "Hakaton",
    date: EVENT_DATES.hakaton.label,
    icon: Users,
    accent: "text-accent-teal",
    line: "bg-accent-teal",
    ring: "hover:border-accent-teal/50",
    description:
      "Saralangan jamoalar maxsus link orqali ro'yxatdan o'tadi. Yangi jamoalar ham ochiq ariza orqali qo'shilib, saralovdan o'tishi mumkin.",
    href: "/hakaton/ariza",
    cta: "Jamoa bilan qatnashish",
  },
  {
    key: "startup",
    index: "03",
    title: "AI Startup Kuni",
    date: EVENT_DATES.startup.label,
    icon: Rocket,
    accent: "text-accent-gold",
    line: "bg-accent-gold",
    ring: "hover:border-accent-gold/50",
    description:
      "Tayyor loyihangizni investorlar va mentorlar oldida pitch qiling — yakka founder yoki jamoa bo'lib qatnashish mumkin.",
    href: "/startup/ariza",
    cta: "Pitch uchun ariza",
  },
];

const STATS = [
  { value: "03", label: "Bosqichli tanlov" },
  { value: "05", label: "Texnologik yo'nalish" },
  { value: "17–25", label: "Yosh oralig'i" },
  { value: "24/7", label: "Onlayn ariza qabuli" },
];

const PROCESS = [
  {
    icon: ClipboardCheck,
    title: "Ariza topshirasiz",
    description: "Onlayn formani to'ldirish 5 daqiqadan oshmaydi — hujjat talab qilinmaydi.",
  },
  {
    icon: UserCheck,
    title: "Saralovdan o'tasiz",
    description: "Tashkilotchilar har bir arizani ko'rib chiqadi, natija Telegram orqali yetkaziladi.",
  },
  {
    icon: Users,
    title: "Tadbirda qatnashasiz",
    description: "Mentorlar bilan ishlaysiz, jamoa tuzasiz va yechimingizni himoya qilasiz.",
  },
  {
    icon: Trophy,
    title: "Keyingi bosqichga chiqasiz",
    description: "Har bosqich g'oliblari keyingisiga yo'llanma oladi — Ideatondan AI Startup Kunigacha.",
  },
];

const MARQUEE_ITEMS = [
  EVENT_DATE_RANGE_LABEL,
  "Ideaton",
  "Hakaton",
  "AI Startup Kuni",
  ...TRACK_NAMES,
  "Olmazor tumani",
  "17–25 yosh",
];

function MarqueeStrip() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent sm:w-28"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent sm:w-28"
      />
      <div className="flex w-max animate-marquee gap-8 pr-8 sm:gap-12 sm:pr-12">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center gap-8 sm:gap-12"
          >
            {MARQUEE_ITEMS.map((item) => (
              <span
                key={`${copy}-${item}`}
                className="flex items-center gap-8 font-mono text-xs font-medium uppercase tracking-[0.22em] text-text-muted/80 sm:gap-12 sm:text-sm"
              >
                {item}
                <GirihStar className="h-3 w-3 flex-shrink-0 text-accent-gold/50" strokeWidth={8} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
      <p className="mb-3 flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent-gold/80 sm:text-xs">
        <GirihStar className="h-3 w-3" strokeWidth={8} />
        {eyebrow}
        <GirihStar className="h-3 w-3" strokeWidth={8} />
      </p>
      <h2 className="font-display text-2xl font-bold text-text-primary sm:text-[32px] sm:leading-[1.15] md:text-[38px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
          {description}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      <SiteHeader />

      <main>
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-15%,rgba(124,92,255,0.14),transparent_65%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent lg:left-[max(1rem,calc((100vw-72rem)/2+2rem))]"
          />

          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 md:py-24 lg:px-8 lg:py-28">
            <div className="animate-fade-in max-w-3xl">
              <div className="mb-6 flex flex-wrap items-center gap-3 sm:mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent-teal/25 bg-accent-teal/[0.08] px-3 py-1 text-[11px] font-medium text-accent-teal sm:text-xs">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-teal opacity-50" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-teal" />
                  </span>
                  Arizalar ochiq
                </span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted sm:text-xs">
                  {EVENT_DATE_RANGE_LABEL} · Olmazor tumani · 17–25 yosh
                </span>
              </div>

              <h1 className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight text-text-primary min-[400px]:text-4xl sm:text-[44px] md:text-[52px] lg:text-[58px]">
                G&apos;oyadan mahsulotgacha.
                <br />
                <span className="text-accent-violet">Bitta tarmoqda.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-text-muted sm:mt-6 sm:text-base sm:leading-8">
                NEXUS30 — Ideaton, Hakaton va AI Startup Kunini birlashtirgan uch
                bosqichli tanlov. G&apos;oyangizni yozing, jamoa tuzing, mahsulotingizni
                namoyish eting.
              </p>

              <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mt-10 sm:max-w-none sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 w-full rounded-lg text-sm font-semibold sm:h-[52px] sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link href="/ideaton/ariza">
                    Ideatonga ariza topshirish
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-lg text-sm sm:h-[52px] sm:w-auto sm:px-8 sm:text-base"
                >
                  <Link href="/startup/ariza">AI Startup Kuniga ariza</Link>
                </Button>
              </div>

              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text-primary"
              >
                <Send className="h-4 w-4" />
                Yangiliklar: {TELEGRAM_CHANNEL_HANDLE}
              </a>
            </div>

            {/* Bosqichlar — hero ostida zamonaviy mini-kartalar */}
            <div className="animate-fade-in mt-12 grid grid-cols-1 gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-4 lg:mt-20">
              {STAGES.map((stage) => (
                <Link
                  key={stage.key}
                  href={stage.href}
                  className={`group flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.04] sm:p-5 ${stage.ring}`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] ${stage.accent}`}
                  >
                    <stage.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted/70">
                      {stage.index}-bosqich
                    </span>
                    <span className="mt-1 block font-display text-sm font-bold text-text-primary sm:text-base">
                      {stage.title}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted/80">
                      {stage.date}
                    </span>
                    <span
                      className={`mt-2 inline-flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 ${stage.accent}`}
                    >
                      Batafsil
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MARQUEE ============ */}
        <MarqueeStrip />

        {/* ============ STATS ============ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Reveal>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.05] lg:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col gap-1.5 bg-[#0d1126] px-5 py-6 sm:px-8 sm:py-8"
                >
                  <dt className="order-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted sm:text-[11px]">
                    {stat.label}
                  </dt>
                  <dd className="order-1 font-display text-2xl font-bold text-text-primary sm:text-[36px] sm:leading-[1.1]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </section>

        {/* ============ BOSQICHLAR ============ */}
        <section
          id="bosqichlar"
          className="scroll-mt-24 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
        >
          <Reveal>
            <SectionHeading
              eyebrow="Uch bosqich"
              title="Bitta g'alaba yo'li"
              description="Har bir bosqich oldingisidan meros oladi: Ideatondan Hakatonga, Hakatondan AI Startup Kuniga — g'oyangiz bilan birga o'sing."
            />
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {STAGES.map((stage, i) => (
              <Reveal key={stage.key} delay={i * 0.12}>
                <article
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1126] p-6 transition-all duration-300 hover:-translate-y-1 sm:p-7 ${stage.ring}`}
                >
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100 ${stage.line}`}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-5 -top-7 select-none font-display text-[96px] font-bold leading-none text-white/[0.04] transition-colors duration-300 group-hover:text-white/[0.07]"
                  >
                    {stage.index}
                  </span>

                  <div className="relative">
                    <div
                      className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] ${stage.accent}`}
                    >
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <p className="mb-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted/70">
                      {stage.index}-bosqich
                    </p>
                    <h3 className="font-display text-lg font-bold text-text-primary sm:text-[22px]">
                      {stage.title}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted/80">
                      {stage.date}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-text-muted">
                      {stage.description}
                    </p>
                  </div>

                  <Link
                    href={stage.href}
                    className={`relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${stage.accent} transition-opacity hover:opacity-80`}
                  >
                    {stage.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ YO'NALISHLAR ============ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Yo'nalishlar"
              title="Qaysi sohada kuchingizni sinaysiz?"
              description="Beshta strategik yo'nalish — tibbiyotdan fintechgacha. G'oyangiz qaysi sohaga tegishli bo'lsa, o'sha yo'nalishni tanlaysiz."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              {TRACK_NAMES.map((track) => (
                <span
                  key={track}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.09] bg-[#0d1126] px-5 py-3.5 text-sm font-medium text-text-primary transition-colors duration-300 hover:border-accent-gold/40 sm:px-6 sm:py-4 sm:text-base"
                >
                  <GirihStar
                    className="h-3.5 w-3.5 text-accent-gold/60 transition-transform duration-500 group-hover:rotate-45"
                    strokeWidth={8}
                  />
                  {track}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ JARAYON ============ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Jarayon"
              title="Qanday ishtirok etaman?"
              description="Ro'yxatdan o'tishdan g'alabagacha — butun yo'l to'rtta aniq qadamdan iborat."
            />
          </Reveal>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-[22px] hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block"
            />
            {PROCESS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="relative z-10 mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.12] bg-[#10142c] text-accent-violet">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent-gold/70">
                    0{i + 1}
                  </p>
                  <h3 className="font-display text-base font-bold text-text-primary sm:text-lg">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============ YAKUNIY CTA ============ */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0d1126] px-6 py-14 text-center sm:px-10 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2"
              >
                <GirihStar className="h-full w-full text-white/[0.03]" strokeWidth={0.6} />
              </div>
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-0 h-64 w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-violet/[0.14] blur-[90px]"
              />

              <div className="relative">
                <p className="mb-4 flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent-gold/80 sm:text-xs">
                  <GirihStar className="h-3 w-3" strokeWidth={8} />
                  Arizalar ochiq
                  <GirihStar className="h-3 w-3" strokeWidth={8} />
                </p>
                <h2 className="mx-auto max-w-2xl font-display text-2xl font-bold text-text-primary sm:text-[34px] sm:leading-[1.15] md:text-[40px]">
                  G&apos;oyangiz bor bo&apos;lsa — o&apos;rningiz tayyor.
                  Tarmoqqa qo&apos;shiling.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
                  Ariza topshirish bepul va 5 daqiqa vaqt oladi. Natijalar haqidagi barcha
                  yangiliklar Telegram kanalimizda e&apos;lon qilinadi.
                </p>
                <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="group h-12 w-full rounded-lg text-sm font-semibold sm:h-[52px] sm:w-auto sm:px-8 sm:text-base"
                  >
                    <Link href="/ideaton/ariza">
                      Hoziroq ariza topshirish
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-lg text-sm sm:h-[52px] sm:w-auto sm:px-8 sm:text-base"
                  >
                    <a href={TELEGRAM_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4" />
                      Telegram kanalga obuna
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <GirihDivider className="mb-8" />
        <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-display text-sm font-bold tracking-[0.12em] text-text-primary">
              NEXUS<span className="text-accent-violet">30</span>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              © {new Date().getFullYear()} NEXUS30 · Olmazor tumani. Barcha huquqlar
              himoyalangan.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 text-xs text-text-muted sm:flex-row sm:gap-6">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-text-primary"
            >
              <Send className="h-3.5 w-3.5" />
              {TELEGRAM_CHANNEL_HANDLE}
            </a>
            <Link href="/login" className="transition-colors hover:text-text-primary">
              Tashkilotchi / Volontyor kirishi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
