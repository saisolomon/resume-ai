# resume.ai Design System
> Premium AI resume tool for serious job seekers. Apple-grade visual restraint, generous whitespace, calm confidence — the product *is* the marketing.

> **Major revision (2026-05-23):** This document now describes the **light** brand. The prior dark / "developer tool" version is preserved at `Design.md.dark-v5.bak` for reference; do not pattern-match against it.

---

## Brand DNA

- **Mission**: Help job seekers — especially technical ICs (eng / PM / DS / design) — generate four real, ATS-scored, JD-tailored resume designs from one job posting in under 30 seconds. They already write good resumes; we make tailoring effortless.
- **Audience**: Mid-to-senior professionals who care about quality, hate dark patterns, and recognize when a tool was made with thought. They notice line-height, shadow softness, and microcopy.
- **Archetype**: **Premium Consumer (Apple-grade)**. Off-white canvas, generous whitespace, near-black text, one focal element per section, restrained chromatic accents. Calibrated to feel like `apple.com`, Linear's settings UI, or Stripe's marketing — *not* a SaaS templated landing page.
- **Voice**: **Confident. Calm. Specific.** One sentence: "We built the resume tool we wished existed — designed by people who care about the difference between *good* and *almost good.*"
- **Anti-patterns** (explicitly NOT this brand):
  - No "AI magic" / "supercharge your career" / "10x your search" / "land your dream job" copy.
  - No gradients on text. No glassmorphism. No animated background blobs. No floating particles.
  - No fake urgency. No "limited time" stickers. No fake countdowns. No manufactured scarcity.
  - No marketing emoji in body copy. (Status icons from the icon set are fine.)
  - No template thumbnails as hero. (Use the *output* as hero, not the *container*.)
  - No dark UI. v1 is light mode. Dark mode comes later if at all.
  - No insurgent-attack copy. We're not "against" anyone — we just made something better. (Earlier brand attacked competitors by name; new brand is too confident for that.)

---

## Color System

Apple-aligned. Off-white canvas, near-black text, one chromatic accent, semantic colors used sparingly. Hex values are exact.

### Primary Palette

| Role | Name | Hex | Tailwind | Usage |
|---|---|---|---|---|
| Background — Page | Mist | `#F5F5F7` | `bg-[#F5F5F7]` | Main page background. Apple's signature off-white — warmer than pure gray, calmer than pure white. Easy on the eyes for long sessions. |
| Background — Section Alt | Cloud | `#FAFAFA` | `bg-[#FAFAFA]` | Alternating section backgrounds when you want to *suggest* separation without a divider. Use sparingly. |
| Background — Surface | White | `#FFFFFF` | `bg-white` | Cards, modals, input surfaces. The "elevated" layer. |
| Text — Primary | Onyx | `#1D1D1F` | `text-[#1D1D1F]` | Headlines, body copy, primary CTA fill. Apple's `--system-label`; reads as near-black without the harshness of pure `#000`. |
| Text — Secondary | Slate | `#6E6E73` | `text-[#6E6E73]` | Subheads, body-secondary, button labels on dark backgrounds. |
| Text — Tertiary | Mist Gray | `#86868B` | `text-[#86868B]` | Captions, metadata, timestamps, helper text. Apple's `--system-gray`. |
| Text — Quaternary | Pale Gray | `#A1A1A6` | `text-[#A1A1A6]` | Disabled labels, placeholder text. |
| Border — Hairline | Fog | `#D2D2D7` | `border-[#D2D2D7]` | Hairline dividers, subtle card borders. ALWAYS 1px. Apple's `--system-separator`. |
| Border — Strong | Steel | `#86868B` | `border-[#86868B]` | Focused input borders, active tab underlines. |
| Brand Accent — Primary | Onyx | `#1D1D1F` | `bg-[#1D1D1F]` | Primary CTA fill. The brand's "loud" surface — black-on-white inversion is the anchor. Apple's primary action color. |
| Brand Accent — Link | Apple Blue | `#0071E3` | `text-[#0071E3]` | Hyperlinks, interactive text. Reserved — use this rarely; most "links" are styled buttons. |

### Semantic / Score Palette

These map directly to `ScoreBadge` and run through every ATS surface. Semantic, not decorative. Calibrated for the light canvas (slightly softer than the prior dark-mode greens/ambers/reds).

| Role | Name | Hex | Tailwind | Usage |
|---|---|---|---|---|
| Score — Strong (≥85) | Match Green | `#1A7F45` | `bg-[#1A7F45]` | ATS scores in the "ready" band, success states. Apple's success green at slightly deeper saturation for legibility on white. |
| Score — Caution (70–84) | Caution Amber | `#B45309` | `bg-[#B45309]` | Mid-band ATS scores. Darker than tailwind amber-600 for AA contrast on the off-white canvas. |
| Score — Weak (<70) | Reject Red | `#B91C1C` | `bg-[#B91C1C]` | Sub-70 scores, errors, danger states. Tailwind red-700 — calmer than the prior red-600. |
| Surface — Success | Mint Wash | `#F0FDF4` | `bg-[#F0FDF4]` | Background tint behind a passing score row, success toast. |
| Surface — Warning | Amber Wash | `#FFFBEB` | `bg-[#FFFBEB]` | Background tint for caution states. |
| Surface — Error | Rose Wash | `#FEF2F2` | `bg-[#FEF2F2]` | Background tint behind failed-card / danger-zone surfaces. |
| Border — Error | Rose Edge | `#FCA5A5` | `border-[#FCA5A5]` | Subtle error borders. Soft enough to not scream. |

### Editorial Accent (one place only)

| Role | Name | Hex | Usage |
|---|---|---|---|
| Editorial Blue | Cursor Blue | `#3B82F6` | The `[10px]` angle-label uppercase chips on resume tiles ("ENGINEERING DEPTH", "LEADERSHIP", etc). Reserved for technical-affordance labels on rendered resume previews — never headlines, never CTAs, never icons elsewhere. |

### Color philosophy

1. **The canvas is the brand.** `#F5F5F7` everywhere on the page background is a signal — calm, considered, premium. Resist the urge to add chromatic backgrounds.
2. **Cards are pure white.** They float on the mist with shadow only — no visible borders unless explicitly noted.
3. **Type carries hierarchy.** Headings are `#1D1D1F`. Body is `#1D1D1F`. Secondary copy is `#6E6E73`. Most "color" in the design is just type weight and size.
4. **One chromatic moment per screen.** A green score badge, or a blue angle chip, or an Apple Blue link — pick one per visual block.

---

## Typography

### Typeface Stack

The brand uses **SF Pro Display / Text / Mono** as the canonical family. Geist Sans is the open-source substitute (already in repo via `next/font/google`) — it shares SF Pro's mechanical proportions and works as a clean stand-in on the light canvas.

| Role | Font | Weight(s) | Fallback |
|---|---|---|---|
| Display / Hero | **SF Pro Display** (or **Geist Sans**) | 600, 700 | `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` |
| Heading | **SF Pro Display** (or **Geist Sans**) | 600, 700 | same |
| Body | **SF Pro Text** (or **Geist Sans**) | 400, 500 | same |
| Mono / Score Numerals | **SF Mono** (or **Geist Mono**) | 400, 500 | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` |
| Label / UI Microcopy | **SF Pro Text** (or **Geist Sans**) | 500, 600 | same |

The brand SHIPS with Geist (it's already in repo and `next/font` optimization). Treat SF Pro as the "if we ever afford the license" upgrade path. They're visually close enough that switching later is mechanical.

### Type Scale

Apple uses a generous, slightly looser scale than the prior dark version. Bigger displays, more line-height, looser tracking on body. Mobile values in parens.

| Level | Size | Line Height | Tracking | Weight | Usage |
|---|---|---|---|---|---|
| Display XL | 96px / 6rem (mobile: 56px / 3.5rem) | 1.05 | -0.025em | 700 | Apple-style hero. One per page only. Clamps `3.5rem → 6rem` across 320px → ~1200px+ viewports; ceiling holds on ultrawide / 4K so the headline stays commanding relative to canvas. |
| Display | 64px / 4rem (mobile: 44px / 2.75rem) | 1.08 | -0.02em | 700 | Major section headlines ("Tailored four ways."). |
| Display S | 48px / 3rem (mobile: 36px / 2.25rem) | 1.1 | -0.015em | 600 | Sub-section opens, feature page hero. |
| H1 | 36px / 2.25rem | 1.15 | -0.015em | 600 | Page titles ("Your runs", "Settings"). |
| H2 | 28px / 1.75rem | 1.2 | -0.01em | 600 | Section titles. |
| H3 | 22px / 1.375rem | 1.3 | -0.005em | 600 | Card titles, modal titles. |
| H4 | 18px / 1.125rem | 1.4 | 0 | 600 | Sub-headers, list group titles. |
| Body L | 19px / 1.1875rem | 1.55 | 0 | 400 | Hero subhead, marketing paragraphs. Apple uses bigger body than most SaaS. |
| Body | 17px / 1.0625rem | 1.55 | 0 | 400 | Default body copy. Apple uses 17px body, not 16px. |
| Body S | 15px / 0.9375rem | 1.5 | 0 | 400 | Secondary metadata, dense product copy. |
| Caption | 13px / 0.8125rem | 1.4 | 0 | 400 | Timestamps, helper text. |
| Label | 12px / 0.75rem | 1.4 | 0.04em | 600 (UPPERCASE) | Angle chips ("ENGINEERING DEPTH"), category labels, eyebrow tags. Less aggressive tracking than the prior 0.08em — Apple labels are tighter. |
| Mono — Score | 28px / 1.75rem (large), 16px / 1rem (small) | 1 | 0 | 500 | ATS score numerals. Always tabular-nums so the digit doesn't jitter. |

### Type rules

1. **Tighter tracking on display, default on body, lightly opened on labels.** Apple's rhythm — never the heavy `0.08em` tracked labels of dev-tool brands.
2. **One Display per page.** Two Display elements compete; pick the one that matters and demote the rest to H1.
3. **Score numerals always Mono.** Everything else Sans.
4. **Lowercase the wordmark.** `resume.ai` is always lowercase. Never capitalize. Never add "the" in front.
5. **Body color is `#1D1D1F` (near-black), not gray.** Apple keeps body type dark for readability. Use `#6E6E73` only for genuinely secondary content.

---

## Spacing & Layout

Apple uses ~50% more whitespace than typical SaaS. Adjust accordingly.

### Base Unit
**4px grid.** All spacing multiples of 4.

### Spacing Scale

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `1` | 4px | `space-1` | Tight icon-text gaps |
| `2` | 8px | `space-2` | Inline list gaps, badge padding |
| `3` | 12px | `space-3` | Tight component padding |
| `4` | 16px | `space-4` | Default tight padding |
| `5` | 20px | `space-5` | Card padding compact |
| `6` | 24px | `space-6` | Card padding default |
| `8` | 32px | `space-8` | Component padding, list gaps |
| `10` | 40px | `space-10` | Block separation |
| `12` | 48px | `space-12` | Section padding (compact) |
| `16` | 64px | `space-16` | Section padding (default) |
| `20` | 80px | `space-20` | Section padding (generous, between major sections) |
| `24` | 96px | `space-24` | Section padding (premium hero spacing) |
| `32` | 128px | `space-32` | Vertical rhythm between hero sections on long marketing pages |
| `40` | 160px | `space-40` | Page-level hero top/bottom on `/` |

### Layout Grid

- **Max content width**: `1200px` (`max-w-6xl`). Headlines may push to `1280px` for big displays.
- **Columns**: 12-column on desktop, collapses to 6 then 1.
- **Gutter**: 32px desktop, 20px tablet, 16px mobile.
- **Page margin**: `px-8` (32px) desktop, `px-6` (24px) tablet, `px-4` (16px) mobile.
- **Vertical rhythm**: `py-24` (96px) for default section padding on `/`, `py-32` (128px) for hero, `py-16` (64px) for compact content pages.

### Radii

Apple uses generously rounded corners — 20-22px on cards, fully rounded on pills.

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `sm` | 6px | `rounded-md` | Inline chips, tags |
| `md` | 10px | `rounded-[10px]` | Inputs, small buttons |
| `lg` | 14px | `rounded-2xl` (Apple uses 14-16) | Default cards |
| `xl` | 20px | `rounded-[20px]` | Feature cards, pricing pack cards, hero containers |
| `2xl` | 28px | `rounded-[28px]` | Big hero media frames |
| `full` | 9999px | `rounded-full` | Pills, primary CTAs (Apple's pill button shape) |

### Shadows

Apple uses soft, diffuse shadows on white surfaces to create depth without weight.

| Token | Value | Usage |
|---|---|---|
| `none` | `box-shadow: none` | Default. Most surfaces use whitespace, not shadow. |
| `sm` | `0 1px 2px rgba(0,0,0,0.04)` | Faint elevation on small cards. |
| `md` | `0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)` | Default card shadow. Two-layer for soft falloff. |
| `lg` | `0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)` | Hover state on cards, hero media containers. |
| `xl` | `0 24px 48px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.06)` | Floating modals, important feature cards. |
| `focus` | `0 0 0 4px rgba(0,113,227,0.20)` | Focus rings on interactive elements. Apple Blue at 20% opacity. |

---

## Component Library

### Buttons

Apple's primary button: pill-shaped, dark-on-light, ~44px tall (touch-friendly). All buttons rounded-full.

```
Primary:    bg-[#1D1D1F] text-white rounded-full px-6 py-3 (h-12 desktop, h-11 mobile)
            hover:bg-[#000000] focus:ring-4 focus:ring-[#0071E3]/20
            font-medium text-[17px] (body-sized, NOT label-sized)
            transition-colors duration-150

Secondary:  bg-white text-[#1D1D1F] rounded-full px-6 py-3 border border-[#D2D2D7]
            hover:bg-[#F5F5F7] hover:border-[#86868B]
            focus:ring-4 focus:ring-[#0071E3]/20
            font-medium text-[17px]

Accent:     bg-[#0071E3] text-white rounded-full px-6 py-3
            hover:bg-[#0066D1] focus:ring-4 focus:ring-[#0071E3]/20
            font-medium text-[17px]
            (Use sparingly — pricing CTAs that aren't the anchored pack, secondary primary actions.)

Ghost:      bg-transparent text-[#1D1D1F] rounded-full px-6 py-3
            hover:bg-[#F5F5F7]
            font-medium text-[17px]

Link:       text-[#0071E3] underline-offset-4 hover:underline
            (For inline prose only.)

Danger:     bg-white text-[#B91C1C] rounded-full px-6 py-3 border border-[#FCA5A5]
            hover:bg-[#FEF2F2] hover:border-[#B91C1C]
            font-medium text-[17px]

Loading:    same shape, label gets " · loading" suffix; opacity-70. No spinner.
Disabled:   opacity-50, cursor-not-allowed, no hover changes.
```

**Sizing variants:** `h-10 px-5 text-[15px]` (compact, secondary actions), `h-12 px-6 text-[17px]` (default), `h-14 px-8 text-[19px]` (hero CTAs).

### Cards

```
Default:    bg-white rounded-2xl shadow-md p-6 (or p-8 for spacious)
            no visible border (shadow does the work)

Hover:      shadow-lg transition-shadow duration-200
            (no lift, no scale — let the shadow carry it)

Featured:   bg-white rounded-2xl shadow-xl p-8
            (the "anchored" pack card on /pricing — bigger shadow + slight scale)

Subtle:     bg-[#FAFAFA] rounded-2xl p-6 border border-[#D2D2D7]
            (low-prominence cards in sidebars or list contexts)

Error:      bg-[#FEF2F2] rounded-2xl p-6 border border-[#FCA5A5]
            (failed card surfaces, danger zone)
```

### Inputs

```
Default:    bg-white rounded-xl border border-[#D2D2D7]
            text-[#1D1D1F] placeholder:text-[#A1A1A6]
            px-4 py-3 (h-12) | px-3 py-2 (h-10 compact)
            font-normal text-[17px]
            transition-colors duration-150

Focus:      border-[#86868B] focus:outline-none
            focus:ring-4 focus:ring-[#0071E3]/20

Error:      border-[#FCA5A5] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20

Disabled:   opacity-50 bg-[#F5F5F7] cursor-not-allowed

Label:      text-[15px] font-medium text-[#1D1D1F] mb-2
            (NOT uppercase, NOT tracked — Apple uses sentence-case labels)

Helper:     text-[13px] text-[#6E6E73] mt-2

Textarea:   same shape, min-h-32, resize-y
Dropzone:   border-dashed border-[#D2D2D7] hover:border-[#86868B] bg-white
            On drag-over: border-solid border-[#0071E3] bg-[#0071E3]/5
```

### Badges & Pills

```
Default:    bg-[#F5F5F7] text-[#1D1D1F] rounded-full
            px-3 py-1 text-[13px] font-medium
            (Apple uses sentence-case badges, NOT uppercase.)

Score (Green): bg-[#1A7F45] text-white rounded-full
              px-2.5 py-0.5 text-[13px] font-medium tabular-nums
Score (Amber): bg-[#B45309] text-white rounded-full px-2.5 py-0.5 ...
Score (Red):   bg-[#B91C1C] text-white rounded-full px-2.5 py-0.5 ...

Most popular:  bg-[#1D1D1F] text-white rounded-full
              px-3 py-1 text-[12px] font-medium tracking-wide
              absolute -top-3 left-1/2 -translate-x-1/2

Angle chip:    bg-white/95 text-[#3B82F6] rounded-md (NOT pill)
              px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]
              (Only on rendered resume preview tiles — the lone chromatic
               flourish on white-paper surfaces.)

New / Beta:    bg-[#0071E3]/10 text-[#0071E3] rounded-full
              px-2.5 py-0.5 text-[12px] font-medium
              (For "new feature" indicators if needed.)
```

### Navigation

```
Nav:        h-16 (64px — taller than dev-tool 56) backdrop-blur-xl bg-white/80
            border-b border-[#D2D2D7]/60
            sticky top-0 z-50
            flex items-center justify-between px-8 (px-4 mobile)

Logo:       text-[20px] font-semibold tracking-tight text-[#1D1D1F]
            ("resume.ai" — same wordmark rules)

Links:      text-[15px] font-medium text-[#1D1D1F] hover:text-[#6E6E73]
            transition-colors duration-150
            gap-x-8 between items (more breathing room than dev-tool nav)

Active link:  text-[#1D1D1F] (no underline, no bold — just color contrast)
Inactive:     text-[#6E6E73]

Auth slot:  right-aligned. UserButton or pill-button "Sign in" / "Buy credits".
Mobile:     hamburger trigger → full-screen sheet with blur backdrop.
```

### Modals & Dialogs

```
Overlay:    fixed inset-0 bg-[#1D1D1F]/40 backdrop-blur-md
            (Apple uses a dark scrim WITH blur — not just dim.)
Surface:    bg-white rounded-[20px] shadow-xl
            max-w-md p-8 (default) | max-w-lg
            (No border — shadow + blur scrim do the elevation work.)
Title:      H3 (22px / font-semibold / tracking-tight)
Body:       Body (17px / text-[#1D1D1F])
Actions:    flex justify-end gap-3 mt-8, primary on the right (pill button)
Close:      top-right "X" icon, text-[#86868B] hover:text-[#1D1D1F]
```

### Dividers

```
Horizontal: border-t border-[#D2D2D7]  (default)
            border-t border-[#D2D2D7]/40  (subtle, near-invisible)
Vertical:   border-l border-[#D2D2D7] h-full
Section:    No visible divider — let whitespace do the work.
            If you must: mx-auto h-px w-16 bg-[#D2D2D7]
```

### Pack Card (pricing-specific)

```
Default:     bg-white rounded-[20px] shadow-md p-8 flex flex-col gap-5
             min-h-[500px] (consistent height across tiers)

Anchored:    + md:scale-[1.02] + shadow-xl + relative
             + "Most popular" pill absolute -top-3 left-1/2

Pack name:   text-[15px] font-semibold text-[#6E6E73] (NOT uppercase)
Tagline:     text-[17px] text-[#1D1D1F] leading-snug, max 2 lines
Price:       text-[64px] font-semibold tracking-tight text-[#1D1D1F]
             leading-none
Price suffix: text-[19px] text-[#6E6E73] (e.g., "/ pack")
Per-unit math: text-[15px] text-[#6E6E73] (e.g., "$5.80 per resume")

Hairline:    border-t border-[#D2D2D7] my-5

Value bullets:
  ul.space-y-3 text-[15px] text-[#1D1D1F]
  li:        flex items-start gap-3
    Icon:    Check size-5 mt-0.5 text-[#1A7F45] (anchored) | text-[#6E6E73]
    Text:    text-[#1D1D1F]

CTA:         Primary button (h-12 px-6 rounded-full bg-[#1D1D1F] text-white)
             on the anchored card. Secondary button (border) on the others.
             Full width.
```

### Template Gallery (landing pattern)

The signature "browse templates" pattern that competitors over-rely on but, executed Apple-style with restraint, becomes a credibility moment.

```
Container:   horizontal scroll, snap-x snap-mandatory
             overflow-x-auto py-6 px-8
             with mask-image edges fading to canvas at left/right

Tile:        flex-shrink-0 w-[280px] (larger than the prior 192px)
             snap-start cursor-pointer
             aspect-[3/4] rounded-2xl bg-white shadow-md
             hover:shadow-lg transition-shadow duration-200

Tile content:
  Resume preview rendered at ~38% scale, top-aligned
  Angle chip top-left (text-[#3B82F6] on white/95, rounded-md)
  Score badge top-right (size-md, semantic green/amber/red)

Tile label (below tile):
  text-[15px] font-medium text-[#1D1D1F] mt-3 (e.g., "Engineering Depth")
  text-[13px] text-[#6E6E73] (e.g., "Score 91")

Filter strip ABOVE (optional):
  Pill row: ["All" | "Classic" | "Modern" | "Creative" | "Minimal"]
  Active: bg-[#1D1D1F] text-white
  Inactive: bg-white border-[#D2D2D7] text-[#1D1D1F]
  All pills h-10 rounded-full px-5 text-[15px]
```

### Live Tailor / Template Browser (hero pattern)

The redesigned hero centerpiece. The user picks a **template** (Classic / Modern / Creative / Minimal) — NOT a job description like the prior v5. The demo shows a real-looking resume rendered in that template, with the angle and ATS score visible.

```
Frame:       bg-white rounded-[28px] shadow-xl p-8 sm:p-10
             max-w-5xl mx-auto

Tab strip:   flex gap-2 mb-8
             4 pill buttons: Classic / Modern / Creative / Minimal
             Active: bg-[#1D1D1F] text-white
             Inactive: bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#EDEDED]
             All h-10 rounded-full px-5 text-[15px] font-medium

Preview area:
  aspect-[5/7] (portrait, letter-paper proportion)
  bg-white rounded-2xl border border-[#D2D2D7]/40 shadow-sm
  overflow-hidden relative

  Resume preview at ~52% scale, top-aligned
  Angle chip top-left
  Score badge top-right

  Tab swap: TRUE crossfade — two persistent slot panels (A + B) live
  in the DOM at all times and swap roles on each click. Outgoing fades
  1→0 while incoming fades 0→1 in lockstep over 450ms on Apple's decel
  ease cubic-bezier(0.16, 1, 0.3, 1). Both panels exist from first
  paint so the browser actually runs the opacity transition (no
  React-mount-transition workarounds needed).

  Hover: very subtle scale-[1.002] (basically imperceptible)

Caption below preview:
  text-[15px] text-[#6E6E73] center
  "Example output. Generate yours below."
  Below that: pricing trio link: "$9 · $29 · $79 — no subscription"
```

### Hero (form)

Two-column on desktop, stacked on mobile. Left = headline + form. Right = TemplateBrowser (above).

OR (alternative): centered single-column with form below the demo. Apple often does this — one focal element top, generous whitespace, action below.

```
Container:   max-w-6xl mx-auto px-8 py-32 sm:py-40

Headline:    Display XL (96px / 1.05 / -0.025em / 700 / text-[#1D1D1F])
             max 2 lines, max-w-4xl, center-aligned
             (Ceiling reached at ~1200px viewports — stays at 96px
              through ultrawide and 4K so it reads commanding on all
              modern monitors. Mobile floors at 56px.)

Subhead:     Body L (19px / 1.55 / text-[#6E6E73])
             max-w-2xl mx-auto mt-6 center-aligned

Demo:        max-w-5xl mx-auto mt-16  (the template browser above)

Form card:   max-w-xl mx-auto mt-12 rounded-2xl bg-white shadow-card p-8
             ↑ The form is ALWAYS wrapped in a white card on the mist
               canvas. A flat form below the TemplateBrowser (itself a
               white card) reads as visually disconnected. Apple-style
               UI surfaces — even simple form sections become deliberate
               elevated cards on canvas.

             Inside the card:
               Two inputs (JD URL + dropzone) stacked
               Primary CTA (h-14 px-8 text-[19px]) full width
               Trust line (text-[15px] text-[#6E6E73] center):
                 "$9 · No subscription · Credits never expire."

Privacy line: text-[13px] text-[#86868B] mt-4 center
              Lives OUTSIDE the form card — footer to the unit.
```

---

## Iconography

- **Style**: Apple-style line icons or filled monochrome. NOT duotone. 1.5px stroke if line.
- **Library**: **Lucide React** stays. Approved set unchanged but applied with `text-[#1D1D1F]` on light surfaces.
- **Sizes**: `size-4` (16px inline), `size-5` (20px default UI), `size-6` (24px section), `size-8` (32px feature).
- **Color**: Inherits surrounding text. Score colors only when semantically tied to a score.

---

## Motion & Animation

Apple's motion is **slower and more eased** than dev-tool brands. 250–400ms is normal for transitions; 600–800ms for hero entrances. Easing leans heavily on `ease-out` (cubic-bezier 0.16, 1, 0.3, 1) — Apple's signature decel.

### Easing

```
default:   cubic-bezier(0.32, 0.72, 0, 1)   /* Apple's standard ease */
decel:     cubic-bezier(0.16, 1, 0.3, 1)    /* Hero entrances, modal pops — strong arrival */
linear:    linear                            /* Loaders only */
```

### Durations

| Use case | Duration |
|---|---|
| Hover / focus state changes (color, border) | 200ms |
| Button press (no scale on press — Apple doesn't) | n/a |
| Modal / drawer open | 350ms |
| Modal / drawer close | 250ms |
| Card hover (shadow change) | 250ms |
| Tab crossfade between content panels (e.g., TemplateBrowser) | 450ms (decel ease — both panels live in DOM, opacity-driven) |
| Page section entrances (initial mount, parallax-style fade-up) | 600ms with 80ms stagger |
| Score badge counter (animating up) | 1200ms (decel ease) |
| Skeleton pulse | 1800ms infinite |

### Motion principle

**Calm, purposeful, slightly slower than you'd expect.** Apple's UI feels expensive partly because nothing rushes. Avoid sub-200ms transitions; they read as flickering on light backgrounds.

### Things to do

- **Fade-up entrances** on scroll (`opacity: 0 → 1` + `translate-y-4 → 0` over 600ms, staggered)
- **Subtle parallax** on hero media (3-6px translation as user scrolls)
- **Soft shadow transitions** on hover (md → lg over 250ms)

### Things never to animate

- Background colors (never a gradient shift)
- Text characters in headlines (no typewriter effect on hero copy)
- Cursor trails, particles, snow, anything decorative
- Icons spinning, bouncing, or "celebrating"

### Skeleton loaders

`CardSkeleton` becomes a soft `bg-[#F5F5F7]` placeholder with `animate-pulse` on individual blocks at 60% opacity. NOT the prior dark-bar pulse — light, gentle.

---

## Logo Usage

- **Primary wordmark**: lowercase text `resume.ai` rendered in Geist Sans / SF Pro Display, weight 600, tracking `-0.005em`. No mark, no glyph, no leading dot.
- **Color**: `text-[#1D1D1F]` on light surfaces. Never invert to white on the marketing pages (we don't HAVE dark surfaces anymore).
- **Sizes**: `text-[20px]` in nav, `text-[24px]` in OG share images, `text-[18px]` in dense product surfaces.
- **Clear space**: Minimum 20px on all sides. Never crop or wrap with adjacent text.
- **Forbidden**:
  - Capitalizing ("Resume.AI" — wrong)
  - Adding "the" ("the resume.ai" — wrong)
  - Splitting onto two lines
  - Adding a tagline next to it
  - Stretching, condensing, italicizing
- **File reference**: No image. Rendered in CSS: `<Link className="text-[20px] font-semibold tracking-tight text-[#1D1D1F]">resume.ai</Link>`. Do not redraw, do not export.

---

## Tone & Copy Guidelines

### Voice attributes

**Confident. Calm. Specific.**

- **Confident** — we made something good and we know it. We don't have to attack competitors to make a point. ("We built the resume tool we wished existed.")
- **Calm** — short, declarative sentences. Periods. No exclamation marks anywhere. Apple's marketing reads as a quiet statement of fact, not a sales pitch.
- **Specific** — concrete numbers, real outcomes, named tools. "Four angles, 30 seconds, $9" beats any superlative. Specificity reads as competence.

The voice IS NOT:
- Insurgent. We're not punk. (Earlier brand version was insurgent; we've outgrown it.)
- Aspirational. We don't promise "your dream job" — we promise to make the work easier.
- Technical-jargon-heavy. We're calm but accessible. ATS = "applicant tracking system" on first mention, then ATS after.
- Combative against competitors. We don't name them in headlines or hero copy. (The DarkPatternCompare block, if shipped, names category practices but not individual brands.)

### Headlines

- Verb-forward or noun-declarative. No questions in hero copy.
  - "Four resumes. One application." ✓
  - "Tailored four ways. Always." ✓
  - "The resume tool you wished existed." ✓
  - "Stop letting AI decide your job for you." ✗ (too insurgent for the new brand)
  - "Unlock your career potential" ✗ (vague, aspirational)
- Sentence case. Periods to end. Max 2 lines on desktop.
- **Use Apple's "verbless rhythm"** sometimes: "Faster. Sharper. Yours." reads as Apple. "Speed. Style. Substance." reads as Apple. Three-word periods.

### Body copy

- Plain language. Short paragraphs (1–2 sentences ideal).
- "Use" not "leverage" or "utilize". "To" not "in order to".
- **Body text size is 17px, not 16px.** This is Apple's standard and it matters.
- Don't say "AI-powered" — instead say *what the AI does*. "Sonnet rewrites your bullets." or "Tailored by the same model used by Anthropic's coding agent."
- Lead with the specific outcome, not the process: "Get four resumes tailored to one job in 30 seconds" beats "Our AI generates multiple variations."

### CTAs

- Action verbs only.
- Approved CTAs:
  - "Try it free" (anonymous demo entry)
  - "See your four" / "Tailor my resume" (hero submit when a JD is staged)
  - "Buy 1 resume — $9" / "Buy 5-pack — $29" / "Buy 20-pack — $79" (pricing — never "Subscribe", never "Get Apply")
  - "Buy more credits" (in-product, when balance is low)
  - "Delete account" (destructive)
- Apple tends NOT to use arrow suffixes (` →`) — drop them in this brand. Use them only on inline-prose links.
- Buttons say what happens after the click, not how you feel about it. "Sign up free" not "Get started"; "Tailor my resume" not "Make magic."

### Pricing copy (Hormozi GSO, Apple-translated)

Three packs, anchored center. **No subscription.** **Credits never expire.**

- **Single — $9** (1 credit)
  - "Tailored for one job. One purchase. Done."
  - 4 resume angles + 3 cover letter variants + ATS + fine-tune
- **5-pack — $29** ← MOST POPULAR (anchored, scale 1.02, shadow-xl)
  - "For the active job hunt."
  - Everything in Single, × 5
  - LinkedIn profile rewrite (1× included)
  - $5.80 per resume
- **20-pack — $79**
  - "The full job hunt, ammunition included."
  - Everything in 5-pack, × 4
  - Cover letters bilingual (English + Spanish)
  - 10 × interview prep sessions
  - 20 × outreach DM templates
  - 1 × human review by certified recruiter
  - $3.95 per resume

Guarantee block copy (verbatim, do not change):
> **30 days. No interview, full refund.**
> One email. No support hoops.

Anti-patterns in pricing:
- No "Save 67%" red stickers. No fake red badges. No strikethrough discounts.
- No "Only 3 left" / fake countdowns / scarcity theater.
- No "subscribe" / "monthly" / "annual" anywhere. The model is per-unit credits.
- No "limited time bundle" / "today only".

### Error messages

- State what happened. State the next step. Calmly.
  - "You're out of credits. Pick a pack to start a new run." ✓
  - "Too many submissions from your network. Sign up to keep going." ✓
  - "Something went wrong. Try again." ✓ (use only when genuinely unknown)
  - "Error 500" ✗
  - "Oops!" ✗

### Microcopy

- Loading: present-tense verb + period. "Tailoring." "Rewriting." "Loading."
- Empty states: state the gap, offer the next step. "No runs yet." "Tailor your first resume."
- Confirmation: declarative past tense + delta. "Updated. ATS score 87 (was 79)."

---

## Example Layouts

### Landing hero (`src/app/page.tsx`)

```
SiteNav (h-16, sticky, blur-bg)

section.hero (py-32 sm:py-40, max-w-6xl):
  Display XL (center):
    "Four resumes.
     One application."             (or)
    "Tailored four ways. Always."

  Body L (text-[#6E6E73], center, max-w-2xl):
    "One job. Four angles. Thirty seconds.
     We tailor your resume four ways so you can pick the one that lands."

  spacer (mt-16)

  TemplateBrowser (max-w-5xl mx-auto):
    [Classic | Modern | Creative | Minimal]  pill tabs
    big white-paper preview, scaled at 52%, soft shadow

  spacer (mt-12)

  Hero form — wrapped in a white card (NOT flat on the mist canvas):
    div.max-w-xl.mx-auto.rounded-2xl.bg-white.shadow-card.p-8
      JD URL input
      ResumeDropzone
      Primary CTA: "Tailor my resume" (h-14, rounded-full)
      Trust line (text-[15px] text-[#6E6E73] center):
        "$9 · No subscription · Credits never expire"

    The card wrapper is load-bearing: above the form, the TemplateBrowser
    is ALSO a white-card-on-mist surface. A flat form below it reads as
    visually disconnected from the page's elevated-card rhythm.
    Apple-style — even simple form sections sit inside an elevated card
    so the page reads as a series of deliberate surfaces on canvas.

  Privacy line (mt-4, center, text-[13px] text-[#86868B]):
    Lives OUTSIDE the form card. Reads as a footer to the form unit,
    not in-form meta-copy.

section.howItWorks (py-24, bg-white):
  H2 center: "How it works"
  3-step grid with mono numerals and gentle line icons

section.fourAngles (py-24, max-w-6xl):
  H2 left-aligned: "Tailored four ways."
  Sub: "Engineering depth. Leadership. Cross-functional. Specialist."
  4-card grid showing each angle with its directive in plain prose

section.templateGallery (py-24, bg-[#FAFAFA]):
  H2 center: "Eight samples."
  Body S center: "Real output. Real JDs. No templates dressed up as content."
  Horizontal scroll-rail (TemplateGallery component) of 8 tiles

section.beforeAfter (py-24):
  H2 center: "What 'tailored' actually means."
  BeforeAfter component — two columns, ATS 64 vs 91, recruiter quote between

section.atsHonesty (py-24, bg-[#FAFAFA]):
  Three-block "Why we score honest" — The floor / The ceiling / What ATS isn't

section.manifesto (py-24):
  Two-column "What we don't do" + voice statement

section.closingCTA (py-32):
  Display: "Start with one."
  Pricing trio (3 PackCards inline, abbreviated — link to /pricing for detail)
  Guarantee block
  Big CTA

section.darkPatternCompare (py-24, bg-[#FAFAFA]):
  "What we don't do" table — category practices vs ours
  (Renamed from "dark pattern compare" — softer framing.)

SiteFooter (light variant)
```

### Pricing (`/pricing`)

Same content as before but Apple-styled — center-aligned hero, pill tabs above the cards if we add a "monthly vs one-time" toggle (we don't — per-unit only), big PackCards with soft shadows.

### Settings, Dashboard, Run, Edit pages

Convert all surfaces to the light aesthetic:
- `bg-[#F5F5F7]` page background instead of `bg-black`
- Cards on `bg-white` with `shadow-md`
- Text in `text-[#1D1D1F]`
- Hairline borders `border-[#D2D2D7]`
- Pill primary buttons
- Apple-style modals + dropdowns

Score badges stay semantic (green/amber/red). Angle chips stay editorial blue on white. Everything else loses the dark-only constraint.

---

## Claude Design Usage Notes

This is the **light brand**. Reference it at the start of every session.

### Defaults to assume

- **Tech stack unchanged**: Next.js 16 App Router + Tailwind CSS v4 + shadcn/ui + Lucide React. Geist Sans / Mono still our typeface.
- **Color tokens**: Use the hex values above directly via Tailwind's arbitrary-value syntax (`bg-[#F5F5F7]`) OR add to a `tokens.ts` file. Don't try to map onto Tailwind's neutral-* / gray-* scale — Apple's values are warmer than those.
- **Logo**: Always render as CSS text. Never import an image.
- **No dark mode**: v1 ships light only. If we add dark later, it's a deliberate feature, not a default.

### What Aura should preserve (business invariants — unchanged across visual versions)

1. **Pack structure + amounts**: Single $9 / 5-pack $29 (anchored center) / 20-pack $79 with bonuses. Subscription is dead. Credits never expire.
2. **Bundled cover letter**: every credit = 4 resume angles + 3 cover letter variants. Never sold separately.
3. **Hormozi 30-day guarantee copy**: "30 days. No interview, full refund. One email. No support hoops."
4. **ATS score band colors**: green ≥85 / amber 70–84 / red <70. Don't change thresholds.
5. **The 4-angle output structure**: Engineering depth / Leadership / Cross-functional / Specialist. Names stay. Templates: Classic / Modern / Creative / Minimal.
6. **NYU bullet-writing rules (applied to AI prompts at `convex/ai/runAngle.ts`)**: action verbs, no first person, quantified, skill-based, four-question framing, tense-by-role-recency, no soft skills in additionalInfo. See `docs/nyu-action-verbs.md`.
7. **Convex API contracts**: all queries / mutations / actions stay named the same. UI layer is the only thing changing.

### Three brand signatures (preserved across the visual pivot)

1. **Brand "accent" is the inversion** — primary CTAs are `bg-[#1D1D1F] text-white` (dark-on-light, the brand pulls power from the inversion of the canvas).
2. **Editorial blue on angle chips** — `text-[#3B82F6]` on white resume-paper surfaces. The lone chromatic moment on a resume preview, identifying the angle. Preserve.
3. **Monospaced ATS scores** — Geist Mono / SF Mono, tabular-nums. Numbers don't jitter when they change.

### What's intentionally different from prior versions

- **Light, not dark.** Everything that was `bg-black` becomes `bg-[#F5F5F7]`. `text-white` becomes `text-[#1D1D1F]`. `border-neutral-800` becomes `border-[#D2D2D7]`.
- **Pill-shaped buttons** instead of rounded-md/lg.
- **Bigger body type** — 17px not 16px.
- **More whitespace** — sections are `py-24` to `py-32`, not `py-12` to `py-16`.
- **Softer shadows** — two-layer diffuse, low-opacity.
- **Calm voice** — no insurgent attacks; confidence and specificity instead.
- **Template Browser, NOT JD Picker** — the hero demo lets you switch between Classic / Modern / Creative / Minimal **templates**, not between famous job descriptions. The previous JD-picker assumed visitors care about *which JD*; they actually care about *what their resume looks like*.

### Visual signatures to bring forward from Apple's playbook

- One focal element per section. Generous gutters around it.
- Display headlines big and quiet. No glow, no gradient.
- Soft shadows on white cards — never harsh borders.
- Pill primary buttons (`rounded-full px-6 py-3`).
- Backdrop-blur sticky nav with `bg-white/80`.
- Long, slow ease-out motion (300–600ms range).
- Sentence-case everywhere. No SHOUTY UPPERCASE except angle chips and pricing labels.
