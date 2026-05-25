"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LANGUAGES, type LanguageCode } from "@/lib/i18n/languages";
import { useLanguage } from "@/lib/i18n/useLanguage";

/**
 * Top-right language switcher. Globe icon + 2-letter badge, opens to a
 * dropdown of supported languages with their native names.
 *
 * MVP scope: this sets a localStorage preference that drives the
 * workspace's "Translate resume" default + future resume generations.
 * The marketing UI strings themselves stay English for now — full UI
 * i18n is a separate, larger lift.
 */
export function LanguageSwitcher() {
  const { language, setLanguage, hydrated } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click and on Escape so the menu behaves like a
  // native control without a portal/Popover dep.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Skeleton placeholder during hydration so the nav layout doesn't
  // shift when the persisted language code arrives a tick later.
  if (!hydrated) {
    return <span className="h-8 w-16" aria-hidden="true" />;
  }

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  const choose = (code: LanguageCode) => {
    setLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${current.label}. Click to change.`}
        onClick={() => setOpen((o) => !o)}
        className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-3 text-[13px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B]"
      >
        <Globe className="size-3.5" aria-hidden="true" />
        <span className="tabular-nums">{current.badge}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[#D2D2D7]/80 bg-white shadow-card-xl"
        >
          {LANGUAGES.map((lang) => {
            const isActive = lang.code === language;
            return (
              <li key={lang.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => choose(lang.code)}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-[#F5F5F7] ${
                    isActive ? "text-[#1D1D1F]" : "text-[#1D1D1F]"
                  }`}
                >
                  <span className="flex flex-col">
                    <span className="font-medium leading-tight">
                      {lang.nativeName}
                    </span>
                    <span className="text-[12px] leading-tight text-[#86868B]">
                      {lang.label}
                    </span>
                  </span>
                  {isActive && (
                    <Check
                      className="size-4 shrink-0 text-[#3B82F6]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
