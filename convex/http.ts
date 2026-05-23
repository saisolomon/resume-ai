// convex/http.ts
import { httpRouter } from "convex/server";
import { stripeWebhook } from "./stripeWebhook";

const http = httpRouter();

http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: stripeWebhook,
});

export default http;
