/**
 * Central language registry for resume translation.
 *
 * Each entry is what we expose to the user (label, native name shown
 * in their own script) plus what we hand to the AI as the canonical
 * target name. The `aiName` is the form Sonnet handles most reliably —
 * "Spanish" not "Español", "Brazilian Portuguese" not "pt-BR".
 *
 * Section heading translations are pre-baked here rather than relying
 * on the AI alone — these are short, high-frequency strings and the
 * deterministic mapping avoids edge cases like "Education" rendering
 * as "Académica" in one card and "Educación" in another.
 */
export type LanguageCode = "en" | "es" | "pt" | "fr" | "de";

export type LanguageDef = {
  code: LanguageCode;
  // What we show in the switcher (English).
  label: string;
  // The same name in the language itself (shown next to the label).
  nativeName: string;
  // Two-letter flag-style indicator (kept ASCII for ATS-friendly).
  badge: string;
  // What we pass to Sonnet as the target language name.
  aiName: string;
};

export const LANGUAGES: LanguageDef[] = [
  {
    code: "en",
    label: "English",
    nativeName: "English",
    badge: "EN",
    aiName: "English",
  },
  {
    code: "es",
    label: "Spanish",
    nativeName: "Español",
    badge: "ES",
    aiName: "Spanish",
  },
  {
    code: "pt",
    label: "Portuguese",
    nativeName: "Português",
    badge: "PT",
    aiName: "Brazilian Portuguese",
  },
  {
    code: "fr",
    label: "French",
    nativeName: "Français",
    badge: "FR",
    aiName: "French",
  },
  {
    code: "de",
    label: "German",
    nativeName: "Deutsch",
    badge: "DE",
    aiName: "German",
  },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function getLanguage(code: LanguageCode): LanguageDef {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

// Resume section heading translations. The AI handles bullet content
// translation; these short strings get deterministic mappings so the
// "Experience" → "Experiencia" / "Erfahrung" / etc. is always
// consistent across cards. Resumes commonly only use these few
// headings; rare custom ones (e.g. "Distributed Systems") fall through
// to AI translation.
export const SECTION_HEADING_TRANSLATIONS: Record<
  LanguageCode,
  Record<string, string>
> = {
  en: {
    education: "Education",
    experience: "Experience",
    "additional information": "Additional Information",
    skills: "Skills",
    projects: "Projects",
  },
  es: {
    education: "Educación",
    experience: "Experiencia",
    "additional information": "Información Adicional",
    skills: "Habilidades",
    projects: "Proyectos",
  },
  pt: {
    education: "Educação",
    experience: "Experiência",
    "additional information": "Informações Adicionais",
    skills: "Habilidades",
    projects: "Projetos",
  },
  fr: {
    education: "Formation",
    experience: "Expérience",
    "additional information": "Informations Complémentaires",
    skills: "Compétences",
    projects: "Projets",
  },
  de: {
    education: "Ausbildung",
    experience: "Berufserfahrung",
    "additional information": "Weitere Informationen",
    skills: "Fähigkeiten",
    projects: "Projekte",
  },
};
