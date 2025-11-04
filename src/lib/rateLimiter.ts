type BucketEntry = {
  count: number
  windowStart: number
}

type RateLimitResult = {
  limited: boolean
  retryAfterSeconds: number
}

const STORE_SYMBOL = Symbol.for('fullcolor.rateLimiter')

type Store = Map<string, BucketEntry>

const getStore = (): Store => {
  const globalRef = globalThis as typeof globalThis & { [STORE_SYMBOL]?: Store }
  if (!globalRef[STORE_SYMBOL]) {
    globalRef[STORE_SYMBOL] = new Map<string, BucketEntry>()
  }
  return globalRef[STORE_SYMBOL]!
}

/**
 * Simple in-memory fixed window limiter used in middleware.
 * It is resilient to hot reloads thanks to the global store.
 */
export function checkRateLimit(
  key: string,
  { limit = 60, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): RateLimitResult {
  const store = getStore()
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now - existing.windowStart >= windowMs) {
    store.set(key, { count: 1, windowStart: now })
    return { limited: false, retryAfterSeconds: 0 }
  }

  if (existing.count >= limit) {
    const elapsed = now - existing.windowStart
    const retryAfterSeconds = Math.ceil((windowMs - elapsed) / 1000)
    return { limited: true, retryAfterSeconds }
  }

  existing.count += 1
  store.set(key, existing)
  return { limited: false, retryAfterSeconds: 0 }
}
