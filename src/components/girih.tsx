import { cn } from "@/lib/utils";

/**
 * Sakkiz qirrali girih yulduzi — ikki kvadratning kesishmasi (rub-el-hizb).
 * O'zbek me'moriy naqshlarining eng tanish elementi; sayt bo'ylab
 * ajratgich, bullet va orqa fon bezagi sifatida ishlatiladi.
 */
export function GirihStar({
  className,
  strokeWidth = 5,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={cn("h-4 w-4", className)}>
      <rect
        x="18"
        y="18"
        width="64"
        height="64"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <rect
        x="18"
        y="18"
        width="64"
        height="64"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        transform="rotate(45 50 50)"
      />
    </svg>
  );
}

/** Ikki chiziq orasidagi girih yulduzli gorizontal ajratgich */
export function GirihDivider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-white/[0.07]" />
      <GirihStar className="h-3 w-3 text-accent-gold/60" strokeWidth={7} />
      <span className="h-px flex-1 bg-white/[0.07]" />
    </div>
  );
}
