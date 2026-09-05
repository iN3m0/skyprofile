# Bestiary catalog data

`bestiary.json` is the Hypixel Skyblock Bestiary catalog (mob families, tier
kill thresholds, category groupings, per-mob head-skin textures) — factual
game-design data, not creative content, in the same category as the
skill-leveling/pet/accessory data already ported elsewhere in this app.

Source: [NotEnoughUpdates-REPO](https://github.com/NotEnoughUpdates/NotEnoughUpdates-REPO)
(`constants/bestiary.json`), MIT-licensed, community-maintained and shared
freely across the Skyblock tool ecosystem. Chosen over the equivalent table
in the archived SkyCrypt v1 source (already used elsewhere in this app for
pets/accessories) because a live coverage check found NEU's version missing
only 5 of a real profile's 505 distinct kill-tracking keys, versus 140
missing from the SkyCrypt table — NEU's is simply far more current here.

Not modified from upstream — fetched as-is and bundled directly rather than
transcribed, since it's large (~250KB) and purely tabular.
