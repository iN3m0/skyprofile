# Calendar event data

`events.json` — 10 recurring SkyBlock events, each as `{ key, name, category,
anchorMs, intervalMs, durationMs }`, all real epoch-millisecond values (UTC).
Every event's current/next occurrence is just `(now - anchorMs) % intervalMs`
against `durationMs` — no SkyBlock day/season calendar math needed at all.

Source: [KidProf/HyMinions](https://github.com/KidProf/HyMinions)
(`js/eventsData.js`), a community events timer that's been live and
actively referenced since 2020 (its earliest anchor dates), MIT-licensed.

**The anchor timestamps needed re-deriving, not copying directly.** The
source defines each anchor as a `new Date(year, month-1, day, hour-8,
minute, 0)` with a code comment: "hours need to -8 for timezone offset (UTC
time is needed)". Read literally that looks like a server-timezone hack, but
the actual computation (`js/events.js`) runs client-side in the browser and
cancels out the visitor's local timezone offset algebraically — `new
Date(...)` is constructed in the browser's local time, then
`currentTime.getTimezoneOffset()` (the same local offset) is added back
before diffing against `Date.now()`, so the local-offset terms cancel
exactly regardless of what timezone the browser is in. What's left is
equivalent to treating the literal numbers written in the source — hour
already including the "-8" — as direct UTC components via `Date.UTC(...)`.
`events.json`'s `anchorMs` values are exactly that: `Date.UTC(year,
month-1, day, hour-8, minute, 0)` for each source entry.

Cross-checked two of these independently against
[hypixelskyblock.minecraft.wiki/w/Events](https://hypixelskyblock.minecraft.wiki/w/Events):
Dark Auction's derived anchor lands on minute 55 of the hour, and Jacob's
Farming Contest's on minute 15 with a 20-minute window (15 to 35) — both
match the wiki's independently-stated real-life timing exactly, which is
what gave confidence in the anchor-recovery method above rather than
guessing at the "-8" comment's intent.

**Not covered here — confirmed missing, not omitted by mistake:**
- **Mayor identity/active perks.** The public Hypixel API doesn't expose
  this (every plausible endpoint — `/v2/resources/skyblock/election`,
  `/v2/skyblock/election`, and other guesses — times out server-side, a
  real "doesn't exist" signal, not a rate limit). The Mayor Election event
  above is the *voting window's* schedule only, not who's running or who
  wins.
- **"Year of the ___"** — a real, separate 12-SkyBlock-year zodiac-style
  rotation tied to the New Year Celebration (Year of the Pig, Year of the
  Seal, Year of the Witch confirmed so far). No source publishes a full
  12-theme rotation table or a year-number-to-theme mapping — the mechanic
  is new enough (first entries added within roughly the last year and a
  half) that most of the cycle hasn't been revealed by Hypixel yet. Left
  out rather than guessed.

Bingo is not in this file — it's fetched live from Hypixel's own
`/v2/resources/skyblock/bingo` (a real, working endpoint, unlike the
election/calendar guesses above), which returns the current period's id,
name, dates, and every community goal's live progress. See
`calendarService.ts`.
