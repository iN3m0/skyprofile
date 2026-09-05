# Hypixel+ item icons — provenance

These PNGs are extracted from the **Hypixel+** Minecraft resource pack, version
0.23.3 (for Minecraft 1.21.8), sourced from a copy the app's developer
personally downloaded and uses in their own Minecraft client (via ATLauncher).
They are **not** redistributed here as a standalone asset pack — this project
uses them only as icons within this one developer's own local desktop app.

Hypixel+ is a third-party community resource pack, not affiliated with
Hypixel Inc., Mojang Studios, or Microsoft. Its author(s) have not published
an explicit license for its art. If this repository is ever made public or
shared beyond personal use, **this folder should be reconsidered** — either
removed, replaced with a properly licensed alternative, or kept only after
getting explicit permission from the pack's creators.

`manifest.json` maps a guessed Hypixel `ExtraAttributes.id` (uppercased) to
a filename in this folder — filenames come directly from the pack's own
`textures/skyblock/**` folder structure, uppercased. This is a naming-
convention guess (verified against a handful of well-known real item ids
like `HYPERION`, `ASPECT_OF_THE_END`, `MIDAS_STAFF` — all matched directly),
not an official mapping, since Hypixel+'s actual id-to-texture routing lives
in the closed-source Catharsis mod's code, not in the pack files themselves.
Expect some items to mismatch or not resolve at all; the app falls back to
its vanilla-icon system when a lookup misses.
