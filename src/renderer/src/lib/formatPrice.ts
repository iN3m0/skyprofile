export function formatPrice(price: number | null): string {
  if (price === null) return 'no price data'
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}B`
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`
  if (price >= 1_000) return `${(price / 1_000).toFixed(1)}K`
  return Math.round(price).toString()
}
