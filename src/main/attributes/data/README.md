# Attribute catalog data

`attributes.json` is the Hypixel Skyblock Attribute Shard catalog — factual
game-design data, same category as the bestiary/pet/minion data already
ported elsewhere in this app.

**Source, revised**: originally parsed from the live wiki's per-rarity list
pages alone (`Attributes/List/{Common,Uncommon,Rare,Epic,Legendary}`, via
`?action=raw` + a regex parser for each `{{Attribute Table Entry}}` block),
which got rarity/family/skill/effect right but keyed each entry by a
snake-cased _current display name_ — wrong, because Hypixel's actual
`member.attributes.stacks` keys are stable internal ids that don't change
when an attribute is renamed (confirmed: a 2026/July patch note reads
"Changed many Attribute ID's", and several attributes were renamed before
that too, e.g. "Mending" → "Vitality"). That version only classified
238/263 of a live profile's real keys.

Fixed by cross-referencing NotEnoughUpdates-REPO's `constants/attribute_shards.json`,
whose `internalName` field (e.g. `ATTRIBUTE_SHARD_NATURE_ELEMENTAL;1`)
preserves the _stable_ raw id even after a display-name rename — using
`internalName` instead of the display name as the lookup key resolved
100% of a live profile's 263 attribute keys (up from 238). The final
catalog merges both sources: NEU's `internalName` supplies the key,
enriched with the wiki's `family`/`skill`/`effect` text where an exact
current-name match exists, plus two wiki-only entries NEU doesn't have
yet (very recently added attributes). See `merge-attributes.mjs` from that
session's scratchpad (not kept in this repo) for the merge logic.

Total: 324 entries, not exactly matching a user-reported reference figure
of 321 — investigated (checked for duplicate keys, malformed parses, a
stray non-attribute entry) and found no discrepancy in this catalog
itself, so the gap is disclosed rather than forced to match. 100% live
coverage is the stronger signal that this catalog is _complete_, even if
its exact total doesn't match that one reference number.

## `fusion-data.json` — Attribute Fusion recipes

Powers the Attribute Calculator tool (shard fusion browsing + "cheapest to
max next"). Attribute Fusion (combine two Attribute Shards at the Fusion
Machine in Tangleburg to obtain a third) is a real game mechanic added
well after this project's initial Attributes-tab work, documented at
`hypixelskyblock.minecraft.wiki/w/Attribute_Fusion`, which itself credits
its recipe data to the wiki's own admin-published
`User:Wiki_Editor_33/AttributeFusion` page.

Reimplementing the fusion algorithm from that page's prose (three fusion
types — ID Fusion, Special Fusion, Chameleon Fusion — each with its own
rarity/category/family matching rules) risked getting a subtly-wrong
result with no easy way to verify it. Instead, this file is the
**already-computed, already-verified** output of
[Campionnn/SkyShards-Parser](https://github.com/Campionnn/SkyShards-Parser)
— the open tool that scrapes that same wiki page, derives every shard's
fusion rule, and (per its own README) _asserts_ its recomputed results
match the wiki's published ones on every build. It's the data source
behind [skyshards.com](https://skyshards.com), a purpose-built fusion
calculator — using its output here is using the same verified recipes
that site does, not a second independent (and unverified) implementation.
Copied verbatim from that repo's `dist/fusion-data.json` (no published
license on the repo itself; treated the same as this project's other
ported factual game-design data — e.g. `accessories/constants.ts`'s
upgrade chains — since it's a derived table of item-id relationships, not
creative content, credited here by name).

**Shape**: `{ shards: { <id>: {...} }, recipes: { <id>: { "<outputCount>": [[inputIdA, inputIdB], ...] } } }`.
Ids (`C1`, `U5`, `R30`, ...) are SkyShards' own — a rarity letter
(C/U/R/E/L) plus an index, _not_ this app's `attributes.json` keys. Cross-
referenced by exact `shards[id].name` ↔ `attributes.json[i].shardName`
match (e.g. both call it `"Grove"`) in `fusionService.ts`, which is also
where each shard's real price is looked up
(`ATTRIBUTE_SHARD_<internalKey>` in `skyhelper-networth`'s price list —
confirmed live: 322/324 catalog entries have a price).
`recipes[id][count]` lists every valid input pair producing `id`, credited
with `count` copies of it per fusion — many entries for a common target
are redundant (any same-rarity-or-higher shard satisfies a generic
criterion), which is fine: the service picks the cheapest by current
price at request time rather than trusting a baked-in "best" pick that
would go stale as prices move. `shards[id].fuse_amount` is how many
copies of _that one input_ a fusion needs (2 for Elemental/Reptile/
Amphibian family shards, 5 otherwise, 1 for Chameleon) — the real cost of
one fusion attempt is `fuse_amount(a)×price(a) + fuse_amount(b)×price(b)`,
not just `price(a)+price(b)`.
