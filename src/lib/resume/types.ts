export interface Role {
  title: string;
  date: string;
  bullets: string[];
}

export interface ExperienceEntry {
  company: string;
  companyNote?: string;
  location: string;
  roles: Role[];
}

export interface ExperienceSection {
  heading: string;
  entries: ExperienceEntry[];
}

export interface Education {
  institution: string;
  location: string;
  degree: string;
  date: string;
  gpa?: string;
  details?: string[];
}

export interface ResumeData {
  name: string;
  contactLine1: string;
  contactLine2?: string;
  education: Education[];
  experienceSections: ExperienceSection[];
  additionalInfo: string[];
}

export interface KeywordAnalysis {
  found: string[];
  missing: string[];
}

export interface ChatResponseMeta {
  resumeData?: ResumeData;
  matchScore?: number;
  keywords?: KeywordAnalysis;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  meta?: ChatResponseMeta;
}
