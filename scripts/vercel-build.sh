#!/usr/bin/env bash
# Vercel build entry point.
#
# Production environments have CONVEX_DEPLOY_KEY set, so we run
# `convex deploy --cmd ...` which pushes the Convex functions + schema
# changes BEFORE building Next.js. If the Convex deploy fails (schema
# mismatch, function error), the whole build aborts and nothing ships.
#
# Preview environments don't have CONVEX_DEPLOY_KEY (we don't run a
# separate Convex preview deployment per branch), so we just build
# Next.js straight. Preview pages exercise the current prod Convex
# deployment — fine for verifying frontend changes; PRs that introduce
# new Convex functions will only get those functions live once the PR
# is merged and the production build runs.
set -euo pipefail

if [ -n "${CONVEX_DEPLOY_KEY:-}" ]; then
  echo "→ CONVEX_DEPLOY_KEY present — running convex deploy + next build"
  exec npx convex deploy --cmd 'npm run build' --yes
else
  echo "→ No CONVEX_DEPLOY_KEY — running next build only (preview environment)"
  exec npm run build
fi
