"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ResumeData, KeywordAnalysis } from "./types";

interface ResumeContextValue {
  resume: ResumeData | null;
  matchScore: number | null;
  keywords: KeywordAnalysis | null;
  updateResume: (data: ResumeData) => void;
  updateTailoring: (score: number, keywords: KeywordAnalysis) => void;
  clearTailoring: () => void;
}

const ResumeContext = createContext<ResumeContextValue | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [keywords, setKeywords] = useState<KeywordAnalysis | null>(null);

  const updateResume = useCallback((data: ResumeData) => {
    setResume(data);
  }, []);

  const updateTailoring = useCallback(
    (score: number, kw: KeywordAnalysis) => {
      setMatchScore(score);
      setKeywords(kw);
    },
    []
  );

  const clearTailoring = useCallback(() => {
    setMatchScore(null);
    setKeywords(null);
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resume,
        matchScore,
        keywords,
        updateResume,
        updateTailoring,
        clearTailoring,
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
