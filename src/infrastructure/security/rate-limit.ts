type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitBackend = "redis" | "memory";
type RateLimitError = "RATE_LIMIT_BACKEND_NOT_CONFIGURED" | "RATE_LIMIT_BACKEND_UNAVAILABLE";

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs: number;
  backend: RateLimitBackend;
  error?: RateLimitError;
};

type UpstashResponse = {
  result?: unknown;
  error?: string;
};

const buckets = new Map<string, Bucket>();
const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { current, ttl }
`;

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return {
    url,
    token,
  };
}

function getDeniedResult(error: RateLimitError, windowMs: number): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetAt: Date.now() + windowMs,
    retryAfterMs: windowMs,
    backend: "redis",
    error,
  };
}

function checkMemoryRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt,
      retryAfterMs: 0,
      backend: "memory",
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.resetAt,
      retryAfterMs: Math.max(bucket.resetAt - now, 0),
      backend: "memory",
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetAt: bucket.resetAt,
    retryAfterMs: 0,
    backend: "memory",
  };
}

function parseRedisResult(value: unknown, limit: number, windowMs: number): RateLimitResult {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error("Unexpected Redis rate limit response.");
  }

  const count = Number(value[0]);
  const ttl = Number(value[1]);

  if (!Number.isFinite(count) || !Number.isFinite(ttl)) {
    throw new Error("Invalid Redis rate limit response.");
  }

  const retryAfterMs = ttl > 0 ? ttl : windowMs;

  return {
    allowed: count <= limit,
    remaining: Math.max(limit - count, 0),
    resetAt: Date.now() + retryAfterMs,
    retryAfterMs: count > limit ? retryAfterMs : 0,
    backend: "redis",
  };
}

async function checkRedisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const config = getRedisConfig();

  if (!config) {
    return getDeniedResult("RATE_LIMIT_BACKEND_NOT_CONFIGURED", windowMs);
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["EVAL", RATE_LIMIT_SCRIPT, "1", key, windowMs.toString()]),
    cache: "no-store",
  });
  const data = (await response.json()) as UpstashResponse;

  if (!response.ok || data.error) {
    throw new Error(data.error ?? "Redis rate limit request failed.");
  }

  return parseRedisResult(data.result, limit, windowMs);
}

export async function checkRateLimit(key: string, limit = 8, windowMs = 60_000) {
  const hasRedisConfig = Boolean(getRedisConfig());

  if (!hasRedisConfig && process.env.NODE_ENV !== "production") {
    return checkMemoryRateLimit(key, limit, windowMs);
  }

  try {
    return await checkRedisRateLimit(key, limit, windowMs);
  } catch (error) {
    console.error("Rate limit backend unavailable:", error);

    if (process.env.NODE_ENV !== "production") {
      return checkMemoryRateLimit(key, limit, windowMs);
    }

    return getDeniedResult("RATE_LIMIT_BACKEND_UNAVAILABLE", windowMs);
  }
}
