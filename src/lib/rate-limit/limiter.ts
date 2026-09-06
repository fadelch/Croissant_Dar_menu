import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import {
  getRateLimitStorageConfiguration,
  RATE_LIMIT_BACKEND_TIMEOUT_MS,
} from "@/lib/rate-limit/config";
import type {
  RateLimiter,
  RateLimitPolicy,
  RateLimitResult,
} from "@/lib/rate-limit/types";

const MEMORY_CLEANUP_INTERVAL = 100;

export class RateLimitUnavailableError extends Error {
  constructor() {
    super("Rate limiting is temporarily unavailable.");
    this.name = "RateLimitUnavailableError";
  }
}

/** DEVELOPMENT ONLY: process-local memory is neither shared nor durable. */
class DevelopmentMemoryRateLimiter implements RateLimiter {
  private readonly requests = new Map<string, number[]>();
  private checksSinceCleanup = 0;

  constructor(
    private readonly policy: RateLimitPolicy,
    private readonly now: () => number = Date.now,
  ) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const currentTime = this.now();
    const windowStart = currentTime - this.policy.windowMs;
    const activeRequests = (this.requests.get(identifier) ?? []).filter(
      (timestamp) => timestamp > windowStart,
    );

    this.checksSinceCleanup += 1;

    if (this.checksSinceCleanup >= MEMORY_CLEANUP_INTERVAL) {
      this.removeExpiredEntries(windowStart);
      this.checksSinceCleanup = 0;
    }

    if (activeRequests.length >= this.policy.limit) {
      this.requests.set(identifier, activeRequests);

      return {
        success: false,
        limit: this.policy.limit,
        remaining: 0,
        reset: activeRequests[0] + this.policy.windowMs,
      };
    }

    activeRequests.push(currentTime);
    this.requests.set(identifier, activeRequests);

    return {
      success: true,
      limit: this.policy.limit,
      remaining: this.policy.limit - activeRequests.length,
      reset: activeRequests[0] + this.policy.windowMs,
    };
  }

  private removeExpiredEntries(windowStart: number): void {
    for (const [identifier, timestamps] of this.requests) {
      if (timestamps.every((timestamp) => timestamp <= windowStart)) {
        this.requests.delete(identifier);
      }
    }
  }
}

function createRateLimiter(policy: RateLimitPolicy): RateLimiter {
  const storage = getRateLimitStorageConfiguration();

  if (storage.type === "development-memory") {
    return new DevelopmentMemoryRateLimiter(policy);
  }

  const redis = new Redis({ url: storage.url, token: storage.token });

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: policy.prefix,
    analytics: false,
    timeout: RATE_LIMIT_BACKEND_TIMEOUT_MS,
  });
}

class LazyRateLimiter implements RateLimiter {
  private limiter: RateLimiter | null = null;

  constructor(private readonly policy: RateLimitPolicy) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    try {
      this.limiter ??= createRateLimiter(this.policy);
      const result = await this.limiter.limit(identifier);

      // Upstash normally marks timeouts as allowed. A sensitive authentication
      // endpoint must fail closed instead of treating that result as success.
      if (result.reason === "timeout") {
        throw new RateLimitUnavailableError();
      }

      return result;
    } catch {
      console.error("Rate limit check failed.");
      throw new RateLimitUnavailableError();
    }
  }
}

export function configuredRateLimiter(policy: RateLimitPolicy): RateLimiter {
  return new LazyRateLimiter(policy);
}

export function createRateLimitHeaders(
  result: RateLimitResult,
  includeRetryAfter = false,
): Headers {
  const headers = new Headers({
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1_000)),
  });

  if (includeRetryAfter) {
    const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000));
    headers.set("Retry-After", String(retryAfterSeconds));
  }

  return headers;
}
