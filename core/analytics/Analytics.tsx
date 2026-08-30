"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "./client";

/** First-party aggregate page measurement. It renders no script, cookie or identifier. */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => { void track("page_view", {}, { pathname }); }, [pathname]);
  return null;
}
