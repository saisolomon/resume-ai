/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_anthropic from "../ai/anthropic.js";
import type * as ai_runAngle from "../ai/runAngle.js";
import type * as ai_score from "../ai/score.js";
import type * as cards from "../cards.js";
import type * as cardsActions from "../cardsActions.js";
import type * as chatMessages from "../chatMessages.js";
import type * as claim from "../claim.js";
import type * as cleanup from "../cleanup.js";
import type * as dashboard from "../dashboard.js";
import type * as http from "../http.js";
import type * as ipVelocity from "../ipVelocity.js";
import type * as jobDescriptions from "../jobDescriptions.js";
import type * as jobDescriptionsActions from "../jobDescriptionsActions.js";
import type * as rateLimit from "../rateLimit.js";
import type * as resumes from "../resumes.js";
import type * as resumesActions from "../resumesActions.js";
import type * as runs from "../runs.js";
import type * as runsActions from "../runsActions.js";
import type * as scrape_canonicalize from "../scrape/canonicalize.js";
import type * as scrape_direct from "../scrape/direct.js";
import type * as scrape_extract from "../scrape/extract.js";
import type * as scrape_firecrawl from "../scrape/firecrawl.js";
import type * as scrape_routing from "../scrape/routing.js";
import type * as stripe from "../stripe.js";
import type * as stripeActions from "../stripeActions.js";
import type * as stripeWebhook from "../stripeWebhook.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/anthropic": typeof ai_anthropic;
  "ai/runAngle": typeof ai_runAngle;
  "ai/score": typeof ai_score;
  cards: typeof cards;
  cardsActions: typeof cardsActions;
  chatMessages: typeof chatMessages;
  claim: typeof claim;
  cleanup: typeof cleanup;
  dashboard: typeof dashboard;
  http: typeof http;
  ipVelocity: typeof ipVelocity;
  jobDescriptions: typeof jobDescriptions;
  jobDescriptionsActions: typeof jobDescriptionsActions;
  rateLimit: typeof rateLimit;
  resumes: typeof resumes;
  resumesActions: typeof resumesActions;
  runs: typeof runs;
  runsActions: typeof runsActions;
  "scrape/canonicalize": typeof scrape_canonicalize;
  "scrape/direct": typeof scrape_direct;
  "scrape/extract": typeof scrape_extract;
  "scrape/firecrawl": typeof scrape_firecrawl;
  "scrape/routing": typeof scrape_routing;
  stripe: typeof stripe;
  stripeActions: typeof stripeActions;
  stripeWebhook: typeof stripeWebhook;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
