# ResumeAI — AI-Powered Resume Generator

**Date:** 2026-02-25
**Status:** Approved

## Overview

A full-stack web application that lets users generate professional, ATS-friendly resumes through a conversational AI interface. Users chat with Claude, which guides them through providing their information, writes strong quantified bullet points, and produces a polished `.docx` download. A live preview updates in real-time as the resume takes shape.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stack | Next.js 15 full-stack | Single deployable unit, App Router + Server Actions |
| AI | Anthropic Claude API | Best writing quality for resume content |
| Auth | None (open access) | Fastest time-to-value, rate limit by IP |
| UI Flow | Chat + Live Preview (split screen) | Best UX — users see resume forming in real-time |
| DOCX Generation | `docx` npm package (server-side) | Proven template from reference files |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, professional look |

## Architecture

### Data Flow

```
User types message
  → POST /api/chat (streaming)
  → Claude processes message + current resume state
  → Returns structured output:
      1. Chat reply (streamed to chat panel)
      2. Updated resume JSON (parsed → updates preview)
  → On "Download" click:
      → POST /api/generate-docx
      → Server builds .docx from resume JSON
      → Returns file for download
```

### Resume Data Model

```typescript
interface ResumeData {
  name: string;
  contactLine1: string;
  contactLine2?: string;
  education: {
    institution: string;
    location: string;
    degree: string;
    date: string;
    gpa?: string;
    details?: string[];
  }[];
  experienceSections: {
    heading: string;
    entries: {
      company: string;
      companyNote?: string;
      location: string;
      roles: {
        title: string;
        date: string;
        bullets: string[];
      }[];
    }[];
  }[];
  additionalInfo: string[];
}
```

This maps directly to the `resumeData` object in the docx-template reference — the preview and the .docx generator share the same data shape.

### Project Structure

```
app/
├── page.tsx                    # Landing / hero page
├── builder/
│   └── page.tsx                # Main app — chat + preview split view
├── api/
│   ├── chat/route.ts           # Streaming chat endpoint (Claude API)
│   └── generate-docx/route.ts  # DOCX generation endpoint
├── layout.tsx                  # Root layout
├── globals.css                 # Tailwind globals

components/
├── chat/
│   ├── ChatPanel.tsx           # Chat interface
│   ├── MessageBubble.tsx       # Individual message
│   ├── ChatInput.tsx           # Text input
│   └── JobDescriptionPanel.tsx # JD paste + tailor button
├── resume/
│   ├── ResumePreview.tsx       # Live HTML preview
│   ├── ResumeHeader.tsx        # Name + contact
│   ├── ResumeSection.tsx       # Education, experience sections
│   └── ResumeBullet.tsx        # Bullet point
├── layout/
│   ├── SplitLayout.tsx         # Two-panel responsive layout
│   └── Navbar.tsx              # Top bar with download button
└── ui/                         # shadcn/ui primitives

lib/
├── ai/
│   ├── client.ts               # Anthropic SDK setup
│   ├── prompts.ts              # System prompts with resume guide
│   └── parse-response.ts       # Extract chat reply + resume JSON
├── docx/
│   └── generate.ts             # DOCX generation (from template)
├── resume/
│   ├── types.ts                # ResumeData TypeScript types
│   └── context.tsx             # React Context for resume state
└── utils.ts                    # Shared utilities
```

## AI Strategy

### System Prompt

The Claude API system prompt embeds:
- The full resume content guide (action verbs, bullet formula, quantification)
- The current resume JSON state
- Instructions to return both conversational reply AND structured resume JSON updates

### Behavior

1. **Guided questioning**: Claude asks for info section by section (contact → education → experience → skills)
2. **Strong bullet writing**: Applies the action verb + what + context + result formula
3. **Structured output**: Every response includes a JSON block with the updated resume data
4. **Job description tailoring**: When a JD is provided, Claude extracts keywords, mirrors language, reorders bullets

### Structured Output Format

Claude returns responses with a JSON block containing:
- `resumeData`: The full updated resume data object
- `matchScore`: (when JD provided) 0-100 alignment score
- `keywords`: (when JD provided) { found: string[], missing: string[] }

## Job Description Tailoring

### UI

A collapsible panel below the chat input:
- Textarea for pasting a job description
- "Tailor Resume" button
- After tailoring: match score badge + keyword checklist on the preview panel

### Behavior

When a JD is submitted:
1. Claude analyzes the JD for hard skills, qualifications, repeated themes
2. Rewrites/reorders bullets to mirror JD language
3. Adjusts skills section to prioritize JD keywords
4. Returns match score and keyword analysis
5. Preview updates with tailored content + match indicators

## Pages

### Landing Page (`/`)
- Hero section with value prop headline
- "Start Building" CTA → `/builder`
- Feature highlights: AI-powered, ATS-friendly, instant .docx, job tailoring

### Builder Page (`/builder`)
- Split-screen: chat (left 40%) + preview (right 60%)
- Navbar with app name + Download button
- Job description panel (collapsible, below chat)

## Responsive Design

- **Desktop (>1024px)**: Side-by-side chat + preview
- **Tablet (768-1024px)**: Tabbed view — toggle between chat and preview
- **Mobile (<768px)**: Chat-first with floating "Preview" button

## DOCX Generation

Uses the exact template from `docx-template.md`:
- Times New Roman throughout
- 10pt body, 14pt name, 11pt section headers
- Table-based two-column layout (83% content / 17% dates)
- Section dividers with thin horizontal rules
- Proper bullet points via LevelFormat.BULLET
- US Letter, 0.5" margins
- Target: single page

## Rate Limiting

- IP-based rate limiting on `/api/chat` and `/api/generate-docx`
- Limit: ~20 chat messages per session, ~5 docx downloads per hour
- Use `next-rate-limit` or similar lightweight solution

## Non-Goals (YAGNI)

- User accounts / authentication
- Database / resume persistence (session-only)
- PDF export (docx only)
- Resume templates / themes (single professional template)
- File upload parsing (v1 is text/chat input only)
- Payment / monetization
