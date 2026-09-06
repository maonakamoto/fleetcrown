"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { APP_SLUG } from "@/config/brand";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      // `class` drives Tailwind's dark: variants; `data-theme` is the fleet
      // convention bip-kit's styles.css keys its dark scopes on (shiki token
      // colors, callout palettes). Both mirror the same resolved theme.
      attribute={["class", "data-theme"]}
      // Dark-first brand (x.ai / grok / SpaceX language). Users who haven't
      // explicitly picked a theme get dark instead of following the OS — the
      // Settings → Appearance toggle (incl. System) still overrides per-user.
      defaultTheme="dark"
      enableSystem={true}
      storageKey={`${APP_SLUG}-theme`}
    >
      {children}
    </NextThemesProvider>
  );
}
