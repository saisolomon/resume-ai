"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type { ResumeData, KeywordAnalysis } from "./types";

interface ResumeContextValue {
  resume: ResumeData | null;
  resumeId: string | null;
  templateId: string;
  matchScore: number | null;
  keywords: KeywordAnalysis | null;
  isSaving: boolean;
  lastSavedAt: Date | null;
  updateResume: (data: ResumeData) => void;
  updateTailoring: (score: number, keywords: KeywordAnalysis) => void;
  clearTailoring: () => void;
  setTemplateId: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextValue | null>(null);

interface ResumeProviderProps {
  children: ReactNode;
  resumeId?: string | null;
  initialData?: ResumeData | null;
  initialTemplateId?: string;
}

export function ResumeProvider({
  children,
  resumeId: propResumeId = null,
  initialData = null,
  initialTemplateId = "classic",
}: ResumeProviderProps) {
  const [resume, setResume] = useState<ResumeData | null>(initialData);
  const [resumeId] = useState<string | null>(propResumeId);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<KeywordAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save: debounced PUT when resumeId is present
  const saveToDb = useCallback(
    async (data: ResumeData, tid: string) => {
      if (!resumeId) return;
      setIsSaving(true);
      try {
        await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data, templateId: tid }),
        });
        setLastSavedAt(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setIsSaving(false);
      }
    },
    [resumeId],
  );

  const updateResume = useCallback(
    (data: ResumeData) => {
      setResume(data);

      // Debounced auto-save for persistent mode
      if (resumeId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          saveToDb(data, templateId);
        }, 2000);
      }
    },
    [resumeId, templateId, saveToDb],
  );

  const handleSetTemplateId = useCallback(
    (id: string) => {
      setTemplateId(id);
      if (resumeId && resume) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          saveToDb(resume, id);
        }, 2000);
      }
    },
    [resumeId, resume, saveToDb],
  );

  const updateTailoring = useCallback(
    (score: number, kw: KeywordAnalysis) => {
      setMatchScore(score);
      setKeywords(kw);
    },
    [],
  );

  const clearTailoring = useCallback(() => {
    setMatchScore(null);
    setKeywords(null);
  }, []);

  // Cleanup pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        resumeId,
        templateId,
        matchScore,
        keywords,
        isSaving,
        lastSavedAt,
        updateResume,
        updateTailoring,
        clearTailoring,
        setTemplateId: handleSetTemplateId,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return ctx;
}
