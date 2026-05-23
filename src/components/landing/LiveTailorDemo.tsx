"use client";
import { useEffect, useReducer, useRef } from "react";
import { ScoreBadge } from "@/components/try/ScoreBadge";

/**
 * LiveTailorDemo — the landing hero centerpiece.
 *
 * Replaces v4's `<HeroPreview>` (a single tab-switched resume preview) with
 * a scripted four-angle demo: pick one of three famous JDs, watch all four
 * angles tailor themselves in ~3 seconds. The animation is pre-canned —
 * frozen sample data, CSS / JS state transitions, no API calls.
 *
 * Why scripted, not live: real generation costs marginal AI per anonymous
 * visitor + needs new Convex actions. Pre-canned ships now and answers
 * the same job-to-be-done — "show me the actual output before I commit."
 * The honest framing line beneath the demo preserves trust.
 *
 * Animation choreography (per JD selection):
 *   t=0      → all 4 cards collapse to skeleton state
 *   t=120ms  → card 0 begins typewriter on its headline (Engineering depth)
 *   t=200ms  → card 1 begins typewriter (Leadership)
 *   t=280ms  → card 2 begins typewriter (Cross-functional)
 *   t=360ms  → card 3 begins typewriter (Specialist)
 *   t=~1200ms → typewriter complete; ATS counter starts on each card
 *   t=~1500ms → ATS counter complete; keyword chips light up in stagger
 *   t=~2400ms → done; "Generate yours" CTA pulse-attention
 *
 * Visitor sees the product in 8 seconds. Then the form below converts.
 */

// ──────────────────────────────────────────────────────────────────────
// Sample data — 3 JDs × 4 angles = 12 frozen scripts.
// Personas: Ria Patel (Stripe), Amanda Chen (Anthropic), Marco Vellanueva
// (OpenAI). Headlines + bullets vary per angle within each persona so the
// "tailoring" effect is visible.
// ──────────────────────────────────────────────────────────────────────

export type AngleKey = "engineering" | "leadership" | "crossfunc" | "specialist";

type AngleScript = {
  key: AngleKey;
  label: string;
  headline: string;
  bullets: string[];
  score: number;
  keywords: string[];
};

type Jd = {
  id: "stripe" | "anthropic" | "openai";
  company: string;
  role: string;
  postedAt: string;
  url: string;
  candidate: string;
  angles: AngleScript[];
};

const JDS: Jd[] = [
  {
    id: "stripe",
    company: "Stripe",
    role: "Senior Software Engineer — Payments Reliability",
    postedAt: "Posted 4 days ago",
    url: "jobs.lever.co/stripe/senior-engineer-payments-reliability",
    candidate: "Ria Patel",
    angles: [
      {
        key: "engineering",
        label: "Engineering depth",
        headline: "Senior Software Engineer · Payments Reliability",
        bullets: [
          "Cut P99 charge-API latency 47% by sharding the ledger and pre-warming downstream caches.",
          "Owned the 2024 dispute-handler rewrite — 9 services, zero customer-visible regressions.",
        ],
        score: 91,
        keywords: ["P99 latency", "distributed", "ledger", "incident", "Postgres", "Go", "SLO"],
      },
      {
        key: "leadership",
        label: "Leadership",
        headline: "Tech Lead · Payments Reliability",
        bullets: [
          "Led 9-engineer team across two timezones; shipped the dispute-handler rewrite on schedule.",
          "Promoted two engineers from L4 to L5 in 18 months.",
        ],
        score: 88,
        keywords: ["team lead", "mentorship", "cross-team", "headcount", "roadmap", "scope"],
      },
      {
        key: "crossfunc",
        label: "Cross-functional",
        headline: "Senior Engineer · Payments Reliability",
        bullets: [
          "Partnered with Product and Risk to ship a faster dispute path — cut merchant complaints 22%.",
          "Drove a four-team RFC on idempotency keys that ended a quarter of recurring incidents.",
        ],
        score: 84,
        keywords: ["PM partnership", "RFC", "exec comms", "Risk", "merchant", "stakeholder"],
      },
      {
        key: "specialist",
        label: "Specialist",
        headline: "Distributed Systems Engineer · Payments",
        bullets: [
          "Designed the per-account sharding scheme behind the global ledger.",
          "Wrote three internal papers on consensus failure modes during the 2023 AZ outage.",
        ],
        score: 79,
        keywords: ["Raft", "Paxos", "consensus", "sharding", "FoundationDB", "AZ failover"],
      },
    ],
  },
  {
    id: "anthropic",
    company: "Anthropic",
    role: "Product Manager — Developer Platform",
    postedAt: "Posted 2 days ago",
    url: "jobs.ashbyhq.com/anthropic/pm-developer-platform",
    candidate: "Amanda Chen",
    angles: [
      {
        key: "engineering",
        label: "Engineering depth",
        headline: "Product Manager · Developer Platform",
        bullets: [
          "Shipped the Claude Agent SDK v1 with 4 partner teams; 12k weekly active integrators in quarter one.",
          "Wrote the eval framework that gated every model release after October 2025.",
        ],
        score: 92,
        keywords: ["SDK", "API", "eval", "model release", "developer", "TypeScript"],
      },
      {
        key: "leadership",
        label: "Leadership",
        headline: "Senior PM · Developer Platform",
        bullets: [
          "Built the 5-PM dev-platform pod from one hire to a full team; owned hiring loop end-to-end.",
          "Ran weekly engineering / research alignment that unblocked three model-launch dependencies.",
        ],
        score: 89,
        keywords: ["org design", "hiring", "alignment", "research", "execution", "headcount"],
      },
      {
        key: "crossfunc",
        label: "Cross-functional",
        headline: "Product Manager · Developer Platform",
        bullets: [
          "Co-led the Claude Code launch with Eng, Comms, and DevRel — 2.4M signups in week one.",
          "Wrote the GTM brief for the Agent SDK that anchored Q4 partner outreach.",
        ],
        score: 86,
        keywords: ["launch", "GTM", "DevRel", "Comms", "partner", "narrative"],
      },
      {
        key: "specialist",
        label: "Specialist",
        headline: "Developer Tools PM · LLM Platforms",
        bullets: [
          "Designed the streaming-response spec adopted by 3 third-party agent frameworks.",
          "Built the public model-card pipeline that ships with every Claude release.",
        ],
        score: 81,
        keywords: ["LLM", "streaming", "agents", "model card", "tool use", "RAG"],
      },
    ],
  },
  {
    id: "openai",
    company: "OpenAI",
    role: "Research Engineer — Post-Training",
    postedAt: "Posted 6 days ago",
    url: "openai.com/careers/research-engineer-post-training",
    candidate: "Marco Vellanueva",
    angles: [
      {
        key: "engineering",
        label: "Engineering depth",
        headline: "Research Engineer · Post-Training Infrastructure",
        bullets: [
          "Built the RLHF pipeline that trained two production models; sustained 38k GPU-hours per week.",
          "Cut reward-model training time 4× with a custom data-parallel sharding strategy.",
        ],
        score: 93,
        keywords: ["RLHF", "GPU", "CUDA", "PyTorch", "training", "infrastructure"],
      },
      {
        key: "leadership",
        label: "Leadership",
        headline: "Senior Research Engineer · Post-Training",
        bullets: [
          "Led 6-person infra team through two model launches; owned the on-call rotation.",
          "Authored the team's experiment-review charter — adopted by adjacent research orgs.",
        ],
        score: 87,
        keywords: ["team lead", "review", "rotation", "charter", "scope", "hiring"],
      },
      {
        key: "crossfunc",
        label: "Cross-functional",
        headline: "Research Engineer · Post-Training",
        bullets: [
          "Partnered with Safety and Policy to ship the refusal-tuning dataset that shipped with GPT-5.",
          "Co-authored two technical blog posts that translated training results for product leadership.",
        ],
        score: 83,
        keywords: ["Safety", "Policy", "writing", "evals", "blog", "alignment"],
      },
      {
        key: "specialist",
        label: "Specialist",
        headline: "ML Systems Engineer · Distributed Training",
        bullets: [
          "Wrote the all-reduce kernel that bumped pipeline-parallel throughput 22% on H100 clusters.",
          "Owned the in-house profiler used by every post-training run.",
        ],
        score: 76,
        keywords: ["H100", "all-reduce", "profiler", "kernel", "Triton", "NCCL"],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────────
// Reducer — drives the phased animation per JD selection.
// ──────────────────────────────────────────────────────────────────────

type Phase = "idle" | "typing" | "scoring" | "chips" | "done";

type State = {
  jdIndex: number;
  phase: Phase;
  charsTyped: number; // monotonic; capped at the longest headline length
  scoreProgress: number; // 0..1
  chipsLit: number;
  /** monotonic counter; bumped each time the visitor reselects a JD so
   * the cards re-key + replay without a flicker of stale content. */
  runId: number;
};

type Action =
  | { type: "select"; jdIndex: number }
  | { type: "tick-type"; chars: number }
  | { type: "tick-score"; progress: number }
  | { type: "tick-chips"; lit: number }
  | { type: "phase"; phase: Phase };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return {
        jdIndex: action.jdIndex,
        phase: "typing",
        charsTyped: 0,
        scoreProgress: 0,
        chipsLit: 0,
        runId: state.runId + 1,
      };
    case "tick-type":
      return { ...state, charsTyped: action.chars };
    case "tick-score":
      return { ...state, scoreProgress: action.progress };
    case "tick-chips":
      return { ...state, chipsLit: action.lit };
    case "phase":
      return { ...state, phase: action.phase };
    default:
      return state;
  }
}

const INITIAL_STATE: State = {
  jdIndex: 0,
  phase: "typing",
  charsTyped: 0,
  scoreProgress: 0,
  chipsLit: 0,
  runId: 0,
};

// ──────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────

const TYPE_MS_PER_CHAR = 22;
const SCORE_DURATION_MS = 900;
const CHIP_STAGGER_MS = 90;
const PHASE_GAP_MS = 180;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ──────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────

export function LiveTailorDemo() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  // Timer handles. Cleared on JD switch + unmount so re-selection during
  // an in-flight animation cleanly restarts rather than overlapping.
  const timersRef = useRef<{
    type?: ReturnType<typeof setInterval>;
    score?: number;
    chip?: ReturnType<typeof setInterval>;
    phaseTransitions: ReturnType<typeof setTimeout>[];
  }>({ phaseTransitions: [] });

  const jd = JDS[state.jdIndex];

  // Phase driver — restarts each time runId bumps (new JD selection).
  useEffect(() => {
    const handles = timersRef.current;
    // Clear any in-flight timers.
    if (handles.type) clearInterval(handles.type);
    if (handles.score) cancelAnimationFrame(handles.score);
    if (handles.chip) clearInterval(handles.chip);
    handles.phaseTransitions.forEach((t) => clearTimeout(t));
    handles.phaseTransitions = [];

    // Typewriter — drives charsTyped from 0 → length-of-longest-headline.
    const longestHeadline = Math.max(...jd.angles.map((a) => a.headline.length));
    let charsTyped = 0;
    handles.type = setInterval(() => {
      charsTyped += 1;
      dispatch({ type: "tick-type", chars: charsTyped });
      if (charsTyped >= longestHeadline) {
        if (handles.type) clearInterval(handles.type);
        // After a brief gap, start scoring.
        const t1 = setTimeout(() => {
          dispatch({ type: "phase", phase: "scoring" });
          const start = performance.now();
          const animateScore = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / SCORE_DURATION_MS);
            dispatch({ type: "tick-score", progress: easeOutCubic(progress) });
            if (progress < 1) {
              handles.score = requestAnimationFrame(animateScore);
            } else {
              // Then chips.
              const t2 = setTimeout(() => {
                dispatch({ type: "phase", phase: "chips" });
                const maxChips = Math.max(...jd.angles.map((a) => a.keywords.length));
                let lit = 0;
                handles.chip = setInterval(() => {
                  lit += 1;
                  dispatch({ type: "tick-chips", lit });
                  if (lit >= maxChips) {
                    if (handles.chip) clearInterval(handles.chip);
                    const t3 = setTimeout(() => {
                      dispatch({ type: "phase", phase: "done" });
                    }, PHASE_GAP_MS);
                    handles.phaseTransitions.push(t3);
                  }
                }, CHIP_STAGGER_MS);
              }, PHASE_GAP_MS);
              handles.phaseTransitions.push(t2);
            }
          };
          handles.score = requestAnimationFrame(animateScore);
        }, PHASE_GAP_MS);
        handles.phaseTransitions.push(t1);
      }
    }, TYPE_MS_PER_CHAR);

    return () => {
      if (handles.type) clearInterval(handles.type);
      if (handles.score) cancelAnimationFrame(handles.score);
      if (handles.chip) clearInterval(handles.chip);
      handles.phaseTransitions.forEach((t) => clearTimeout(t));
    };
    // We intentionally re-run on runId — selecting the same JD twice still
    // restarts. (jd is a derived value from jdIndex which bumps with runId.)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.runId]);

  return (
    <section
      aria-label="Live Tailor demo — see four resume angles generated from one job posting"
      className="relative w-full"
    >
      <div className="rounded-2xl border border-neutral-800 bg-neutral-950">
        {/* ─── Console-style header ─── */}
        <div className="flex flex-col gap-3 border-b border-neutral-900 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex size-1.5 rounded-full bg-green-500" aria-hidden="true" />
            <span className="uppercase tracking-[0.08em] text-neutral-500">
              run / live-demo
            </span>
            <span className="text-neutral-700">·</span>
            <span className="text-neutral-400">
              <span className="tabular-nums text-neutral-300">{jd.candidate}</span>
              <span className="text-neutral-700"> → </span>
              <span className="tabular-nums">{jd.company}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
            <span className="text-neutral-600">elapsed</span>
            <span className="tabular-nums text-neutral-300">
              {state.phase === "done" ? "27.4s" : "—"}
            </span>
            <span className="text-neutral-700">·</span>
            <span className="tabular-nums text-neutral-300">
              {state.phase === "done" ? "04" : "00"}
            </span>
            <span className="text-neutral-500"> / 04 ready</span>
          </div>
        </div>

        {/* ─── JD selector ─── */}
        <div
          role="tablist"
          aria-label="Sample job postings"
          className="flex flex-col gap-px border-b border-neutral-900 bg-neutral-900 sm:grid sm:grid-cols-3"
        >
          {JDS.map((sample, i) => {
            const isActive = i === state.jdIndex;
            return (
              <button
                key={sample.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => dispatch({ type: "select", jdIndex: i })}
                className={`group relative flex flex-col gap-1 px-5 py-4 text-left transition-colors focus:outline-none focus-visible:bg-neutral-900 ${
                  isActive ? "bg-neutral-950" : "bg-neutral-950 hover:bg-neutral-900"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                      isActive ? "text-white" : "text-neutral-500"
                    }`}
                  >
                    {sample.company}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-600">
                    · {sample.postedAt}
                  </span>
                </span>
                <span
                  className={`text-sm transition-colors ${
                    isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-200"
                  }`}
                >
                  {sample.role}
                </span>
                <span className="font-mono text-[10px] text-neutral-600">
                  {sample.url}
                </span>
                {isActive && (
                  <span
                    className="absolute inset-x-0 -bottom-px h-px bg-white"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── 4-angle grid ─── */}
        <div
          className="grid gap-px bg-neutral-900 sm:grid-cols-2 lg:grid-cols-4"
          // Key on runId so on re-select the whole grid re-mounts and re-runs
          // the CSS appear transitions cleanly.
          key={`grid-${state.runId}`}
        >
          {jd.angles.map((angle, idx) => (
            <AngleCard
              key={`${state.runId}-${angle.key}`}
              angle={angle}
              order={idx}
              state={state}
            />
          ))}
        </div>

        {/* ─── Footer honest line ─── */}
        <div className="flex flex-col gap-2 border-t border-neutral-900 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-neutral-500">
            Example output. Generated from the JD above. No card. No signup.
          </p>
          <p className="text-[11px] text-neutral-500">
            <span className="text-neutral-400">$9</span> for one job ·{" "}
            <span className="text-neutral-400">$29</span> for five · credits never expire.
          </p>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AngleCard — single tile in the 4-up grid.
// ──────────────────────────────────────────────────────────────────────

function AngleCard({
  angle,
  order,
  state,
}: {
  angle: AngleScript;
  /** 0..3 — used to stagger the typewriter offset between cards. */
  order: number;
  state: State;
}) {
  // Each card lags the global typewriter clock by `order * 6` chars, so the
  // four headlines write in a clearly-staggered cascade rather than all at
  // once. (Cap at 0 so we never go negative.)
  const cardOffset = order * 6;
  const charsForThisCard = Math.max(0, state.charsTyped - cardOffset);
  const visibleHeadline = angle.headline.slice(0, charsForThisCard);
  const isHeadlineDone = visibleHeadline.length >= angle.headline.length;

  // Score number — eased counter when scoring/chips/done phase reached.
  const displayScore =
    state.phase === "typing"
      ? 0
      : state.phase === "scoring"
        ? Math.round(state.scoreProgress * angle.score)
        : angle.score;

  return (
    <article
      aria-label={`${angle.label} — ATS score ${angle.score}`}
      className="relative flex min-h-[280px] flex-col gap-3 bg-neutral-950 p-5"
    >
      {/* Angle chip — editorial blue on white, the brand's signature
          chromatic moment. */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
          {angle.label}
        </span>
        {/* Score badge — always rendered but starts at zero until scoring
            phase begins. */}
        {state.phase === "typing" ? (
          <span
            aria-label="ATS score pending"
            className="inline-flex items-center justify-center rounded-full bg-neutral-800 px-2.5 py-1 font-mono text-sm font-semibold tabular-nums text-neutral-600"
          >
            00
          </span>
        ) : (
          <ScoreBadge score={displayScore} size="md" />
        )}
      </div>

      {/* Headline — typewriter target. Reserve the full height of two
          lines so the card layout doesn't jump when the text writes in. */}
      <div className="min-h-[2.6rem]">
        <h3 className="text-sm font-semibold leading-snug text-white">
          {visibleHeadline}
          {!isHeadlineDone && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-3.5 w-px translate-y-px bg-white animate-pulse"
            />
          )}
        </h3>
      </div>

      {/* Bullets — render together once the headline finishes. Each bullet
          fades in with a small stagger. */}
      <ul className="flex flex-1 flex-col gap-2">
        {angle.bullets.map((bullet, i) => (
          <li
            key={i}
            className={`flex items-start gap-2 text-xs leading-relaxed transition-all duration-300 ease-out ${
              isHeadlineDone
                ? "translate-y-0 text-neutral-300 opacity-100"
                : "translate-y-1 text-neutral-300 opacity-0"
            }`}
            style={{
              transitionDelay: isHeadlineDone ? `${i * 140}ms` : "0ms",
            }}
          >
            <span
              aria-hidden="true"
              className="mt-1.5 size-1 flex-shrink-0 rounded-full bg-neutral-700"
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>

      {/* Keyword chips — light up one by one in chips phase. */}
      <div
        className="mt-1 flex flex-wrap gap-1.5"
        aria-label="JD keyword matches"
      >
        {angle.keywords.map((kw, i) => {
          const isLit =
            state.phase === "chips" || state.phase === "done"
              ? i < state.chipsLit
              : false;
          return (
            <span
              key={kw}
              className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] transition-all duration-200 ${
                isLit
                  ? "border border-green-600/40 bg-green-600/15 text-green-400"
                  : "border border-neutral-800 bg-neutral-900 text-neutral-600"
              }`}
            >
              {kw}
            </span>
          );
        })}
      </div>
    </article>
  );
}
