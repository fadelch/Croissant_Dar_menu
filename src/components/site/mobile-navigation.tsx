"use client";

import { useEffect, useState } from "react";

type MobileNavigationLink = {
  href: string;
  label: string;
};

type MobileNavigationProps = {
  links: MobileNavigationLink[];
  navigationLabel: string;
  openLabel: string;
  closeLabel: string;
};

export function MobileNavigation({
  links,
  navigationLabel,
  openLabel,
  closeLabel,
}: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-site-navigation"
        aria-label={isOpen ? closeLabel : openLabel}
        onClick={() => setIsOpen((current) => !current)}
        className="grid size-11 place-items-center rounded-full border border-brown-900/15 bg-white text-brown-900 transition-colors hover:bg-cream-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
      >
        <span aria-hidden="true" className="relative block h-4 w-5">
          <span
            className={`absolute start-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform ${
              isOpen ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute start-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-opacity ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute start-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition-transform ${
              isOpen ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <nav
          id="mobile-site-navigation"
          aria-label={navigationLabel}
          className="absolute inset-x-0 top-full border-y border-brown-900/10 bg-cream-50 px-5 py-5 shadow-xl shadow-brown-900/10"
        >
          <ul className="mx-auto grid w-full max-w-7xl gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-12 items-center justify-between rounded-xl px-4 text-base font-bold text-brown-900 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-caramel-500"
                >
                  {link.label}
                  <span aria-hidden="true">↓</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
