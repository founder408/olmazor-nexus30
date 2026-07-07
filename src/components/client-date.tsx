"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";

/**
 * Renders a formatted date/time, but only after mounting on the client.
 *
 * `Intl.DateTimeFormat` can produce slightly different strings on the
 * server (Node's ICU data) vs. the browser (Chromium's ICU data) for the
 * same Date value. When such text is part of server-rendered props (e.g.
 * `initialRows` passed from a Server Component), this causes a React
 * hydration mismatch. Deferring the formatted text to a post-mount effect
 * guarantees the server HTML and the first client render both show the
 * placeholder, avoiding the mismatch entirely.
 */
export function ClientDate({ iso }: { iso: string | null }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    setText(formatDateTime(iso));
  }, [iso]);

  return <>{text ?? "…"}</>;
}
