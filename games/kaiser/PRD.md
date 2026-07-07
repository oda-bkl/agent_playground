# PRD: Kaiser — a retro browser strategy game

A browser game inspired by the *concept and feel* of Ariolasoft's **Kaiser** (C64, 1984). Not a mechanical clone — a modern, keyboard-first homage to its economic race for the crown.

## Problem Statement

Players who remember Kaiser (and players who enjoy Hamurabi-style economic simulations) have no way to get that experience conveniently today: the original requires emulators, is single-machine German-only retroware, and cannot be casually shared or played in a browser. There is currently no game in this playground repository that scratches the "rise from petty landlord to Kaiser" itch — a short, competitive, turn-based economy race that works alone at a desk or with friends passing one keyboard.

## Solution

A self-contained browser game in `games/kaiser/`: 1–4 human players in hot-seat mode (solo games are backfilled with three rule-based AI rivals) manage a medieval territory year by year — harvesting and trading grain, buying land, setting taxes, feeding their population, erecting buildings — to climb the nobility ladder from **Mister** to **Kaiser**. One turn is one year; rulers age and die; the first player crowned Kaiser wins. The presentation is a C64 homage (palette, pixel typography, optional scanlines, SID-style sound effects) on a modern full-viewport layout, fully navigable by keyboard, bilingual German/English with German as the default.

## User Stories

### Game setup

1. As a player, I want to start a new game by choosing 1–4 human players, so that I can play alone or hot-seat with friends.
2. As a solo player, I want empty seats filled with three AI rivals, so that I always have a competitive ladder to climb.
3. As a player, I want to enter my ruler's name (with a suggested default), so that the chronicle and standings speak about *me*.
4. As a player, I want AI rivals to carry randomly drawn period German noble names, so that the fiction feels alive rather than "CPU 1/2/3".
5. As a returning player, I want the app to offer to resume my unfinished game when I open the page, so that closing the tab mid-game costs me nothing.
6. As a player, I want to choose German or English at any time, so that I can share the game with non-German speakers (German is the default).

### Core turn loop

7. As a ruler, I want a single decision dashboard showing my treasury, granary, land, population, popularity, age, and rank at a glance, so that I can make all yearly decisions from one screen in any order.
8. As a ruler, I want to buy and sell grain at yearly fluctuating market prices, so that speculation ("buy low, sell high") is a viable path to wealth.
9. As a ruler, I want to buy and sell land at yearly fluctuating prices, so that I can grow my territory or liquidate it in a crisis.
10. As a ruler, I want to see how much of my land my population can actually cultivate, so that I understand that land and population must grow together and surplus land lies fallow.
11. As a ruler, I want to choose a ration level from skimpy to generous for feeding my population, so that I can trade grain reserves against popularity, growth, and starvation risk.
12. As a ruler, I want to set a yearly tax rate, so that I can trade income against popularity and emigration.
13. As a ruler, I want to commission buildings — mill (yield), market (tax income), granary (grain protection), church (popularity), and prestige constructions (cathedral, castle) — so that I can invest gold into permanent advantages and rank requirements.
14. As a ruler, I want to end my year with a single confirming action, so that the turn hands over cleanly to the next player or the resolution.
15. As a ruler, I want the dashboard to warn me before I end a year with an obviously catastrophic plan (e.g. rations I cannot pay, guaranteed mass starvation), so that I lose to the game, not to a misclick.

### Year resolution & drama

16. As a player, I want the year to resolve as a short, paced, phase-by-phase chronicle (harvest → feeding → taxes → market shift → event → promotion check), so that the year *unfolds* dramatically instead of dumping a stat diff.
17. As an impatient player, I want to skip the resolution sequence with a single key, so that late-game turns stay fast.
18. As a player, I want one random event per year with real consequences — plague, rats in the granary, fire, drought, bumper harvest, wandering merchant, imperial visit — so that no two games feel alike.
19. As a player, I want event outcomes to interact with my preparations (e.g. a granary mitigates rats), so that events reward planning rather than pure luck.
20. As a player, I want flavorful chronicle prose ("The harvest was poor. 340 peasants starved. Your treasurer weeps."), so that the game keeps the storytelling charm of the original.

### Rank ladder & winning

21. As a ruler, I want to climb the ladder Mister → Edler → Freiherr → Graf → Fürst → Herzog → Kurfürst → Kaiser, so that my progress has named, memorable milestones.
22. As a ruler, I want each promotion to require visible thresholds (land, population, buildings) plus a hefty fee, so that I always know what my next goal costs.
23. As a ruler, I want rank titles to remain German in both UI languages, so that the fiction keeps its identity.
24. As a player, I want the Kaiser rank to be exclusive — first ruler to claim it wins immediately — so that the endgame is a genuine race.
25. As a ruler, I want my ruler to start at age 25, age one year per turn, and die at a randomized age around 55–70, so that a ticking mortality clock forces decisive play ("I'm 58 and still only a Graf").
26. As a player, I want a ruler who dies uncrowned to be eliminated (with a suitably mournful death notice), so that mortality has teeth.
27. As a player, I want the game to end when someone is crowned or all rulers are dead (highest rank wins posthumously), so that every game reaches a definite conclusion in roughly 25–35 turns (~20–30 minutes).

### Competition & visibility

28. As a player, I want a full-transparency standings board (rank, land, population, gold, age of every ruler) shown between turns and on demand via a key, so that rivalry and trash-talk are fueled by data.
29. As a hot-seat player, I want a clear "hand the keyboard to <name>" interstitial between human turns, so that turn ownership is never confusing.
30. As a solo player, I want AI rivals with distinct personalities — a Hoarder, a Builder, a Speculator — so that losing to them feels like losing to *someone*.
31. As a player, I want the AI to play by exactly the same rules, prices, and information as humans (no cheating, no rubber-banding), so that beating them is a fair achievement.
32. As a competitive player, I want a local hall of fame recording finished games (winner, rank reached, years taken), so that past glories persist like the high-score tables of 1984.

### Presentation & input

33. As a nostalgic player, I want a C64 visual homage — blue-on-blue palette, pixel typography, C64 accent colors, optional CRT scanline overlay — so that one glance says "this is Kaiser".
34. As a modern player, I want the layout to use the full viewport with side-by-side panels rather than a 320×200 letterbox, so that the retro skin doesn't cost usability.
35. As a keyboard player, I want to drive the entire game without a mouse — cycling panels, adjusting amounts with arrow/+/- keys, Enter to end the year, Space to skip sequences, a key for standings, M for mute — so that play is fast and feels period-appropriate.
36. As a player, I want a handful of synthesized SID-style sound effects (resolution ticks, event stings, promotion fanfare, death knell, coronation arpeggio) with a remembered mute toggle, so that dramatic moments land without background-music annoyance.
37. As a player, I want all interactive elements to remain mouse-operable too, so that keyboard-first never means keyboard-only.

### Persistence

38. As a player, I want the full game state auto-saved locally after every turn, so that an interrupted session resumes exactly where it stopped.
39. As a player, I want to abandon a saved game and start fresh, so that a doomed reign doesn't hold my browser hostage.

## Implementation Decisions

- **Modules.** The game is split into focused ES modules: a pure game **engine** (all rules, zero DOM), an **AI** module (rival decision-making), an **events** module (event catalog and resolution), a **strings** module (full DE/EN string tables), an **audio** module (WebAudio synthesis), a **UI** module (rendering + keyboard handling), and a bootstrap entry point.
- **Pure, deterministic engine.** The engine exposes a functional API over a single serializable game-state object: create a game from a config and seed, submit a player's yearly decisions, resolve a year into a new state plus a structured chronicle of what happened. All randomness flows from a seeded PRNG inside the state, so identical seed + identical decisions always reproduce the same game. The UI renders the chronicle; it never computes rules.
- **Serializable state.** The entire game state is one plain JSON-serializable object. This single decision powers localStorage persistence, resume, headless simulation, and future PvP synchronization.
- **Year resolution order** is fixed and phased: harvest → feeding → taxes → market price movement → random event → promotion check. The chronicle output mirrors these phases one-to-one so the UI can pace them dramatically.
- **Economy model.** Resources per ruler: gold (Taler), grain (Korn), land (Morgen), population; derived: popularity, rank, age. Harvest = cultivated land × weather-driven yield factor, where cultivable land is capped by population. Ration level trades grain against popularity/growth/starvation. Tax income = population × prosperity × rate, with popularity penalties for high rates and emigration/revolt at low popularity. Market prices for grain and land fluctuate yearly — partly random, partly reactive to events.
- **Buildings** are one-time constructions with persistent effects: mill (yield bonus), market (tax bonus), granary (protects grain from loss events), church (popularity), cathedral and castle (prestige-only rank gates).
- **Rank ladder**: Mister, Edler, Freiherr, Graf, Fürst, Herzog, Kurfürst, Kaiser. Each promotion checks thresholds (land, population, required buildings) and charges a promotion fee. Kaiser is claimed, not merely reached — first claimant wins.
- **Mortality**: start age 25, one year per turn, death age randomized ~55–70 per ruler at game creation (hidden from the player).
- **AI rivals** share one decision routine parameterized by archetype weight-sets (Hoarder, Builder, Speculator). They receive the same state view and prices as humans; no hidden bonuses.
- **PvP military is deliberately deferred** but architecturally anticipated: per-player state is self-contained, and year resolution is phased so a "war phase" can be inserted later without restructuring.
- **UI/UX**: single decision dashboard (Market / Taxes / Granary / Buildings panels) + End Year; paced skippable resolution sequence; standings interstitial between players. Keyboard-first with the bindings listed in the user stories. C64 palette and pixel typography over a full-viewport CSS grid layout; scanline overlay and sound both toggleable, preferences remembered.
- **Localization**: every user-facing string (including event prose) lives in the DE/EN string tables from day one; German default; rank titles untranslated by design.
- **Stack**: vanilla JavaScript, ES modules, no framework, no build step, no dependencies. Served by any static file server (ES modules do not load over `file://`); a short README notes this.
- **Balance tuning is empirical, not guessed**: the target of ~25–35 years to a competent crowning is validated by running large batches of headless AI-only games and adjusting economy constants until the distribution lands.

## Testing Decisions

- **The single testing seam is the engine's public API.** Tests construct a game state, feed decisions, resolve years, and assert only on the resulting state and chronicle — external behavior, never internal helper functions or intermediate variables. No new seams are introduced for testing; the UI, audio, and storage layers stay untested in v1.
- **Determinism is the enabling property**: a fixed seed plus a fixed decision script must reproduce an identical game, making every scenario test exact rather than statistical.
- **What gets tested**: harvest/feeding/tax arithmetic including edge cases (zero grain, zero population, fallow land cap); starvation, emigration, and revolt triggers; market price bounds; each event's effect including mitigations (granary vs. rats); promotion threshold and fee enforcement; Kaiser exclusivity; death and elimination; end-of-game detection; save-state round-tripping (serialize → deserialize → identical continuation).
- **Statistical balance checks** run whole AI-only games headlessly in Node and assert distribution-level properties (games terminate; median crowning year within target; no archetype wins overwhelmingly).
- **Prior art**: none — the repository's existing game has no tests. This PRD establishes the pattern: plain Node test scripts against the pure engine, runnable without any installation.

## Out of Scope

- **Player-vs-player military** (armies, raids, combat resolution, AI aggression) — explicitly deferred to v2; v1 only keeps the architecture ready for it.
- **Online/networked multiplayer** — hot-seat only.
- **Background music** — sound effects only.
- **Difficulty levels or AI rubber-banding** — one fair difficulty; tuning happens via archetype weights.
- **Hidden information between players** — full transparency in v1; secrecy may be revisited with PvP.
- **Mobile/touch-optimized layout** — desktop browser with keyboard is the target; the game may work on touch but is not designed for it.
- **Accounts, cloud saves, leaderboards beyond localStorage.**
- **Pixel-art illustrations or animations** — the aesthetic is typography, palette, and layout.

## Further Notes

- Design finalized in a grilling session on 2026-07-07; decisions above were each explicitly confirmed by the product owner.
- The reference is the *feel* of Ariolasoft's Kaiser (competition, mortality pressure, grain speculation, the German rank ladder), not its exact formulas — original constants need not be reverse-engineered.
- Flavor writing (chronicle prose, event texts, death notices) is a first-class feature, not decoration; both language versions should be written with care, German first.
- A future `ready-for-agent`-style handoff should treat this PRD as the contract; the engine API sketch and economy constants are intentionally left to implementation, validated by the headless balance harness.
