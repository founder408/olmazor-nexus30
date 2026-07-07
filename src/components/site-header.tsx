"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TELEGRAM_CHANNEL_HANDLE, TELEGRAM_CHANNEL_URL } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/#bosqichlar", label: "Bosqichlar" },
  { href: "/ideaton/ariza", label: "Ideaton" },
  { href: "/startup/ariza", label: "AI Startup Kuni" },
];

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group relative flex min-w-0 items-center gap-2 sm:gap-2.5">
      <span className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-teal font-display text-xs font-bold text-white transition-transform duration-300 group-hover:scale-105">
        N
      </span>
      <span className="truncate font-display text-sm font-bold tracking-tight text-text-primary sm:text-[15px]">
        NEXUS30
      </span>
    </Link>
  );
}

function ShineCta({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/ideaton/ariza"
      onClick={onClick}
      className={cn(
        "group relative inline-flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-accent-violet to-[#6247e0] px-4 text-sm font-medium text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_16px_-4px_rgba(124,92,255,0.6)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] sm:h-9 sm:w-auto",
        className
      )}
    >
      <span className="relative z-10">Ariza topshirish</span>
      <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 animate-shine-sweep bg-white/25 blur-sm" />
    </Link>
  );
}

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] lg:hidden"
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Mobil menyu"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Menyuni yopish"
      />

      <div className="absolute inset-y-0 right-0 flex w-[min(100%,20rem)] flex-col border-l border-white/10 bg-[#0b0e1f] shadow-2xl">
        <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 sm:h-16">
          <Logo onClick={onClose} />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-text-primary"
            onClick={onClose}
            aria-label="Menyuni yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <p className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-wider text-text-muted/70">
            Navigatsiya
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block rounded-xl px-3 py-3.5 text-base font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl px-3 py-3.5 text-base font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-accent-teal"
          >
            <Send className="h-4 w-4" />
            {TELEGRAM_CHANNEL_HANDLE}
          </a>
        </nav>

        <div className="flex-shrink-0 space-y-3 border-t border-white/10 p-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
          >
            Kirish
          </Link>
          <ShineCta onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const closeMenu = useCallback(() => setOpen(false), []);
  const toggleMenu = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  const docked = scrolled || open;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 w-full">
        <div
          className={cn(
            "mx-auto transition-[max-width,padding] duration-300 ease-out",
            docked ? "max-w-4xl px-3 pt-2 sm:px-4 sm:pt-3" : "max-w-7xl px-4 pt-3 sm:px-6 sm:pt-4 lg:px-8"
          )}
        >
          <div
            className={cn(
              "relative rounded-2xl transition-all duration-300 ease-out",
              docked
                ? "bg-gradient-to-r from-accent-violet/40 via-white/10 to-accent-teal/40 p-px shadow-[0_12px_40px_-14px_rgba(0,0,0,0.75)]"
                : "border border-white/5 bg-[#0b0e1f]/40 p-px backdrop-blur-md"
            )}
          >
            <div
              className={cn(
                "flex h-14 items-center justify-between gap-3 rounded-[15px] px-3 transition-all duration-300 ease-out sm:h-16 sm:px-5",
                docked ? "bg-[#0b0e1f]/90 backdrop-blur-xl" : "bg-[#0b0e1f]/80 backdrop-blur-lg"
              )}
            >
              <Logo onClick={closeMenu} />

              <nav className="relative hidden items-center gap-0.5 lg:flex">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3 py-2 text-sm font-medium text-text-muted transition-colors duration-200 hover:bg-white/[0.07] hover:text-text-primary xl:px-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="hidden items-center gap-2 lg:flex xl:gap-3">
                <a
                  href={TELEGRAM_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 text-sm font-medium text-text-muted transition-colors hover:text-accent-teal"
                  aria-label="Telegram kanal"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{TELEGRAM_CHANNEL_HANDLE}</span>
                </a>
                <Link
                  href="/login"
                  className="px-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Kirish
                </Link>
                <ShineCta />
              </div>

              <button
                type="button"
                className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-text-primary lg:hidden"
                onClick={toggleMenu}
                aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
                aria-expanded={open}
                aria-controls="mobile-nav"
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fixed navbar uchun joy — kontent ostiga kirib ketmasin */}
      <div aria-hidden className="h-[4.75rem] sm:h-[5.25rem]" />

      {mounted && createPortal(<MobileMenu open={open} onClose={closeMenu} />, document.body)}
    </>
  );
}
