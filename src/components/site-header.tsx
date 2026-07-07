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
    <Link
      href="/"
      onClick={onClick}
      className="flex min-w-0 items-center gap-3"
      aria-label="NEXUS30 — bosh sahifa"
    >
      <span className="font-display text-[15px] font-bold tracking-[0.12em] text-text-primary sm:text-base">
        NEXUS<span className="text-accent-violet">30</span>
      </span>
      <span aria-hidden className="hidden h-4 w-px bg-white/15 md:block" />
      <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-text-muted md:block">
        Olmazor
      </span>
    </Link>
  );
}

function HeaderCta({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/ideaton/ariza"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent-violet px-4 text-sm font-semibold text-white transition-colors hover:bg-[#6b4de6]",
        className
      )}
    >
      Ariza topshirish
      <ArrowRight className="h-3.5 w-3.5" />
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
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Logo onClick={onClose} />
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-text-primary transition-colors hover:bg-white/5"
            onClick={onClose}
            aria-label="Menyuni yopish"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <p className="mb-2 px-3 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-text-muted/70">
            Navigatsiya
          </p>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="block rounded-lg px-3 py-3.5 text-base font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-3.5 text-base font-medium text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <Send className="h-4 w-4" />
            {TELEGRAM_CHANNEL_HANDLE}
          </a>
        </nav>

        <div className="flex-shrink-0 space-y-3 border-t border-white/10 p-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-lg border border-white/15 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
          >
            Kirish
          </Link>
          <HeaderCta className="h-11 w-full" onClick={onClose} />
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
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 w-full border-b transition-all duration-300",
          scrolled || open
            ? "border-white/[0.08] bg-[#0b0e1f]/95 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            : "border-white/[0.04] bg-[#0b0e1f]/70 backdrop-blur-md"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
          <Logo onClick={closeMenu} />

          <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-muted transition-colors duration-200 hover:text-text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-1 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
              aria-label="Telegram kanal"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden xl:inline">{TELEGRAM_CHANNEL_HANDLE}</span>
            </a>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/15 px-4 text-sm font-medium text-text-primary transition-colors hover:bg-white/5"
            >
              Kirish
            </Link>
            <HeaderCta />
          </div>

          <button
            type="button"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 text-text-primary transition-colors hover:bg-white/5 lg:hidden"
            onClick={toggleMenu}
            aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Fixed navbar uchun joy — kontent ostiga kirib ketmasin */}
      <div aria-hidden className="h-16 lg:h-[4.5rem]" />

      {mounted && createPortal(<MobileMenu open={open} onClose={closeMenu} />, document.body)}
    </>
  );
}
