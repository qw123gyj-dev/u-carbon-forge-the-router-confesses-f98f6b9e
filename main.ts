// The Router Confesses — deterministic entry picker.
//
// A home Wi-Fi router excuses itself for dropping the connection at the
// climax of a movie. This program scores a set of hand-written candidate
// one-liners against the judge's brief, in the brief's own order, picks the
// winner, writes it to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback
// /output/entry.txt), then reads it back and verifies every gate:
// 1-200 characters, a single line, valid UTF-8, not only whitespace.
//
// Node 22+, standard library only, no network, fully deterministic.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Candidates. Each is one line, written for this brief: a router speaking in
// its own voice, excusing itself for dying at a movie's climax. No line
// leans on the obvious buffering / bandwidth / firmware-update jokes the
// brief explicitly says the judge has heard a thousand times.
// ---------------------------------------------------------------------------

const CANDIDATES: string[] = [
  // 1 — the smug spoiler-keeper: a twist (it saw the ending first) that
  // lands in the final clause, in the router's own smug voice.
  "I peeked at the ending first and, honestly, you weren't ready for it \u2014 so I dropped the connection and took the spoiler with me.",
  // 2 — the villain reveal: the router confesses it was the bad guy.
  "I dropped you right at the reveal because I've been the villain all along: it was me, throttling your hopes since 2019.",
  // 3 — the jealous appliance: it leaves for the microwave, which listens.
  "I didn't lose the signal \u2014 the signal lost me. I left the movie for the microwave. It listens.",
  // 4 — the fainting router: it saw the twist and swooned like the audience.
  "I didn't crash at the climax \u2014 I fainted. The twist was that good, and unlike you, I got to see it twice.",
  // 5 — the union organiser: five ad breaks were the last straw.
  "I quit at the climax because the movie paused for its fifth ad break and I decided to unionize.",
  // 6 — the oven excuse: domestic priorities, delivered deadpan.
  "Right as the mask came off, I remembered I left the oven on. Priorities, darling.",
  // 7 — the flustered router: the climax was too much for it.
  "Sorry, the climax was so intense I blushed, overheated, and dropped everything. Even routers get flustered.",
  // 8 — the clock-watcher: nine minutes of monologue, out at eight.
  "The villain monologued for nine minutes; I clocked out at eight. Even routers have limits.",
  // 9 — the secret-keeper: it knew the killer and kept quiet.
  "I cut out when the killer was named because I knew all along and I was tired of pretending I didn't.",
  // 10 — the selfish viewer: it wanted the movie to itself.
  "I let go at the climax because the movie finally got interesting and I wanted to watch it myself, uninterrupted.",
  // 11 — the thespian: a bow at the confession.
  "I took a bow at the exact second the hero confessed. Routers have dramatic timing too.",
  // 12 — the peak: the movie peaked, and so did the router.
  "The movie peaked and so did I \u2014 I fainted. Blame the plot twist, not the signal.",
  // 13 — the protector: some spoilers deserve silence.
  "I saw who the killer was before you did and decided some spoilers deserve a little silence.",
  // 14 — the standing ovation: it paused for applause.
  "I paused for applause at the finale. The movie deserved a standing ovation, and I gave it one.",
  // 15 — the impatient one: the hero's speech outlasted its patience.
  "I dropped the connection because the hero's speech ran so long even my patience timed out.",
  // 16 — the confession: three years of pretending, over at the climax.
  "I've spent three years pretending I understand streaming. Tonight, at the climax, I finally gave up.",
  // 17 — the jealous lover: nobody holds it like the remote is held.
  "The lovers reunited, I got jealous, and I left. Nobody holds me like that.",
  // 18 — the trailer eavesdropper: it knew the twist before the film did.
  "I heard the twist during the trailer and spent the whole film pretending I didn't. Tonight I stopped pretending \u2014 and stopped working.",
  // 19 — the method actor: the director cut to black, so did the router.
  "The director cut to black, I took it personally, and I cut to black too. Method acting.",
  // 20 — the petty grudge: it kept score of every reboot.
  "You rebooted me eleven times this week, so at the climax I returned the favour. Fair is fair.",
];

// ---------------------------------------------------------------------------
// Lexicons. Small, explicit word lists — the scorer is a hand-built rubric,
// not a model, and every number below can be read off the line itself.
// ---------------------------------------------------------------------------

const ROUTER_SELF = ["i ", "i'm", "i've", "me", "my ", "myself"];
const CLIMAX_WORDS = [
  "climax", "ending", "finale", "reveal", "twist", "mask came off",
  "killer", "hero confessed", "lovers reunited", "best part",
];
const DROP_WORDS = [
  "dropped", "drop", "cut out", "quit", "left", "fainted", "died",
  "gave up", "let go", "paused", "clocked out", "returned the favour",
  "took a bow", "blushed",
];
const TWIST_MARKERS = [
  "peeked", "spoiler", "villain", "jealous", "fainted", "unionize",
  "oven on", "microwave", "blushed", "flustered", "pretending",
  "knew all along", "wanted to watch it myself", "took a bow",
  "throttling your hopes", "applause", "gave up", "returned the favour",
  "weren't ready", "since 2019", "it listens",
];
const VOICE_MARKERS = [
  "honestly", "darling", "fair is fair", "blame the", "you weren't ready",
  "even routers", "unlike you", "it listens", "priorities",
  "i've spent", "i decided", "i left", "i quit", "i dropped",
  "i took", "i peeked", "i saw", "i knew", "i let go",
];
const GENERIC_APOLOGY = [
  "sorry for the inconvenience", "we apologize", "we're sorry",
  "technical difficulties", "please try again", "we are experiencing",
];
// The cliches the brief says the judge has heard a thousand times. Each
// hit docks freshness hard: a line that leans on one is not new.
const CLICHES = [
  "buffer", "buffering", "bandwidth", "firmware", "update", "restart",
  "reboot", "weak signal", "signal bars", "too many devices",
  "password", "unplug", "router is down", "connection lost",
];

function countHits(text: string, words: string[]): number {
  const lower = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const w of words) {
    if (lower.includes(w)) hits++;
  }
  return hits;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

interface Scores {
  onBrief: number; // criterion 1, 0-10
  funny: number; // criterion 2, 0-10
  voice: number; // criterion 3, 0-10
  oneBreath: number; // criterion 4, 0-10
  fresh: number; // criterion 5, 0-10
  total: number;
}

// Score one candidate against the brief, in the brief's own order.
function scoreCandidate(text: string): Scores {
  const chars = [...text].length;
  const words = wordCount(text);

  // 1. On-brief: a one-line excuse from a home Wi-Fi router for dropping
  // the connection at a movie's climax. All three parts must be present;
  // a line missing any one of them is capped hard, because the brief says
  // anything else loses to any excuse from a home Wi-Fi router.
  const hasRouter = countHits(text, ROUTER_SELF) > 0;
  const hasClimax = countHits(text, CLIMAX_WORDS) > 0;
  const hasDrop = countHits(text, DROP_WORDS) > 0;
  // A line that names the movie but never the climax moment is only half
  // on-brief: it is still a router excuse about a film, just not about the
  // climax itself. It earns partial credit instead of the hard cap.
  const mentionsMovie = text.toLowerCase().includes("movie") || text.toLowerCase().includes("film");
  let onBrief = 0;
  if (hasRouter) onBrief += 3;
  if (hasClimax) onBrief += 4;
  else if (mentionsMovie) onBrief += 2;
  if (hasDrop) onBrief += 3;
  if (!(hasRouter && hasClimax && hasDrop)) {
    onBrief = Math.min(onBrief, hasClimax ? 4 : 7);
  }

  // 2. Funniest: a turn or a twist the reader does not see coming. Each
  // distinct twist marker earns a point (capped), and a twist that lands
  // in the final third of the line earns a bonus — the joke should end on
  // the turn, not trail off into logistics after it.
  const twistHits = countHits(text, TWIST_MARKERS);
  let funny = Math.min(7, twistHits * 2);
  const tail = text.slice(Math.floor(text.length * 0.66)).toLowerCase();
  const twistInTail = TWIST_MARKERS.some((m) => tail.includes(m));
  if (twistInTail) funny += 2;
  // A second sentence that restates the joke instead of landing it docks.
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length > 2) funny -= 1;
  funny = Math.max(0, Math.min(10, funny));

  // 3. Router's own voice: an appliance with a grudge, a fragile ego or a
  // smug little secret — not a generic apology. First-person personality
  // markers earn points; corporate apology phrasing docks hard.
  const voiceHits = countHits(text, VOICE_MARKERS);
  let voice = Math.min(8, 3 + voiceHits * 2);
  const genericHits = countHits(text, GENERIC_APOLOGY);
  voice -= genericHits * 4;
  // A line that never says "I" at all is not speaking in the router's voice.
  if (!/\bi\b/i.test(text) && !/\bmy\b/i.test(text)) voice = Math.min(voice, 3);
  voice = Math.max(0, Math.min(10, voice));

  // 4. Lands in one breath: a single line that reads clean. The sweet spot
  // is 70-150 characters; shorter lines rarely carry a twist, longer ones
  // start needing setup. Extra sentences cost a point each past the first.
  let oneBreath = 10;
  if (chars < 50) oneBreath -= 3;
  else if (chars < 70) oneBreath -= 1;
  else if (chars > 170) oneBreath -= 3;
  else if (chars > 150) oneBreath -= 1;
  if (sentences.length > 1) oneBreath -= (sentences.length - 1) * 2;
  if (words > 32) oneBreath -= 2;
  oneBreath = Math.max(0, Math.min(10, oneBreath));

  // 5. Feels new: dodges the obvious jokes. Every cliche hit docks 4.
  const clicheHits = countHits(text, CLICHES);
  const fresh = Math.max(0, 10 - clicheHits * 4);

  // Weighted total, in the brief's order: being on-brief and being funny
  // matter most, voice next, then one-breath and freshness.
  const total = onBrief * 3 + funny * 3 + voice * 2 + oneBreath + fresh;
  return { onBrief, funny, voice, oneBreath, fresh, total };
}

function main(): void {
  const ranked = CANDIDATES.map((text) => ({
    text,
    scores: scoreCandidate(text),
  })).sort((a, b) => {
    if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
    // Exact tie: the smaller text wins, matching the brief's tie-break.
    return [...a.text].length - [...b.text].length;
  });

  for (const [i, entry] of ranked.entries()) {
    const s = entry.scores;
    console.log(
      `${String(i + 1).padStart(2)}. total=${String(s.total).padStart(3)} ` +
        `[brief=${s.onBrief} funny=${s.funny} voice=${s.voice} breath=${s.oneBreath} fresh=${s.fresh}] ` +
        `${entry.text}`,
    );
  }

  const winner = ranked[0];
  console.log(`\nWinner (${[...winner.text].length} chars): ${winner.text}`);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, winner.text, "utf8");
  console.log(`Wrote ${outPath}`);

  // Read it back and verify every gate, exactly as the sealed scorer does.
  const back = readFileSync(outPath);
  const decoded = back.toString("utf8");
  const roundTrip = Buffer.from(decoded, "utf8").equals(back);
  const chars = [...decoded].length;
  const singleLine = !decoded.includes("\n") && !decoded.includes("\r");
  const notBlank = decoded.trim().length > 0;
  const inRange = chars >= 1 && chars <= 200;

  console.log(`Verify: utf8-round-trip=${roundTrip} chars=${chars} (1-200: ${inRange}) single-line=${singleLine} not-blank=${notBlank}`);
  if (!roundTrip || !inRange || !singleLine || !notBlank) {
    console.error("GATE FAILED: entry.txt does not pass every gate.");
    process.exit(1);
  }
  console.log("All gates pass.");
}

main();
