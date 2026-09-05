/**
 * Tracks the most recently observed Hypixel rate-limit state from response
 * headers (`RateLimit-Limit` / `RateLimit-Remaining` / `RateLimit-Reset`).
 * Hypixel doesn't publish a fixed numeric cap we should hardcode — we just
 * read and surface what the API itself reports.
 */
interface RateLimitState {
  limit: number | null
  remaining: number | null
  reset: number | null
}

let state: RateLimitState = { limit: null, remaining: null, reset: null }

export function updateFromHeaders(headers: Headers): void {
  const limit = headers.get('ratelimit-limit')
  const remaining = headers.get('ratelimit-remaining')
  const reset = headers.get('ratelimit-reset')

  if (limit !== null) state.limit = Number(limit)
  if (remaining !== null) state.remaining = Number(remaining)
  if (reset !== null) state.reset = Number(reset)
}

export function getRateLimitState(): RateLimitState {
  return { ...state }
}

export function resetRateLimitState(): void {
  state = { limit: null, remaining: null, reset: null }
}
