"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  localeCookieMaxAgeSeconds,
  localeCookieName,
  type Locale,
} from "@/i18n/routing";

type LanguageSwitcherProps = {
  targetLocale: Locale;
  label: string;
  accessibleLabel: string;
};

export function LanguageSwitcher({ targetLocale, label, accessibleLabel }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLanguage() {
    const secureAttribute = window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${localeCookieName}=${targetLocale}; Path=/; Max-Age=${localeCookieMaxAgeSeconds}; SameSite=Lax${secureAttribute}`;
    startTransition(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={switchLanguage}
      disabled={isPending}
      aria-label={accessibleLabel}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-caramel-400/40 bg-white/50 px-4 py-2 text-xs font-bold text-brown-700 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 disabled:cursor-wait disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
