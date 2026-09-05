import type { InventoryContainer, InventoryItem, MemberInventory } from '@shared/types/item'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { decodeInventoryData } from '../nbt/decodeItems'
import { getItemSkinUrls } from '../hypixel/resources'

interface ContainerSource {
  key: string
  name: string
  data: string | undefined
}

export async function computeInventory(
  profile: RawHypixelProfile,
  member: RawHypixelMember
): Promise<MemberInventory> {
  const inv = member.inventory
  if (!inv?.inv_contents) {
    return { apiEnabled: false, containers: [] }
  }

  const sources: ContainerSource[] = [
    { key: 'armor', name: 'Armor', data: inv.inv_armor?.data },
    { key: 'equipment', name: 'Equipment', data: inv.equipment_contents?.data },
    { key: 'inventory', name: 'Inventory', data: inv.inv_contents?.data },
    { key: 'wardrobe', name: 'Wardrobe', data: inv.wardrobe_contents?.data },
    { key: 'enderChest', name: 'Ender Chest', data: inv.ender_chest_contents?.data },
    { key: 'accessoryBag', name: 'Accessory Bag', data: inv.bag_contents?.talisman_bag?.data },
    { key: 'fishingBag', name: 'Fishing Bag', data: inv.bag_contents?.fishing_bag?.data },
    { key: 'quiver', name: 'Quiver', data: inv.bag_contents?.quiver?.data },
    { key: 'potionBag', name: 'Potion Bag', data: inv.bag_contents?.potion_bag?.data },
    { key: 'personalVault', name: 'Personal Vault', data: inv.personal_vault_contents?.data },
    { key: 'candyBag', name: 'Candy Bag', data: profile.shared_inventory?.candy_inventory_contents?.data }
  ]

  const skinUrls = await getItemSkinUrls()
  const withIcons = (items: InventoryItem[]): InventoryItem[] =>
    items.map((item) => ({ ...item, skinUrl: (item.itemId && skinUrls[item.itemId]) || null }))

  const containers: InventoryContainer[] = await Promise.all(
    sources.map(async (source) => ({
      key: source.key,
      name: source.name,
      items: source.data ? withIcons(await decodeInventoryData(source.data)) : []
    }))
  )

  return { apiEnabled: true, containers: containers.filter((c) => c.items.length > 0) }
}
