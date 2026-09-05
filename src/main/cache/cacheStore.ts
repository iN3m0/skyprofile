/**
 * Small generic in-memory TTL cache. Used to avoid redundant Hypixel calls
 * when the renderer hits several tabs (skills, collections, ...) that all
 * need the same underlying profile or resource data in quick succession.
 * Intentionally not persisted to disk — v1 is snapshot-only, and this is
 * purely a request-deduping layer, not a data store.
 */
interface Entry<T> {
  value: T
  expiresAt: number
}

const entries = new Map<string, Entry<unknown>>()
const inflight = new Map<string, Promise<unknown>>()

export async function getOrFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = entries.get(key)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T
  }

  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const promise = fetcher()
    .then((value) => {
      entries.set(key, { value, expiresAt: Date.now() + ttlMs })
      return value
    })
    .finally(() => {
      inflight.delete(key)
    })

  inflight.set(key, promise)
  return promise
}

export function invalidate(key: string): void {
  entries.delete(key)
}
