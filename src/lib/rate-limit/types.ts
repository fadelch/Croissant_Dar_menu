import "server-only";

export type RateLimitWindow = `${number} s` | `${number} m` | `${number} h` | `${number} d`;

export type RateLimitPolicy = {
  limit: number;
  window: RateLimitWindow;
  windowMs: number;
  prefix: string;
};

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  reason?: string;
};

export interface RateLimiter {
  limit(identifier: string): Promise<RateLimitResult>;
}
