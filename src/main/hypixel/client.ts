import { getApiKey } from '../settings/store'
import { updateFromHeaders } from './rateLimiter'

const HYPIXEL_BASE_URL = 'https://api.hypixel.net'

export class HypixelApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'HypixelApiError'
    this.status = status
  }
}

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Hypixel API key configured')
    this.name = 'MissingApiKeyError'
  }
}

// A handful of endpoints (confirmed live in `/v2/resources/skyblock/election`)
// exist but occasionally never respond at all rather than erroring — a
// hung connection, not a fast failure. Without a cap here, one bad
// endpoint could stall a caller indefinitely.
const REQUEST_TIMEOUT_MS = 10_000

async function request<T>(path: string, params: Record<string, string> | undefined, apiKey: string | null): Promise<T> {
  const url = new URL(path, HYPIXEL_BASE_URL)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value)
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      headers: apiKey ? { 'API-Key': apiKey } : {},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new HypixelApiError('Hypixel API request timed out', 504)
    }
    throw error
  }

  updateFromHeaders(response.headers)

  if (!response.ok) {
    let message = `Hypixel API request failed (${response.status})`
    try {
      const body = (await response.json()) as { cause?: string }
      if (body?.cause) message = body.cause
    } catch {
      // response body wasn't JSON (or was empty) — fall back to the generic message
    }
    throw new HypixelApiError(message, response.status)
  }

  return (await response.json()) as T
}

/**
 * Authenticated GET against the Hypixel API. Reads the API key from the
 * local settings store (never the renderer) and attaches it via the
 * `API-Key` header, per Hypixel's current auth scheme (key-in-URL was
 * deprecated). Updates the shared rate-limit tracker from response headers
 * on every call, success or failure.
 */
export async function hypixelGet<T = unknown>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new MissingApiKeyError()
  }
  return request<T>(path, params, apiKey)
}

/**
 * GET against a Hypixel endpoint that doesn't require an API key (the
 * `resources/skyblock/*` endpoints). Still attaches a key if one is
 * configured — harmless, and keeps rate-limit tracking consistent — but
 * never requires one.
 */
export async function hypixelGetPublic<T = unknown>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  return request<T>(path, params, getApiKey())
}
