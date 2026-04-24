const rateLimitBuckets = new Map<string, number[]>();

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

export function consumeRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const attempts = (rateLimitBuckets.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (attempts.length >= limit) {
    rateLimitBuckets.set(key, attempts);
    return false;
  }

  attempts.push(now);
  rateLimitBuckets.set(key, attempts);
  return true;
}

export function sanitizePlainText(value: string) {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isValidLength(value: string, min: number, max: number) {
  return value.length >= min && value.length <= max;
}
