const RARITY_COLOR_VARS: Record<string, string> = {
  common: 'var(--color-rarity-common)',
  uncommon: 'var(--color-rarity-uncommon)',
  rare: 'var(--color-rarity-rare)',
  epic: 'var(--color-rarity-epic)',
  legendary: 'var(--color-rarity-legendary)',
  mythic: 'var(--color-rarity-mythic)',
  divine: 'var(--color-rarity-divine)',
  special: 'var(--color-rarity-special)',
  very_special: 'var(--color-rarity-special)',
  supreme: 'var(--color-rarity-special)',
  admin: 'var(--color-rarity-special)'
}

export function getRarityColor(rarity: string | null): string {
  return (rarity && RARITY_COLOR_VARS[rarity]) || 'var(--color-text-faint)'
}
