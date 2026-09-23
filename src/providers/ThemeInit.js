"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

/** Syncs the Zustand theme store to whatever the blocking inline script in
 * app/layout.js already applied to the DOM. Renders nothing. */
export function ThemeInit() {
  const hydrate = useThemeStore((state) => state.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
