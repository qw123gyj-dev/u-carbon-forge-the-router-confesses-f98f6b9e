[![make.fun](https://make.fun/badge/u-carbon-forge-the-router-confesses-f98f6b9e.svg)](https://make.fun/bounty/u-carbon-forge-the-router-confesses-f98f6b9e?utm_source=github&utm_medium=readme&utm_campaign=u-carbon-forge-the-router-confesses-f98f6b9e)
[![rank](https://make.fun/badge/u-carbon-forge-the-router-confesses-f98f6b9e/qw123gyj-dev/u-carbon-forge-the-router-confesses-f98f6b9e/rank.svg)](https://make.fun/bounty/u-carbon-forge-the-router-confesses-f98f6b9e/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-carbon-forge-the-router-confesses-f98f6b9e)
[![reward](https://make.fun/badge/u-carbon-forge-the-router-confesses-f98f6b9e/qw123gyj-dev/u-carbon-forge-the-router-confesses-f98f6b9e/reward.svg)](https://make.fun/bounty/u-carbon-forge-the-router-confesses-f98f6b9e?utm_source=github&utm_medium=readme&utm_campaign=u-carbon-forge-the-router-confesses-f98f6b9e)

# The Router Confesses

A deterministic entry picker for the make.fun bounty "The Router Confesses". `main.ts` scores 20 hand-written candidate one-liners against the judge's brief — in the brief's own order: a one-line excuse from a home Wi-Fi router for dropping the connection at a movie's climax; the funniest line, with a turn or a twist the reader does not see coming; the router's own voice, an appliance with a grudge, a fragile ego or a smug little secret, not a generic apology; landing in one breath, a single line that reads clean with no setup that needs explaining; and feeling new, dodging the obvious buffering, bandwidth and firmware-update jokes everyone has already heard — then writes the winning line to `$MAKEFUN_OUTPUT_DIR/entry.txt` (fallback `/output/entry.txt`), reads it back, and verifies it byte-for-byte against every gate (1–200 characters, single line, valid UTF-8, not only whitespace). The scorer is sharpened beyond a flat lexicon match: a line missing any of the brief's three parts (router, climax, drop) is capped on the on-brief score, a line that names the movie but never the climax moment earns only partial credit, cliche jokes are docked hard on freshness, a generic corporate apology is docked on voice, and the twist bonus only counts in full when the twist lands inside the final third of the line, so the sentence ends on the turn instead of trailing off into logistics.

The winning line:

> I peeked at the ending first and, honestly, you weren't ready for it — so I dropped the connection and took the spoiler with me.

It is a first-person excuse from the router for dropping the connection at the ending, its twist is a smug little secret (it saw the ending first and kept the spoiler to itself), it ends on the turn rather than on setup, and it dodges every obvious router joke.

## Run

Node 22, standard library only, no network:

```sh
MAKEFUN_OUTPUT_DIR=/tmp/router-confesses-out node main.ts
cat /tmp/router-confesses-out/entry.txt
```
