/**
 * NEXUS30 ambient background: circuit-board traces fused with an Uzbek
 * girih (geometric lattice) motif. Kept extremely subtle (4-6% opacity)
 * so it never competes with foreground content.
 */
export function BackgroundPattern() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <svg
        className="h-full w-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="nexus-lattice"
            width="180"
            height="180"
            patternUnits="userSpaceOnUse"
          >
            {/* Girih-inspired rotated square lattice */}
            <rect
              x="20"
              y="20"
              width="140"
              height="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              transform="rotate(45 90 90)"
              className="text-ivory"
            />
            <rect
              x="55"
              y="55"
              width="70"
              height="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              transform="rotate(45 90 90)"
              className="text-teal"
            />

            {/* Circuit-board traces: right-angled lines connecting nodes */}
            <path
              d="M0 90 H55 V30 H180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-violet"
            />
            <path
              d="M90 0 V55 H150 V180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-ivory"
            />

            {/* Nodes */}
            <circle cx="90" cy="90" r="3" fill="currentColor" className="text-violet" />
            <circle cx="55" cy="30" r="2" fill="currentColor" className="text-ivory" />
            <circle cx="150" cy="55" r="2" fill="currentColor" className="text-teal" />
            <circle cx="0" cy="90" r="2" fill="currentColor" className="text-ivory" />
            <circle cx="90" cy="180" r="2" fill="currentColor" className="text-ivory" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nexus-lattice)" />
      </svg>
    </div>
  );
}
