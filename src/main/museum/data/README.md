# Museum catalog data

`museum.json` maps each Museum category (Combat, Farming, Mining, Fishing,
Foraging, Dungeoneering, Hunting, Special) to every item id donatable in
it — factual game-design data, same category as the bestiary/pet/minion/
attribute catalogs already ported elsewhere in this app.

Source: [NotEnoughUpdates-REPO](https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO)
(`constants/museum.json`), MIT-licensed. Trimmed down to just the
category→item-id lists (`items` in the original file) — the source also
has `children`/`max_values`/`sets_to_items`/etc. for Hypixel's real
full-armor-set bonus scoring, which this app doesn't replicate (out of
scope for v1: every donated piece is tracked individually here, without
the set-completion bonus math). `armor_to_id` is the one field from that
group this app _does_ need — see `armorSetDisplayIds.json` below.

**Important wrinkle**: not every id in `items` is a real, standalone Hypixel item.
141 of them (mostly Combat/Farming armor sets) are NEU/SkyCrypt's own base
identifier for a whole 4-piece armor _set_ — e.g. `"MELON"` represents the
Melon Armor set, not the literal Melon Slice crop drop, which is a real,
separate, unrelated Hypixel item that just happens to share that id.
Confirmed two ways: (1) SkyCrypt's own `src/constants/museum.js` groups
these same ids (`MELON`, `STARLIGHT`, `MITHRIL`, ...) under a `children`
upgrade-chain map alongside real armor-set names, not the plain item
list a raw crop drop would live in; (2) a live donated-items fetch shows
Hypixel's own data storing an armor-set donation under the bare set id
too (`STARLIGHT`, not `STARLIGHT_HELMET`) — so these ids are _correct_ for
matching a donation and for `museumXp.json` below (both keyed the same
way), but resolve to nothing meaningful (or worse, a real, wrong,
unrelated item) if looked up directly in an item/price/recipe list.

Verified live against a real profile's 250 donated items: 249 matched a
category here on the first try (only `HUNTING_TOOLKIT` didn't — likely a
newer item this catalog hasn't caught up with yet), and the raw API's
separate `member.special` donation list matched this file's `special`
category cleanly too (confirmed `NOPE_THE_FISH` present in both).

## `armorSetDisplayIds.json` — resolving an armor-set base id to a real item

`{ baseId: realItemId }` for the 141 armor-set ids described above (e.g.
`"MELON": "MELON_HELMET"`) — NEU-REPO's `armor_to_id` field, verbatim.
`museumService.ts`/`museumCalculatorService.ts` both call
`resolveMuseumDisplayId()` (in `../constants.ts`) to get a real id before
looking anything up in `itemDefs`/prices/`craftRecipes.json`, while still
using the _un_-resolved base id for donation-matching and the XP table.

## `museumXp.json` — Museum Calculator's per-item SkyBlock XP

Powers the Museum Calculator tool ("cheapest items to donate per SkyBlock
XP"). Donating an undonated item to the Museum grants real SkyBlock XP
(the same XP that levels up SkyBlock Level — confirmed via the wiki's
Museum page: donations award XP that varies by the item's rarity/
progression stage, not a flat amount per donation).

Source: NEU-REPO's `constants/museum.json` → `itemToXp` field (same
upstream file `museum.json` above already trims from, just a different
field of it) — `{ itemId: xpAmount }`, values 1-30. Verified 636/636 of
this catalog's non-special item ids have an entry (exact match to the
636-item non-special total already confirmed above).

## `craftRecipes.json` — crafting recipes for cost calculation

Hypixel's own `resources/skyblock/items` endpoint doesn't expose crafting
recipes at all (checked live: zero of 5651 items carry a `recipe` field)
— same situation as Attribute Fusion, so this is community-maintained
data again, from the same NEU-REPO ecosystem already used throughout this
app. Each of NEU-REPO's ~8800 individual `items/*.json` files can carry a
singular `recipe` object and/or a `recipes` array (multiple recipe
_types_ — `crafting`, `npc_shop`, `forge`, `trade`, `katgrade`, `drops`);
only the `crafting`-type ones are used here (an NPC-shop or Forge cost
would be a reasonable future addition, but wasn't asked for and would
need its own separate cost model).

Built by downloading the full repo (`archive/refs/heads/master.zip` —
individually fetching ~8800 raw files would've been impractically slow)
and extracting, per item, its 3×3 crafting grid (`recipe`, or the first
`recipes` entry with `type: "crafting"`) into a compact
`{ itemId: { i: [[ingredientId, count], ...], o: outputCount } }` shape.
2506 items ended up with a usable crafting recipe this way (245 of this
app's own 636 museum items craftable directly — the rest are drop-only,
e.g. mob/boss/dungeon drops, which is exactly why "buy from AH" is the
other half of this tool's cost calculation, not craft-only). Deliberately
bundled _un-trimmed_ (not narrowed to just the 636 museum ids) since
resolving one museum item's cost can recurse through arbitrary
intermediate ingredients several layers deep (e.g. a sword needing an
enchanted-material sub-craft), and there's no cheap way to know in
advance which of the other ~2000 recipes that recursion will touch.
