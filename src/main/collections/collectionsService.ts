import type { CollectionCategory, CollectionsSummary } from '@shared/types/collections'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { getCollectionsResource } from '../hypixel/resources'

/**
 * Computes per-category collection tiers for one member, summing amounts
 * across all co-op members on the profile (a collection tier is shared
 * profile-wide, not per-player) — matching SkyCrypt's approach
 * (src/stats/collections.js).
 */
export async function computeCollections(
  profile: RawHypixelProfile,
  member: RawHypixelMember
): Promise<CollectionsSummary> {
  if (!member.collection) {
    return { apiEnabled: false, categories: [] }
  }

  const resource = await getCollectionsResource()

  const categories: CollectionCategory[] = Object.entries(resource.collections).map(
    ([categoryKey, category]) => ({
      key: categoryKey,
      name: category.name,
      entries: Object.entries(category.items).map(([itemId, item]) => {
        const totalAmount = Object.values(profile.members).reduce(
          (sum, m) => sum + (m.collection?.[itemId] ?? 0),
          0
        )
        const tier = [...item.tiers].reverse().find((t) => t.amountRequired <= totalAmount)?.tier ?? 0
        return {
          id: itemId,
          name: item.name,
          amount: totalAmount,
          tier,
          maxTier: item.maxTiers
        }
      })
    })
  )

  return { apiEnabled: true, categories }
}
