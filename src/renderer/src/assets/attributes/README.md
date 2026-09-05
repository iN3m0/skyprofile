# Attribute shard head icons

324 head-render PNGs, one per attribute (filename = that attribute's
stable internal key, e.g. `nature_elemental.png`), downloaded from the
current wiki:

```
https://hypixelskyblock.minecraft.wiki/Special:FilePath/<Shard Name>_Shard.png
```

These are real screenshots of the actual in-game item (every attribute
shard is implemented as a custom-skinned player head, same as pets/mobs
elsewhere in this app) — not derivable from a live Mojang skin hash the
way other custom-item icons in this app are, because Hypixel doesn't
itemize attribute shards individually anywhere in its own API or in
NEU-REPO's item catalog (confirmed while building the Attributes tab).
The wiki's own uploaded renders were the only available source.

`manifest.json` maps each attribute's internal key to its filename —
built alongside the download, not guessed.
