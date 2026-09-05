# SkyBlock XP Calculator data

`bankUpgrades.json` — the 6 co-op Bank Account upgrade tiers (Gold through
Palatial), each a one-time SkyBlock XP reward for upgrading. Source:
`hypixelskyblock.minecraft.wiki/w/Bank`'s upgrade-requirements table
(cross-checked against the separate "Ways to Gain SkyBlock XP" in-game
menu's own per-tier XP numbers, which matched exactly). Each tier's cost
is a fixed amount of Enchanted Gold Blocks (bazaar-priced live) plus a
flat coin amount — deliberately **not** the Gold Collection milestone or
(for the top few tiers) Museum Milestone also required to unlock the
upgrade screen for that tier at all, since those are collection-grind/
donation gates, not something coins buy directly; the number shown here
is "what the upgrade itself costs once you can see it," matching how the
rest of this app already treats similarly-gated content (e.g. Attribute
Fusion's Hunting-skill-level gates aren't priced either).

Also not modelled here: **Personal Bank Upgrades** (a separate, smaller
XP task — Personal Bank II/III/IV) turned out to be gated by Emerald
Collection milestones only, no coin cost at all, so there's nothing to
rank by cost — excluded rather than shown with a fabricated price.

`minionTierXp.json` — `[1,1,1,1,1,1,2,3,4,6,12,24]`, the "Craft Minions"
task's per-tier SkyBlock XP (tier 1 = index 0), from the same in-game
"Ways to Gain SkyBlock XP" menu. Confirmed this is granted **per minion
type independently** (not once ever): the task's displayed total (2801
XP) is exactly the sum of every owned type's per-tier rewards up to its
own current tier, matching this per-type model rather than a single
global "first Nth tier ever" reward.

### Craft Minions' cost model

Reuses `craftRecipes.json` (see the Museum section above) via a shared
resolver (`src/main/shared/craftCostService.ts`, extracted from what was
originally Museum-only code once Minions needed the exact same recursive
"price it, or price its ingredients" logic). Real minion item ids are
`<TYPE>_GENERATOR_<tier>` (confirmed live against Hypixel's own
`resources/skyblock/items` — _not_ `<TYPE>_MINION_<tier>`, which doesn't
exist), and NEU-REPO's recipe data for them was already present in the
bundled `craftRecipes.json` from the Museum work (681 of them) — this
tool needed no new data fetching, just the per-tier XP table above and a
different consumer of the existing recipe resolver.

One tier's recipe needs the previous tier as an ingredient (crafting
consumes your current minion to produce the next one) — the resolver's
`freeIds` parameter (added for this) treats every tier the player already
owns for that type as free rather than re-pricing a minion they'd
already have to reach the next tier, so "what does my next Wheat tier
cost" reflects only the _new_ materials, not the whole chain from
scratch.

## Pet Score's cost model

"Pet Score" grants +3 SkyBlock XP per point (same wiki source), and Pet
Score itself only counts each pet _type_'s single highest-rarity copy
(ported `getPetScore` logic already lives in `petService.ts`) — so the
only way to gain points for a type you already own is a strictly higher
rarity than your current best, priced via `LVL_1_<RARITY>_<TYPE>`, a real
per-(level, rarity, type) AH price already present in skyhelper-networth's
price list (confirmed live: 398 pet-related price keys, including this
exact pattern for Wolf across all 6 rarities). Level 1 since that's what
you'd actually buy — pets are leveled after purchase via XP, not bought
pre-leveled.

## Essence Shop Upgrades' cost model

The first attempt at this concluded the per-perk-per-level Essence cost
wasn't published anywhere — true for the _wiki_, but checking the
SkyHelper Discord bot as another likely source led to
checking what data _other_ community tools (not just wikis) already have
solved this problem, rather than assuming "not on the wiki" meant
"nowhere." A Fabric mod ([Skyblocker](https://github.com/SkyblockerMod/Skyblocker))
has an in-game Essence-cost tooltip feature, but its `EssenceShopPrice.java`
reads the cost straight off the live inventory lore text the Hypixel
server sends the client — no static table exists there either, since it
doesn't need one. NEU-REPO, though, turned out to have exactly this
(`constants/essenceshops.json`) — hadn't been checked before because its
existence wasn't obvious without knowing the filename; it wasn't
referenced from `museum.json` or anything else already in use here.

`essencePerks.json` is derived from it: 38 perks across the 6 shops the
"Ways to Gain SkyBlock XP" menu tracks (Dragon/Ice/Spider/Undead/Wither/
Crimson), each with `totalEssenceCost` (the sum of every level's Essence
cost from `essenceshops.json`) and `xp` (that perk's _total_ SkyBlock XP
across all its levels — extracted from the same wiki leveling page as
Bank Upgrades/Minions, per-perk this time rather than per-shop).
`essenceshops.json` also had a handful of perks with no wiki-confirmed XP
match (e.g. Wither Shop's "Echos of the Lost", Dragon's "Unbridled Rage")
— newer additions the wiki's XP-task list hasn't caught up to yet, or
perks that don't grant SkyBlock XP at all; excluded rather than guessed
at. Cross-check: summing this file's `xp` per shop reproduces the wiki's
own per-shop totals (166/119/107/128/142/194) exactly, for all 6 shops.

Priced by converting `totalEssenceCost` to coins via the matching
Essence type's real bazaar price (`ESSENCE_DRAGON`, `ESSENCE_WITHER`,
...) — confirmed live-priced, same price list as everything else. One
real limitation, not a research gap: Hypixel's API exposes a player's
_current Essence balance_ but not which perk levels they've already
bought, so every entry here prices "max this perk from zero," which
overstates the true remaining cost for a perk you've partly leveled
already — there's no way to do better with the data the API provides.

## Why this calculator's source list is narrower than "everything that grants SkyBlock XP"

Researched via the wiki's comprehensive `SkyBlock Levels/UI/Leveling` page
(the exact data behind the in-game "Ways to Gain SkyBlock XP" menu) before
building anything, the same way Attribute Fusion was researched earlier in
this app's history — several requested categories turned out not to fit
"cheapest cost to buy" at all:

- **Abiphone Contacts** — confirmed each of the 41 contacts is unlocked by
  an NPC-specific quest/exploration task (the wiki's own Contact Directory
  categorizes each by Easy/Medium/Hard _difficulty_, not a coin price) —
  there's no cost to rank by.
- **Attributes** — confirmed Attribute Fusion grants **Hunting skill XP**
  (see `src/main/attributes/data/README.md`'s Fusion section), not
  SkyBlock XP. It's a real, valuable thing to optimize (see the Attribute
  Calculator tool) but doesn't actually belong in _this_ calculator.
- **Fast Travel** — checked Hypixel's own exhaustive XP-task list;
  unlocking fast travel isn't a SkyBlock XP source at all.
- **Personal Bank Upgrades** — collection-gated only, no coin cost (see
  above).

And one is a real, buyable source this app still doesn't have the
supporting cost data for (surfaced honestly in the tool's own UI as "not
included yet," not silently dropped):

- **Community Shop Upgrades** — priced in Bits, a different currency
  than coins (earned weekly, not simply bought), so "coins per XP" isn't
  a like-for-like comparison the way it is for everything else here.

**Craft Minions**, **Pet Score**, and **Essence Shop Upgrades** were in
this "not yet" list too, until follow-up requests specifically asked for
them — see the sections above for how each was actually built once
looked into properly.
