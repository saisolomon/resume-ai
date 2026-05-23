// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 6am UTC ≈ 1-2am Eastern (low-traffic). The cron fires the
// deleteExpiredAnonymousData internal action, which delegates to the
// _deleteExpired internal mutation.
crons.daily(
  "anonymous_data_retention",
  { hourUTC: 6, minuteUTC: 0 },
  internal.retention.deleteExpiredAnonymousData,
);

export default crons;
