# Environment Variables

This app spans two backends — **Next.js running on Vercel** and **Convex** — and each one has its own env-var store. A working production install needs the right values set in **both** places. This doc is the canonical list.

When the two stores drift (e.g. Vercel has live Stripe keys but Convex still has test ones), the app appears to work but real payments silently fail in the Convex webhook handler. The whole point of this doc is to prevent that.

---

## Where each var lives

| Var | Vercel | Convex | Notes |
|---|:-:|:-:|---|
| `ANTHROPIC_API_KEY` | — | ✅ | Read by `convex/ai/*` actions. |
| `FIRECRAWL_API_KEY` | — | ✅ | Read by `convex/jobDescriptionsActions.ts`. |
| `CLERK_JWT_ISSUER_DOMAIN` | ✅ | ✅ | Vercel uses it for Clerk middleware; Convex uses it in `auth.config.ts` to validate the JWT. **Must match exactly.** |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | — | Inlined into the client bundle. |
| `CLERK_SECRET_KEY` | ✅ | — | Used by Next.js API routes. |
| `STRIPE_SECRET_KEY` | ✅ | ✅ | Vercel uses it in `/api/stripe/checkout`; Convex uses it in `stripeActions.processStripeEvent` to expand checkout sessions. **Must be the same key (test ↔ test, live ↔ live).** |
| `STRIPE_WEBHOOK_SECRET` | — | ✅ | Convex verifies webhook signatures. Tied to the specific webhook endpoint registered on Stripe (one per environment). |
| `STRIPE_SINGLE_PRICE_ID` | ✅ | ✅ | Vercel passes it as the checkout line item; Convex matches it against the incoming webhook to credit the right pack. **Drift here = users pay but never get credits.** |
| `STRIPE_5PACK_PRICE_ID` | ✅ | ✅ | Same as above. |
| `STRIPE_20PACK_PRICE_ID` | ✅ | ✅ | Same as above. |
| `STRIPE_PRO_PRICE_ID` | ✅ | ✅ | Legacy subscription model. `buildPriceTierMap()` throws if missing — point at any valid live price (we use the 5-pack ID). |
| `STRIPE_CAREER_PRICE_ID` | ✅ | ✅ | Legacy subscription model. Same as above (we use the 20-pack ID). |
| `NEXT_PUBLIC_CONVEX_URL` | ✅ | — | Inlined into the client bundle so it can subscribe to queries. **Auto-set** by `convex deploy --cmd ...` during the Vercel build. |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | ✅ | — | HTTP-handler endpoint Stripe webhooks point at. **Auto-set** by `convex deploy --cmd ...`. |
| `CONVEX_DEPLOY_KEY` | ✅ (Production only) | — | Used by `scripts/vercel-build.sh` to push Convex functions on every prod build. Preview builds skip the Convex step. |
| `FINGERPRINT_SALT` | ✅ | — | Salts per-browser fingerprint hashes for anonymous rate-limiting. Rotate weekly. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | — | Used in `layout.tsx` for OG image / sitemap absolute URLs. |

---

## How to set values

### Vercel

```bash
# Inspect what's set
vercel env ls

# Add or update a value (Production scope)
vercel env add NAME production
# Or non-interactive:
vercel env add NAME production --value "..." --no-sensitive
```

Sensitive values get masked in `vercel env pull` output (the local file shows them as empty quotes), which is fine — they're still inlined at build time.

### Convex

```bash
# Point at prod
export CONVEX_DEPLOYMENT=prod:blissful-butterfly-235

# List
npx convex env list

# Set one
npx convex env set NAME "value"

# Bulk set from a .env-formatted file
npx convex env set --from-file /path/to/values.env --force
```

Convex env vars are **separate** from `.env.local`. Setting `.env.local` only affects local Next.js dev — Convex deployments don't read it.

---

## Going-live checklist

When promoting the project from test mode to live (real money):

1. **Stripe** — create live products + prices + webhook endpoint in the Stripe dashboard. Note the live price IDs and webhook secret.
2. **Vercel Production env** — update `STRIPE_SECRET_KEY` (sk_live_…), `STRIPE_*_PRICE_ID` (live IDs), `STRIPE_WEBHOOK_SECRET` (live secret).
3. **Convex Production env** — `npx convex env set --from-file ...` with the same values (this is the step that's easy to forget — the failure mode is silent).
4. **Clerk** — same drill for the JWT issuer domain (dev → prod tenant) on **both** Vercel and Convex.
5. **Smoke test** — sign in, buy 1 credit with a real card, confirm credit lands in the dashboard, refund via Stripe dashboard after.

If a payment succeeds on Stripe but the user doesn't see a credit, the failure is almost always step 3 (Convex env still pointing at test prices or test webhook secret).
