"use client";
import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  type LanguageCode,
} from "./languages";

const STORAGE_KEY = "resume.ai.preferredLanguage";

/**
 * Tiny client-side language preference store.
 *
 * Reads/writes localStorage. Does NOT translate the UI — the current
 * MVP only translates resume *content* (workspace action). The hook
 * exists so the language switcher in SiteNav has a backing store and
 * so the workspace's translate dropdown can pre-select the user's
 * preference.
 *
 * SSR-safe: returns DEFAULT_LANGUAGE on the server (no localStorage).
 * On first client paint we read from storage and re-render with the
 * persisted value. The lag is invisible (no UI is actually translated
 * yet) but keeps the contract honest for when we add real i18n.
 */
export function useLanguage() {
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null)
        : null;
    if (stored && LANGUAGES.some((l) => l.code === stored)) {
      setLanguageState(stored);
    }
    setHydrated(true);
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  return { language, setLanguage, hydrated };
}
