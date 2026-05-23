# resume.ai Design System
> An insurgent, editorial AI resume tool for technical job-seekers. Sharp, dark, restrained — built like a developer tool, voiced like a manifesto.

---

## Brand DNA

- **Mission**: Help engineers, PMs, and data scientists land interviews by generating four real, ATS-scored, JD-tailored resume designs from one job posting in under 30 seconds — instead of forcing them through the LinkedIn/Indeed/ZipRecruiter template factory.
- **Audience**: Mid-to-senior technical ICs (eng / PM / DS) who already write good resumes but lose hours retailoring them per application. They want a tool that respects their judgment — not one that "AI-generates" generic content.
- **Archetype**: **Developer Tool**. Near-black UI, dense information hierarchy, code-editor typography, semantic color used sparingly. Calibrated to feel like Linear, Vercel, Stripe Dashboard — not a SaaS marketing site.
- **Voice**: **Insurgent. Direct. Technical.** One sentence: "We build for people who'd rather rewrite their resume four times than send the same one twice — but who've finally realized that's a job for software."
- **Anti-patterns** (explicitly NOT this brand):
  - No "AI magic" / "supercharge your career" / "10x your search" language. We say what the tool does.
  - No gradients on text, no glassmorphism, no glow shadows, no animated background blobs.
  - No fake urgency. No "limited time" stickers, no fake countdowns, no manufactured scarcity.
  - No serif display fonts. No editorial-magazine-coded layouts. We are a tool, not a publication.
  - No emoji in product copy. (Status icons from the icon set are fine.)

---

## Color System

### Primary Palette

All colors are exact hex. Defaults match what the v2 codebase already uses; the rest are precision additions.

| Role | Name | Hex | Tailwind Utility | Usage |
|---|---|---|---|---|
| Background — Base | Ink | `#000000` | `bg-black` | Page background. Pure black for OLED + maximum contrast against typography. |
| Background — Card | Stone-950 | `#0A0A0A` | `bg-neutral-950` | Card surfaces, modal sheets, nav bars. One step lighter than Ink so cards visibly separate from the page. |
| Background — Card Hover | Stone-900 | `#171717` | `bg-neutral-900` | Card hover. Hairline lift, no shadow. |
| Border — Primary | Stone-800 | `#262626` | `border-neutral-800` | Default card borders, dividers, input outlines. Always 1px, never thicker. |
| Border — Strong | Stone-700 | `#404040` | `border-neutral-700` | Hover-state borders, focus rings (subtle). |
| Text — Primary | Stone-50 | `#FAFAFA` | `text-white` | Headlines, body copy. Off-white-ish — pure `#FFF` is too harsh against the deep black bg. |
| Text — Secondary | Stone-400 | `#A3A3A3` | `text-neutral-400` | Subheads, body-secondary, metadata. |
| Text — Tertiary | Stone-500 | `#737373` | `text-neutral-500` | Captions, timestamps, "say-nothing" UI text. |
| Text — Disabled | Stone-600 | `#525252` | `text-neutral-600` | Form labels in disabled state, placeholders. |
| Brand Accent | White | `#FFFFFF` | `bg-white text-black` | CTAs, "Most popular" badge, anchor states. The brand "accent" is the inversion — pure white surface against black. |

### Semantic / Score Palette

These map directly to `ScoreBadge` and run through every ATS surface in the product. They are **the only** colored UI on a black canvas — they have meaning. Treat them like syntax highlighting, not decoration.

| Role | Name | Hex | Tailwind Utility | Usage |
|---|---|---|---|---|
| Score — Strong (≥85) | Match Green | `#16A34A` | `bg-green-600` | ATS scores in the "ready" band, success states, "ready" pills on cards. |
| Score — Caution (70–84) | Caution Amber | `#D97706` | `bg-amber-600` | Mid-band ATS scores, "needs attention" states. |
| Score — Weak (<70) | Reject Red | `#DC2626` | `bg-red-600` | Sub-70 ATS scores, failed runs, rate-limit warnings. |
| Error — Surface | Reject Red Wash | `#450A0A` | `bg-red-950/30` | Background for the danger-zone card, failed-card states. Always paired with a Reject Red border at 30–60% opacity. |
| Error — Border | Reject Red Border | `#7F1D1D` | `border-red-900` | Borders on error surfaces, "Delete account" buttons. |
| Error — Text | Reject Red Text | `#F87171` | `text-red-400` | Inline error messages, danger CTAs. |

### Accent for editorial moments (one place only)

| Role | Name | Hex | Usage |
|---|---|---|---|
| Editorial Blue | Cursor Blue | `#3B82F6` | The `[10px]` angle-label uppercase chips on card tiles ("ENGINEERING DEPTH", "LEADERSHIP", etc). The ONE place we allow a chromatic color on the canvas. Reserved for technical-affordance labels — never headlines, never CTAs, never icons. |

### Dark Mode

Not in scope for v1. The product IS dark mode. There is no light mode.

---

## Typography

### Typeface Stack

| Role | Font | Weight(s) | Fallback |
|---|---|---|---|
| Display / Hero | **Geist Sans** | 600, 700, 800 | `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` |
| Heading | **Geist Sans** | 600, 700 | same |
| Body | **Geist Sans** | 400, 500 | same |
| Mono / Code / ATS Scores | **Geist Mono** | 400, 500 | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace` |
| Label / UI Microcopy | **Geist Sans** | 500, 600 | same |

Geist is Vercel's open-source typeface — chosen because (a) it's already on our edge via `next/font`, (b) its mechanical proportions match the developer-tool archetype, and (c) Geist Mono is one of the best free monospace faces for tabular numbers (ATS scores).

### Type Scale

Mobile values in parens where they shift. All sizes use rem; line-height is unitless.

| Level | Size | Line Height | Tracking | Weight | Usage |
|---|---|---|---|---|---|
| Display XL | 72px / 4.5rem (mobile: 48px / 3rem) | 1.02 | -0.04em | 700 | Landing hero only. One per page. |
| Display | 56px / 3.5rem (mobile: 40px / 2.5rem) | 1.05 | -0.03em | 700 | Hero alternates, manifesto-style statements. |
| H1 | 32px / 2rem | 1.1 | -0.02em | 700 | Page titles ("Your runs", "Settings", "Pricing"). |
| H2 | 24px / 1.5rem | 1.2 | -0.015em | 600 | Section headers. |
| H3 | 20px / 1.25rem | 1.3 | -0.01em | 600 | Card titles, modal titles. |
| H4 | 16px / 1rem | 1.4 | 0 | 600 | Sub-headers, list group titles. |
| Body L | 18px / 1.125rem | 1.5 | 0 | 400 | Hero subhead, marketing paragraphs. |
| Body | 16px / 1rem | 1.55 | 0 | 400 | Default product copy. |
| Body S | 14px / 0.875rem | 1.5 | 0 | 400 | Metadata, secondary product copy. |
| Caption | 12px / 0.75rem | 1.4 | 0.01em | 400 | Timestamps, helper text, hint text. |
| Label | 11px / 0.6875rem | 1.4 | 0.08em | 600 (UPPERCASE) | Angle chips on cards ("ENGINEERING DEPTH"), category tags, "Most popular" pill. |
| Mono — Score | 24px / 1.5rem (large), 14px / 0.875rem (small) | 1 | 0 | 500 | ATS score numerals only. Always Geist Mono — tabular figures so the number doesn't jitter. |

### Type rules

1. **Display fonts get tightened tracking** (`-0.02em` to `-0.04em`). Body fonts run at default (`0`). Labels open up (`0.08em`).
2. **Never mix two display sizes on one screen** (e.g. Display XL + Display side-by-side). Pick one weight class per surface.
3. **Numbers in score chips are Mono.** Everything else is Sans.
4. **Lowercase the wordmark.** `resume.ai` is always lowercase in the nav. Never capitalize. Never add "the" in front.

---

## Spacing & Layout

### Base Unit

**4px grid.** All spacing is a multiple of 4. No half-pixels, no odd numbers.

### Spacing Scale

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `0` | 0 | `space-0` | Reset only. |
| `0.5` | 2px | `space-0.5` | Hairline gaps inside icon-text pairings. |
| `1` | 4px | `space-1` | Tight gaps (icon + label). |
| `2` | 8px | `space-2` | Inline list gaps, badge padding. |
| `3` | 12px | `space-3` | Tight component padding. |
| `4` | 16px | `space-4` | Default padding, base gap. |
| `5` | 20px | `space-5` | Card padding (compact). |
| `6` | 24px | `space-6` | Card padding (default), section gaps. |
| `8` | 32px | `space-8` | Section padding. |
| `10` | 40px | `space-10` | Block separation, generous padding. |
| `12` | 48px | `space-12` | Major section separation. |
| `16` | 64px | `space-16` | Hero vertical padding, "between major sections". |
| `20` | 80px | `space-20` | Page-level vertical breathing room. |
| `24` | 96px | `space-24` | Reserved — only for full-page hero composition. |

### Layout Grid

- **Max content width**: `1200px` (`max-w-6xl` in Tailwind). For wide compositions (the run gallery's 4-up cards), step up to `1280px` (`max-w-7xl`).
- **Columns**: 12-column grid on desktop, collapses to 4-column on tablet (≥640px), 1-column on mobile.
- **Gutter**: 24px desktop, 16px tablet, 12px mobile.
- **Page margin**: `px-6` (24px) on desktop, `px-4` (16px) on mobile. No edge-to-edge bleeds.
- **Vertical rhythm**: Major sections separated by `py-16` (64px) on desktop, `py-12` (48px) mobile.

### Radii

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `none` | 0 | `rounded-none` | Reserved — Tooltips with arrows. |
| `sm` | 4px | `rounded` (default) | Inline tags, score chips. |
| `md` | 6px | `rounded-md` | Inputs, secondary buttons, badges. |
| `lg` | 8px | `rounded-lg` | Default — cards, primary buttons, modals. |
| `xl` | 12px | `rounded-xl` | Pricing tier cards, hero CTAs, large feature surfaces. |
| `2xl` | 16px | `rounded-2xl` | Reserved — only for the "Most popular" Hunt tier card to break the visual rhythm. |
| `full` | 9999px | `rounded-full` | Pills, score badges, the "Most popular" inline pill. |

### Shadows

We use shadows **sparingly**. The dark canvas means shadows have to be inverted (light glows) to read, and we mostly use them on the brand-accent (white) CTAs.

| Token | Value | Usage |
|---|---|---|
| `none` | none | Default. Most surfaces use a 1px border instead of a shadow. |
| `sm` | `0 1px 2px rgb(0 0 0 / 0.5)` | Subtle lift on hover for inline lists. |
| `md` | `0 4px 16px rgb(0 0 0 / 0.6)` | Modal/dropdown shadow against the page. |
| `glow` | `0 0 0 1px rgb(255 255 255 / 0.4)` | The "Most popular" Hunt card ring. Outline-glow, NOT a blur. |
| `focus` | `0 0 0 2px rgb(255 255 255 / 0.6)` | Focus ring on interactive elements (always white-on-black for max visibility). |

---

## Component Library

### Buttons

All buttons are 40px tall by default (`h-10`), padded `px-5` (20px). Compact variant is 32px (`h-8`, `px-4`). Large variant is 48px (`h-12`, `px-7`).

```
Primary:    bg-white text-black hover:bg-neutral-200 focus:ring-2 focus:ring-white
            disabled:opacity-50 disabled:cursor-not-allowed
            font-semibold text-sm tracking-tight
            radius: rounded-md (md) | rounded-lg (large)

Secondary:  bg-neutral-900 text-white border border-neutral-800
            hover:bg-neutral-800 hover:border-neutral-700 focus:ring-2 focus:ring-white/40
            font-semibold text-sm

Ghost:      bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-900
            font-medium text-sm

Danger:     bg-transparent text-red-400 border border-red-900
            hover:bg-red-950/30 hover:border-red-800
            font-semibold text-sm

Link:       text-white underline underline-offset-4 decoration-neutral-700
            hover:decoration-white transition-colors
            font-medium text-sm (inline within prose)

Disabled:   opacity-50, cursor-not-allowed, no hover changes
```

**Loading state:** Replace button text with the same text + "…" suffix (e.g. "Loading…", "Tailoring…"). Don't use spinners — they're decorative noise. If the action takes >5s, switch to a progress strip ABOVE the button.

### Cards

```
Default:    bg-neutral-950 border border-neutral-800 rounded-lg
            padding: p-6 (default) | p-5 (compact) | p-8 (feature)
            no shadow

Hover:      hover:border-neutral-700 transition-colors duration-200
            (no scale, no lift, no shadow — just a border-shade shift)

Featured:   bg-neutral-950 border border-white shadow-[0_0_0_1px_rgba(255,255,255,0.4)]
            (the "Most popular" Hunt pricing card — outline-glow at 40% white)

Failed:     bg-red-950/30 border border-red-900 rounded-lg
            (failed-card states in the run gallery)

Interactive: cursor-pointer (for clickable cards), the rest follows Default + Hover
```

### Inputs

```
Default:    bg-neutral-900 border border-neutral-800 rounded-md
            text-white placeholder:text-neutral-600
            px-4 py-3 (h-12) | px-3 py-2 (h-10 compact)
            font-normal text-sm

Focus:      border-neutral-700 focus:border-white focus:outline-none
            focus:ring-2 focus:ring-white/20

Error:      border-red-900 focus:border-red-700 focus:ring-red-900/30
            + inline error caption below in text-red-400 text-xs

Disabled:   opacity-50, cursor-not-allowed, bg-neutral-950

Label:      text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400
            mb-2

Helper text: text-xs text-neutral-500 mt-1.5
```

**Textarea**: same styling, `min-h-24` (96px), `resize-y` allowed.
**File drop zone (ResumeDropzone)**: dashed `border-neutral-800` becomes solid `border-white` on drag-over.

### Badges & Pills

```
Default:    bg-neutral-900 text-neutral-300 rounded-full
            px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em]

Score (Green): bg-green-600 text-white rounded-full
              text-xs font-semibold tabular-nums

Score (Amber): bg-amber-600 text-white rounded-full ...

Score (Red):   bg-red-600 text-white rounded-full ...

Most popular:  absolute -top-3 left-1/2 -translate-x-1/2
              bg-white text-black rounded-full
              px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]

Angle chip:    bg-white/90 text-blue-700 rounded-md
              px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]
              (cursor-blue text on white-translucent bg — only used on card tiles
               where it sits on top of the rendered resume preview)

Status (Ready): same as default badge but text-green-400
Status (Failed): same as default badge but text-red-400
Status (Generating): same as default badge with text-neutral-400 + animate-pulse
```

### Navigation

```
Nav:        h-14 (56px) border-b border-neutral-900 flex items-center justify-between px-6
Logo:       text-lg font-semibold tracking-tight text-white
Links:      text-sm text-neutral-400 hover:text-white transition-colors
            gap-x-6 between items
Auth slot:  right-aligned, contains UserButton or "Sign in" link
```

### Modals & Dialogs

Use shadcn's `Dialog` underneath. Visual styling:

```
Overlay:    fixed inset-0 bg-black/70 backdrop-blur-[2px]
Surface:    bg-neutral-950 border border-neutral-800 rounded-lg
            max-w-md p-6 (default) | max-w-lg (wide)
Title:      H3 (20px / font-semibold / tracking-tight)
Body:       Body S (14px / text-neutral-400)
Actions:    flex justify-end gap-2 mt-6, primary on the right
Close:      top-right "X" icon, text-neutral-500 hover:text-white
```

**Confirmation dialogs (delete, destructive actions):** Always use double-confirm pattern — first `confirm()` asks the question, second `confirm()` asks "Are you absolutely sure?". Inline error state below the button if the action fails (don't use alert() for failures — use `<p role="alert" className="mt-2 text-xs text-red-400">`).

### Dividers

```
Horizontal:  border-t border-neutral-900 (subtle) | border-neutral-800 (default)
Vertical:    border-l border-neutral-900 h-full
Section break: mx-auto h-px w-12 bg-neutral-800 (centered hairline, 48px wide)
```

---

## Iconography

- **Style**: Line icons, 1.5px stroke, 24×24px viewBox.
- **Library**: **Lucide React** (already installed). Approved icons for the product:
  - `Check` — completed states, value-stack bullets
  - `X` — close modals, dismiss
  - `Sparkles` — AI-touched moments (used sparingly, never on CTAs)
  - `Shield` — guarantee blocks
  - `Zap` — speed / urgency moments
  - `Loader2` — loading spinners (avoid except for >5s waits)
  - `ChevronDown` / `ChevronUp` — accordions, FAQ
  - `Plus` — expand affordance
  - `Trash2` — destructive (used in red-400)
  - `ExternalLink` — outbound links
- **Sizes**: `size-4` (16px, inline with body), `size-5` (20px, default UI), `size-6` (24px, hero/feature).
- **Color**: Inherits surrounding text color (`text-white`, `text-neutral-400`). Score colors (green/amber/red) only when the icon is semantically tied to a score.
- **Forbidden**: filled icons, duotone icons, brand-logo icons (Stripe, Convex etc) on user-facing surfaces.

---

## Motion & Animation

### Easing

```
default:   cubic-bezier(0.4, 0, 0.2, 1)   /* ease-in-out, Tailwind's ease */
linear:    linear                          /* loaders, progress strips */
spring:    cubic-bezier(0.16, 1, 0.3, 1)  /* page entrances, modal pop-in */
```

### Durations

| Use case | Duration |
|---|---|
| Hover / focus state changes (color, border) | 150ms |
| Button press scale (active:scale-[0.98]) | 100ms |
| Modal / drawer open + close | 200ms |
| Card hover lift | 200ms |
| Page section entrances (initial mount) | 400ms with 60ms stagger |
| Score badge changes (after a chat-fine-tune edit) | 300ms color crossfade |
| Skeleton pulse | 1500ms infinite |

### Motion principle

**Snappy and purposeful; never decorative.** Motion confirms an action happened. We never animate elements into view "just because". If a section appears on scroll, it's because it would otherwise pop in awkwardly — not because animation is fun.

### Things we never animate

- Background colors of the page (no shifting gradients)
- Text characters (no letter-by-letter reveal in the hero — use mask-reveal for word-level instead)
- Icons (they appear, they don't spin in)
- Cursor trails, parallax stars, decorative particles

### Skeleton loaders

`CardSkeleton` is the canonical pattern: an `aspect-[3/4]` card with `animate-pulse` neutral-800 bars. Live skeletons for in-flight runs use the same pattern with the angle label visible while the body skeletons pulse.

---

## Logo Usage

- **Primary wordmark**: lowercase text `resume.ai` rendered in Geist Sans, weight 600, tracking `-0.01em`. No mark, no glyph, no leading dot.
- **Color**: White on dark surfaces. (Black on white only in legal pages' email artifacts — never on product surfaces.)
- **Sizes**: `text-lg` (18px) in nav, `text-xl` (20px) in legal pages, `text-2xl` (24px) only in OG share images / email headers.
- **Clear space**: Minimum 16px on all sides. Never crop, never wrap with adjacent text.
- **Forbidden**:
  - Capitalizing ("Resume.AI" — wrong)
  - Adding "the" ("the resume.ai" — wrong)
  - Splitting onto two lines
  - Adding a tagline next to it ("resume.ai · the resume tool" — wrong; brand voice does that in headlines, not in the wordmark)
  - Stretching, condensing, italicizing
- **File reference**: No `assets/logo.png`. The wordmark is rendered in CSS — `<Link className="text-lg font-semibold tracking-tight text-white">resume.ai</Link>`. Use exactly this — do not redraw, do not export as image.

---

## Tone & Copy Guidelines

### Voice attributes

**Insurgent. Direct. Technical.**

- **Insurgent**: We are explicitly against template resume builders (Indeed Resume, ZipRecruiter, generic AI resume tools, LinkedIn Easy Apply). Our headlines and CTAs can name the enemy. "Stop letting AI decide your job for you." "Against template resumes."
- **Direct**: No hedging, no "we believe", no "imagine if". State what the tool does. State what's wrong with the alternative. State the price.
- **Technical**: Assume the reader knows what ATS means, what a JD is, what a recruiter screen looks like. Don't over-explain.

### Headlines

- Verb-forward or noun-confrontational.
  - "Stop letting AI decide your job for you." ✓
  - "Take your job hunt back." ✓
  - "Four angles. Real ATS. One click." ✓
  - "Unlock your career potential" ✗ (vague, generic)
  - "AI-powered resume optimization" ✗ (descriptor sentence, not a headline)
- Sentence case or all-lowercase. **Never Title Case** in headlines (Title Case reads as marketing copy).
- Periods to end. No exclamation marks. No em-dashes for drama (em-dashes are for body copy, not headlines).
- Max 2 lines on desktop, 3 on mobile. If you need a third line, the headline is too long.

### Body copy

- Plain language. Short paragraphs (1–3 sentences). No "leverage", "utilize", "in order to" — say "use", "use", "to".
- Don't write "AI" as a noun in product copy unless the reader needs to know it's AI for a decision (e.g., "the AI will rewrite this card" — fine; "AI-powered" — never).
- Specific over abstract. "Sub-10s priority queue" > "fast generation". "$144/yr billed annually" > "save 20%".
- Anti-pattern: "We use Claude under the hood." Readers don't care about the LLM brand. We say "Sonnet rewrites the card" inside developer-facing docs only.

### CTAs

- Action verbs only. No "Submit", no "Click here", no "Get started today!"
- Approved CTAs:
  - "See my 4 designs →" (hero submit)
  - "Get Apply" / "Get Hunt" (pricing — never "Buy" or "Subscribe")
  - "Start free" (free tier)
  - "Manage subscription"
  - "Upgrade →" (in-product upsell)
  - "Delete account" (destructive)
- Arrow suffix (` →`) is allowed on directional CTAs (hero submit, upgrade). Never on destructive or neutral CTAs.

### Pricing copy (Hormozi GSO, voice-aligned)

Tier names:

- **Try ($0)** — "Free forever. No card."
- **Apply ($15/mo)** — Implied stack: $40+ of tooling. Voice: "Get unlimited runs and the chat-fine-tune editor."
- **Hunt ($35/mo)** — Implied stack: $100+. Voice: "The full job hunt." Hunt is anchored center + scaled up + "Most popular" badge.

Guarantee block copy (do not change without re-review):
> **30 days. No interview, full refund.**
> One email, no support hoops.

Anti-patterns in pricing:
- No "Save 67%" stickers. No fake red badges.
- No "Only 3 left at this price". No fake countdowns.
- No "Most expensive plan is $99 (crossed out) → now $35!" anchoring.
- The annual toggle is real (20% off). It MUST charge the user the yearly price if they pick it. Don't fake it.

### Error messages

- State what happened. State what the user can do next.
  - "You've used your free anonymous runs. Sign up free for unlimited." ✓
  - "Too many submissions from your network. Sign up for guaranteed access." ✓
  - "Something went wrong starting your run. Please try again." ✓ (use only when the cause is genuinely unknown)
  - "Error 500" ✗
  - "Oops! Something went wrong." ✗

### Microcopy

- Loading states: present-tense verb + ellipsis. "Tailoring…", "Rewriting + rescoring…", "Loading…"
- Empty states: state the gap, then offer the next step. "No runs yet" / "Tailor your resume to your first job posting" / `New run →`.
- Confirmation: declarative past tense + score delta. "Updated. New ATS score: 87 (was 79)."

---

## Example Layouts

### Landing hero (current `src/app/page.tsx`)

```
nav (h-14):  resume.ai                    Pricing  Dashboard  UserButton
                                          ─── or Sign in (if signed out)

section (py-24, max-w-3xl):
  H1 Display: "Stop letting AI decide
              your job for you."          (56px / 1.05 / -0.03em / 700)
  Body L:     "Paste a job. Drop your resume. See four ways to win it
              — with real ATS scores."    (18px / text-neutral-400)
  spacer (mt-10)

  form (max-w-xl):
    input  (url)            "https://jobs.lever.co/anthropic/swe"
    dropzone (file)         "Drop your resume here (PDF or DOCX)"
    button (primary, lg)    "See my 4 designs →"

footer: SiteFooter (Privacy · Terms · Contact)
```

### Run gallery (`/run/[runId]`)

```
nav:       resume.ai                      Dashboard  UserButton
header (py-8 max-w-6xl):
  H1:       "Your 4 designs"
  Body S:   "{readyCount}/4 ready" OR "Click any card to preview or edit."
  → right-aligned: "Delete run" (text-red-400 hover:text-red-300)

grid (grid-cols-2 md:grid-cols-4 gap-4):
  CardTile × 4 (aspect-[3/4])
    bg-white (rendered ResumePreviewHtml at scale 0.4)
    angle chip top-left (text-blue-700 on white/90)
    ScoreBadge top-right (green/amber/red)
```

### Pricing (`/pricing`)

```
nav:       resume.ai                      Pricing  Dashboard  Sign in/UserButton
hero (py-20 max-w-3xl text-center):
  H1 Display: "One price. The whole job hunt."
  Body L:     "Tailored resumes, cover letters, ATS scoring, outreach,
              interview prep. Pick the tier that matches how serious you are."
  Pill toggle: [ Monthly | Annual (-20%) ]

grid (3-col, max-w-6xl, order on mobile: Hunt first):
  TierCard "Try"  (left)
  TierCard "Hunt" (CENTER, md:scale-105, border-white, "Most popular" pill)
  TierCard "Apply" (right)

ValueStack section (max-w-3xl):
  H2:      "Everything that's in Hunt"
  9 rows × $-value, strikethrough total
  CTA → Get Hunt

GuaranteeBlock (max-w-2xl):
  Shield icon (size-8 text-white)
  H2: "30 days. No interview, full refund."
  Body: "One email, no support hoops."

PricingFAQ (max-w-3xl, native <details>/<summary>)

SiteFooter
```

### Dashboard (`/dashboard`)

```
nav:       resume.ai                      New run  Settings  UserButton
section (py-12 max-w-3xl):
  H1:       "Your runs"

  if loading: skeleton list
  if empty:   EmptyDashboard (centered, "No runs yet" + "New run →")
  if list:    space-y-2 of RunListItem
              each: Link border-neutral-800 hover:border-neutral-600 rounded-lg p-4
              left: jdTitle (font-medium), jdCompany (text-neutral-500), meta line
              right: ScoreBadge (top score)

SiteFooter
```

### Editor (`/run/[runId]/edit/[cardId]`)

```
nav:       resume.ai                      ← Back to gallery  UserButton

grid (lg:grid-cols-[1fr_400px], h-screen-minus-nav):
  left panel (flex-col gap-4 p-4):
    angle chip (text-blue-400 size-xs)
    ResumePreviewHtml in white bg, border-neutral-800, overflow-y-auto
    ScoreBreakdown (text-neutral-300, ATS subscores, kw chips)

  right panel (ChatPanel, border-neutral-800 rounded-lg bg-neutral-950):
    flex-1 overflow-y-auto p-3:
      MessageBubble × N (user right blue-600, assistant left neutral-800)
      "Rewriting + rescoring…" while thinking
    ChatInput border-t border-neutral-800 p-3 flex gap-2
```

### Settings (`/settings`)

```
nav:       resume.ai                      Dashboard  UserButton
section (py-12 max-w-2xl space-y-6):
  H1: "Settings"
  Body S (text-neutral-500): user.email

  BillingSection (Card):
    H3: "Billing"
    "Current plan: {tier}" + sub.currentPeriodEnd renewal line
    Right: Primary button "Manage subscription" (paid) | "Upgrade" link (free)

  DangerZone (Card, border-red-900 bg-red-950/30):
    H3 (text-red-400): "Danger zone"
    Body: "Permanently delete your account and all your runs."
    Danger button: "Delete account"
```

---

## Claude Design Usage Notes

This spec is the single source of truth for resume.ai's visual identity. Aura, Frontend Design, and any future agent should reference it at the start of every session.

### Defaults to assume

- **Tech stack**: Next.js 16 App Router + Tailwind CSS v4 + shadcn/ui + Lucide React. Already in repo.
- **Fonts**: Geist Sans + Geist Mono via `next/font/google`. Configure once in `src/app/layout.tsx`.
- **Color tokens**: Map the palette above to Tailwind utilities. No custom CSS variables needed for v1 — `bg-black`, `bg-neutral-950`, `border-neutral-800`, `text-white`, `text-neutral-400` already give us the system.
- **Logo**: Always render as CSS text. Never import an image.
- **Dark mode only**: Don't write a light mode for v1.

### Layout defaults

- Page wrappers: `<main className="min-h-screen bg-black text-white">`.
- Content max-widths: `max-w-6xl` (product surfaces) or `max-w-3xl` (marketing copy) or `max-w-2xl` (settings, legal).
- Vertical rhythm: `py-12` (compact pages) or `py-20` (hero pages).
- Nav: 56px tall, `border-b border-neutral-900 px-6`.

### Quick-reference component imports

```tsx
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
// shadcn (already installed): Button, Card, Dialog, Input
// icons: lucide-react
```

### What Aura should preserve

When redesigning the live pages, the following business behaviors must NOT change:

1. **Pricing tier names + amounts**: Try $0 / Apply $15 / Hunt $35. Annual is real (Apply $144/yr, Hunt $336/yr). Hunt anchored center.
2. **The Hormozi 30-day guarantee copy**: "30 days. No interview, full refund. One email, no support hoops."
3. **Anonymous → signed-in flow**: Hero submit → /try/<runId> (signed-out) or /run/<runId> (signed-in). Download button on /try lands user at /sign-up?redirect_url=... then auto-resumes claim + download.
4. **ATS score band colors**: green ≥85 / amber 70–84 / red <70. Don't change thresholds without explicit go-ahead.
5. **The 4-angle output structure**: Engineering depth / Leadership / Cross-functional / Specialist. Names stay. Templates: Classic / Modern / Creative / Minimal.

### What Aura is allowed to change

Everything else: visual hierarchy, copy (within the voice rules above), motion choices, layout density, hero composition, illustration/visual treatment (if any), and the order of sections on a page. The brand spec above is the constraint; freshness within it is encouraged.

### Three brand signatures to preserve

1. **Inverted brand color**: The CTA is white-on-black. The "Most popular" badge is white. The brand pulls power from the inversion — the dark is the brand, the light is the action.
2. **Editorial blue on angle chips**: The `text-blue-700` lowercase-uppercase chip ("ENGINEERING DEPTH") sitting on a white card is the one place we let a chromatic color exist on the canvas. Preserve it.
3. **Monospaced ATS scores**: Score numerals are Geist Mono. Always tabular figures. Never sans.
