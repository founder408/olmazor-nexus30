"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  ScanLine,
  Lightbulb,
  Code2,
  Rocket,
  Users,
  FileText,
  CalendarClock,
  UserCog,
  Settings,
  Download,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

type NavItem = { href: string; label: string; icon: LucideIcon; roles: string[] };
type NavGroup = { title?: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  {
    items: [
      {
        href: "/volunteer/checkin",
        label: "Check-in",
        icon: ScanLine,
        roles: ["volunteer", "organizer", "admin"],
      },
      {
        href: "/organizer/dashboard",
        label: "Statistika",
        icon: LayoutDashboard,
        roles: ["organizer", "admin"],
      },
    ],
  },
  {
    title: "Arizalar",
    items: [
      { href: "/organizer/ideaton", label: "Ideaton", icon: Lightbulb, roles: ["organizer", "admin"] },
      { href: "/organizer/hakaton", label: "Hakaton", icon: Code2, roles: ["organizer", "admin"] },
      {
        href: "/organizer/startup",
        label: "Startup Kuni",
        icon: Rocket,
        roles: ["organizer", "admin"],
      },
    ],
  },
  {
    title: "Boshqaruv",
    items: [
      {
        href: "/organizer/volunteers",
        label: "Volontyorlar",
        icon: Users,
        roles: ["organizer", "admin"],
      },
      {
        href: "/organizer/submissions",
        label: "Taqdimotlar",
        icon: FileText,
        roles: ["organizer", "admin"],
      },
    ],
  },
  {
    title: "Admin",
    items: [
      {
        href: "/admin/submissions",
        label: "Deadline yaratish",
        icon: CalendarClock,
        roles: ["admin"],
      },
      { href: "/admin/users", label: "Foydalanuvchilar", icon: UserCog, roles: ["admin"] },
      { href: "/admin/settings", label: "Sozlamalar", icon: Settings, roles: ["admin"] },
      { href: "/admin/export-all", label: "Export All", icon: Download, roles: ["admin"] },
    ],
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent-violet to-accent-teal font-display text-sm font-bold text-white">
        N
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-text-primary">
        NEXUS30
      </span>
    </Link>
  );
}

function NavLinks({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
      {groups.map((group, i) => (
        <div key={group.title ?? i}>
          {group.title && (
            <p className="mb-1.5 px-3 font-mono text-[10px] font-medium uppercase tracking-wider text-text-muted/70">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((link) => {
              const active = isActive(pathname, link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-violet/15 text-accent-violet"
                      : "text-text-muted hover:bg-white/5 hover:text-text-primary"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function DashboardNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const role = session?.user?.role ?? "volunteer";
  const groups = GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((l) => l.roles.includes(role)),
  })).filter((g) => g.items.length > 0);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/5 bg-[#0d1024]/95 backdrop-blur lg:flex">
        <div className="flex h-16 flex-shrink-0 items-center px-5">
          <Logo />
        </div>
        <NavLinks groups={groups} pathname={pathname} />
        <div className="flex-shrink-0 border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {session?.user?.name}
              </p>
              <p className="font-mono text-xs text-text-muted">{ROLE_LABELS[role]}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Chiqish"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/5 bg-background/90 px-4 backdrop-blur sm:px-6 lg:hidden">
        <Logo />
        <button
          className="rounded-lg p-2 text-text-primary"
          onClick={() => setOpen(true)}
          aria-label="Menyu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-white/5 bg-[#0d1024]">
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-5">
              <Logo />
              <button
                className="rounded-lg p-2 text-text-primary"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks groups={groups} pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="flex-shrink-0 border-t border-white/5 p-4">
              <div className="mb-2">
                <p className="truncate text-sm font-medium text-text-primary">
                  {session?.user?.name}
                </p>
                <p className="font-mono text-xs text-text-muted">{ROLE_LABELS[role]}</p>
              </div>
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-danger hover:bg-danger/10"
                onClick={() => {
                  setOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
              >
                <LogOut className="h-4 w-4" />
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
