# Kaiser — Implementation Issues

Vertical-slice (tracer bullet) breakdown of [PRD.md](PRD.md). Each slice cuts through all layers — engine, UI, tests — and is demoable on its own. Slices are numbered; "Blocked by" references these numbers.

**Cross-cutting acceptance criteria for every slice** (not repeated below):

- All new user-facing strings live in the DE/EN string tables, German written first; rank titles stay German in both languages.
- Every new control is fully keyboard-operable (and still mouse-operable).
- New engine behavior is covered by tests against the engine's public API only, using fixed seeds for exact assertions.
- Game state remains a single plain JSON-serializable object; all randomness flows from the seeded PRNG in the state.

Dependency shape: slice 1 unblocks two parallel tracks — the economy track (2 → 3 → 4 → 5/6) and the multiplayer track (7) — which converge at 8; slices 9, 10, and 11 are the tail.

---

## 1. Walking skeleton: one ruler, one year loop ✅ DONE

**Parent:** [PRD.md](PRD.md)
**Status:** Done (2026-07-07) — verified by 13 engine tests (`node --test`) and a headless-browser smoke test of the full loop (dashboard → chronicle → death → end screen, DE/EN toggle, zero JS errors).

### What to build

The thinnest playable game: a single ruler manages grain and population through consecutive years until death. Establishes every architectural pattern the later slices extend — the pure seed-deterministic engine with its phased year resolution and structured chronicle output, the C64-skinned full-viewport dashboard, the paced and skippable resolution sequence, the DE/EN strings module with language toggle, the keyboard navigation pattern, the engine test harness, and a README noting the static-server requirement for ES modules.

Scope of rules: harvest (cultivated land capped by population × weather-driven yield), ration choice (skimpy → generous) with starvation/growth consequences, aging from 25 toward a hidden randomized death age (~55–70), death ends the game. No gold, taxes, market, buildings, events, ranks, or rivals yet.

### Acceptance criteria

- [x] Opening the page (via a static server) starts a new solo game; the dashboard shows granary, land, population, age, and year.
- [x] The player sets a ration level and ends the year with Enter; the year resolves as a paced phase-by-phase chronicle (harvest → feeding → aging), skippable with Space.
- [x] Starvation, population growth, and fallow-land capping behave per the PRD economy model and are covered by seeded engine tests.
- [x] The ruler dies at the hidden death age with a mournful notice; the game ends.
- [x] Language toggle switches the entire UI between German (default) and English.
- [x] The C64 look (palette, pixel typography, optional scanline toggle) renders full-viewport.
- [x] Engine tests run headlessly with plain Node, no installation.

### Blocked by

None — can start immediately.

---

## 2. Taxes, popularity & population dynamics

**Parent:** [PRD.md](PRD.md)

### What to build

Gold enters the game. The player sets a yearly tax rate; income scales with population and prosperity. Popularity becomes a visible stat driven by rations and taxes; low popularity causes emigration and, at the extreme, a revolt. The taxes phase joins the year-resolution chronicle.

### Acceptance criteria

- [ ] Tax rate is adjustable on the dashboard within the PRD's bounds; treasury and popularity are visible.
- [ ] Tax income, popularity shifts, emigration, and revolt triggers behave per the PRD model, covered by seeded engine tests including edge cases (zero population, maximum rate).
- [ ] The chronicle narrates tax collection and any emigration/revolt with flavor prose.
- [ ] The dashboard warns before ending a year with an obviously catastrophic plan (e.g. rations the granary cannot cover).

### Blocked by

- Slice 1

---

## 3. Market: grain & land trading at fluctuating prices

**Parent:** [PRD.md](PRD.md)

### What to build

A market panel where the player buys and sells grain and land at prices that move each year — partly random, later also reactive to events. Speculation becomes a viable strategy. The market-movement phase joins the chronicle.

### Acceptance criteria

- [ ] The player can buy/sell grain and land within treasury/stock limits; keyboard +/- adjustment works for amounts.
- [ ] Prices move each year within PRD-defined bounds and are identical for all future players; movements are seed-deterministic and test-covered.
- [ ] Attempting to overspend or oversell is prevented with clear feedback.
- [ ] The chronicle reports the new prices ("Grain is dear this year…").

### Blocked by

- Slice 1

---

## 4. Buildings

**Parent:** [PRD.md](PRD.md)

### What to build

A buildings panel offering one-time constructions with persistent effects: mill (yield bonus), market (tax income bonus), granary (protects stored grain from loss events), church (popularity), cathedral and castle (prestige-only, later rank gates). Purchases spend gold and appear in the chronicle.

### Acceptance criteria

- [ ] Each building can be commissioned once, is listed with cost and effect, and its effect demonstrably alters engine outcomes (test-covered per building).
- [ ] Effects stack correctly with the base economy (mill × weather, market × tax income).
- [ ] Owned buildings are visible on the dashboard.

### Blocked by

- Slices 2, 3

---

## 5. Random events

**Parent:** [PRD.md](PRD.md)

### What to build

One random event per year with meaningful probability and real consequences: plague, rats in the granary, fire, drought, bumper harvest, wandering merchant, imperial visit. Events interact with preparations (a granary mitigates rats; a drought interacts with grain reserves). Each event lands in the chronicle with an audio-ready dramatic sting point and flavor prose in both languages.

### Acceptance criteria

- [ ] The event catalog from the PRD is implemented; selection and effects are seed-deterministic and each event is test-covered, including its mitigation (e.g. granary vs. rats).
- [ ] Event frequency and impact bounds match the PRD's "one per year with meaningful probability".
- [ ] Events can influence market prices (e.g. drought raises grain prices).
- [ ] The chronicle presents each event as a distinct dramatic beat in the resolution sequence.

### Blocked by

- Slice 4

---

## 6. Rank ladder, mortality & victory

**Parent:** [PRD.md](PRD.md)

### What to build

The win condition. The ladder Mister → Edler → Freiherr → Graf → Fürst → Herzog → Kurfürst → Kaiser, each promotion gated by visible thresholds (land, population, required buildings) plus a hefty fee. Kaiser is claimed, not reached — the first claimant wins immediately with a coronation finale. Dying uncrowned eliminates the ruler; the game ends when someone is crowned or everyone is dead (highest rank wins posthumously). End-of-game screen summarizes the reign.

### Acceptance criteria

- [ ] Current rank and the next promotion's requirements/fee are always visible; promotion is a deliberate player action.
- [ ] Threshold enforcement, fee payment, Kaiser exclusivity, uncrowned death elimination, and both game-end conditions are test-covered.
- [ ] Coronation and death are staged as dramatic chronicle finales.
- [ ] A finished game shows an end screen with the outcome and reign summary.

### Blocked by

- Slice 4

---

## 7. Hot-seat multiplayer & standings board

**Parent:** [PRD.md](PRD.md)

### What to build

Game setup screen: choose 1–4 human players and name each ruler (with suggested defaults). Turns rotate through players within each year; a clear "hand the keyboard to <name>" interstitial separates human turns. A full-transparency standings board (rank, land, population, gold, age for every ruler) appears between turns and on demand via a key. All rulers trade against the same yearly market prices.

### Acceptance criteria

- [ ] A 2–4 player hot-seat game is playable start to finish with unambiguous turn hand-overs.
- [ ] The standings board shows all rulers' public stats, is reachable anytime via its key, and appears between turns.
- [ ] Per-player state is fully self-contained in the game-state object (PvP-readiness per the PRD); multi-ruler year resolution is test-covered.
- [ ] Solo setup (1 human, no AI yet) still works as in slice 1.

### Blocked by

- Slice 1

---

## 8. AI rivals

**Parent:** [PRD.md](PRD.md)

### What to build

Solo games are backfilled with three AI rivals; hot-seat games fill no seats by default. One shared decision routine parameterized by archetype weight-sets — Hoarder (over-saves, under-feeds), Builder (rushes buildings and rank thresholds), Speculator (plays the grain market) — drawing period German noble names from a pool. The AI submits decisions through the same engine API, sees the same prices and rules as humans: no cheating, no rubber-banding. AI turns resolve quickly (compressed chronicle) so a solo year stays snappy.

### Acceptance criteria

- [ ] A solo game automatically includes three named AI rivals with distinct archetypes; they appear in the standings and can win.
- [ ] The AI uses only the public engine API and player-visible information (test-enforced: no state fields beyond what a human sees).
- [ ] Archetype behavior is distinguishable in headless runs (Hoarder hoards, Builder builds, Speculator trades).
- [ ] AI turns complete without player interaction and are summarized briefly between human turns.

### Blocked by

- Slices 6, 7

---

## 9. Persistence & hall of fame

**Parent:** [PRD.md](PRD.md)

### What to build

The full game state auto-saves to localStorage after every turn. Reopening the page offers "Continue the game (year N)?" or "New game"; abandoning a save is possible. Finished games append to a local hall of fame (winner name, rank reached, years taken) shown from the start/end screens.

### Acceptance criteria

- [ ] Closing the tab mid-game and reopening resumes exactly where play stopped, including PRNG state (identical continuation, test-covered via serialize → deserialize round-trip).
- [ ] The resume prompt appears only when an unfinished game exists; abandoning deletes it.
- [ ] Finished games (crowning or all dead) are recorded in the hall of fame and displayed.
- [ ] Corrupt or version-incompatible saves fail gracefully to "New game".

### Blocked by

- Slices 6, 7

---

## 10. SID-style audio

**Parent:** [PRD.md](PRD.md)

### What to build

A handful of synthesized square-wave effects via the WebAudio API — no audio files: soft ticks pacing the resolution sequence, an event sting, a promotion fanfare, a death knell, a coronation arpeggio. Sound starts enabled after the first user interaction; M toggles mute, and the preference is remembered.

### Acceptance criteria

- [ ] Each dramatic moment listed in the PRD has a distinct synthesized sound; no external audio assets.
- [ ] M toggles mute anywhere in the game; the setting persists across sessions.
- [ ] Audio failures (blocked autoplay, no WebAudio) never break gameplay.

### Blocked by

- Slice 6

---

## 11. Headless balance harness & tuning

**Parent:** [PRD.md](PRD.md)

### What to build

A Node batch-runner that plays large numbers of AI-only games headlessly through the engine API and reports distribution statistics. Use it to tune economy constants until the PRD targets hold, then keep it as a regression guard.

### Acceptance criteria

- [ ] The harness runs hundreds of seeded AI-only games from the command line with no installation and prints termination rate, crowning-year distribution, and per-archetype win rates.
- [ ] Every game terminates (crowning or all dead) within a hard year cap.
- [ ] Median crowning year lands in the PRD's 25–35 target; constants are tuned accordingly.
- [ ] No archetype wins overwhelmingly (fairness bound documented in the harness output).

### Blocked by

- Slice 8
