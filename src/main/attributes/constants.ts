import attributesData from './data/attributes.json'

export type AttributeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface AttributeDefinition {
  /** The stable raw key `member.attributes.stacks` actually uses — sourced from NEU's `internalName`, NOT derived from the (renameable) display name. See data/README.md. */
  internalKey: string
  abilityName: string
  rarity: AttributeRarity
  family: string | null
  skill: string | null
  /** Plain-text description of what the attribute does, e.g. "Grants +2–20 Health" — cleaned up from the wiki's markup. */
  effect: string | null
  shardName: string | null
}

export const ATTRIBUTE_DEFINITIONS = attributesData as AttributeDefinition[]

/**
 * Shards syphoned into an attribute give it 1 of 10 levels — higher
 * rarity needs far fewer shards per level. These are the *cumulative*
 * shard counts to reach each level, transcribed directly from the current
 * wiki's own table (fetched live while implementing this):
 * https://hypixelskyblock.minecraft.wiki/w/Attributes#Leveling
 */
export const ATTRIBUTE_LEVEL_THRESHOLDS: Record<AttributeRarity, number[]> = {
  COMMON: [1, 4, 9, 15, 22, 30, 40, 54, 72, 96],
  UNCOMMON: [1, 3, 6, 10, 15, 21, 28, 36, 48, 64],
  RARE: [1, 3, 6, 9, 13, 17, 22, 28, 36, 48],
  EPIC: [1, 2, 4, 6, 9, 12, 16, 20, 25, 32],
  LEGENDARY: [1, 2, 3, 5, 7, 9, 12, 15, 19, 24]
}

export const MAX_ATTRIBUTE_LEVEL = 10
