import type { Locale } from "@/i18n/routing";

type LanguageSwitcherProps = {
  targetLocale: Locale;
  label: string;
  accessibleLabel: string;
};

export function LanguageSwitcher({ targetLocale, label, accessibleLabel }: LanguageSwitcherProps) {
  return (
    <form action="/api/locale" method="get">
      <input type="hidden" name="locale" value={targetLocale} />
      <input type="hidden" name="returnTo" value="/" />
      <button
        type="submit"
        aria-label={accessibleLabel}
        className="inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-2 rounded-full border border-caramel-400/40 bg-white/50 px-3 py-2 text-xs font-bold text-brown-700 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500 min-[480px]:px-4"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
        <span className="hidden min-[480px]:inline">{label}</span>
      </button>
    </form>
  );
}
