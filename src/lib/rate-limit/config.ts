import "server-only";

import { z } from "zod";

import type { RateLimitPolicy } from "@/lib/rate-limit/types";

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const RATE_LIMIT_BACKEND_TIMEOUT_MS = 5 * SECOND_MS;

export const RATE_LIMIT_POLICIES = {
  authSession: {
    limit: 5,
    window: "10 m",
    windowMs: 10 * MINUTE_MS,
    prefix: "croissant-dar:auth-session",
  },
  adminMutation: {
    limit: 30,
    window: "1 m",
    windowMs: MINUTE_MS,
    prefix: "croissant-dar:admin-mutation",
  },
  upload: {
    limit: 10,
    window: "10 m",
    windowMs: 10 * MINUTE_MS,
    prefix: "croissant-dar:upload",
  },
} as const satisfies Record<string, RateLimitPolicy>;

const upstashEnvironmentSchema = z.strictObject({
  url: z.url().refine((value) => value.startsWith("https://"), {
    message: "The Upstash Redis REST URL must use HTTPS.",
  }),
  token: z.string().trim().min(1),
});

export type RateLimitStorageConfiguration =
  | { type: "upstash"; url: string; token: string }
  | { type: "development-memory" };

export class RateLimitConfigurationError extends Error {
  constructor() {
    super("Rate limiting is not configured correctly.");
    this.name = "RateLimitConfigurationError";
  }
}

export function getRateLimitStorageConfiguration(): RateLimitStorageConfiguration {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url || token) {
    const result = upstashEnvironmentSchema.safeParse({ url, token });

    if (!result.success) {
      throw new RateLimitConfigurationError();
    }

    return { type: "upstash", ...result.data };
  }

  if (process.env.NODE_ENV === "production") {
    throw new RateLimitConfigurationError();
  }

  return { type: "development-memory" };
}
