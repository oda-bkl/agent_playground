// Pure game engine — no DOM, no I/O, no Date. All randomness flows from the
// seeded PRNG inside the state; identical seed + identical decisions always
// reproduce the identical game. The state is one plain JSON-serializable object.

export const CONSTANTS = {
  START_AGE: 25,
  DEATH_AGE_MIN: 55,
  DEATH_AGE_SPAN: 16, // death age lands in [55, 70]
  START_LAND: 1000, // Morgen
  START_POPULATION: 100,
  START_GRAIN: 3000, // Fass
  LAND_PER_PEASANT: 10, // one subject can cultivate this many Morgen
  YIELD_PER_MORGEN: 0.35, // Fass per cultivated Morgen at weather factor 1.0
  STARVATION_DEATH_RATE: 0.6, // share of unfed subjects who die
  RATIONS: [
    { id: 'hunger', perHead: 2, growthRate: -0.02 },
    { id: 'knapp', perHead: 3, growthRate: 0.01 },
    { id: 'gut', perHead: 3.75, growthRate: 0.025 },
    { id: 'fest', perHead: 4.5, growthRate: 0.04 },
  ],
  WEATHER: {
    CATASTROPHE_P: 0.08,
    BUMPER_P: 0.08,
    CATASTROPHE: 0.3,
    BUMPER: 1.8,
    NORMAL_MIN: 0.7,
    NORMAL_SPAN: 0.6, // normal years land in [0.7, 1.3]
  },
};

// mulberry32 over an integer counter: one serializable number is the full RNG state.
function rand(state) {
  state.prng = (state.prng + 0x6d2b79f5) | 0;
  let t = state.prng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function randInt(state, min, span) {
  return min + Math.floor(rand(state) * span);
}

export function createGame(config = {}) {
  const state = {
    version: 1,
    prng: (config.seed ?? 1) | 0,
    year: 1,
    finished: false,
    players: [],
  };
  const players = config.players?.length ? config.players : [{}];
  for (const p of players) {
    state.players.push({
      name: p.name ?? 'Herr von Habenichts',
      alive: true,
      age: p.age ?? CONSTANTS.START_AGE,
      deathAge: p.deathAge ?? randInt(state, CONSTANTS.DEATH_AGE_MIN, CONSTANTS.DEATH_AGE_SPAN),
      land: p.land ?? CONSTANTS.START_LAND,
      population: p.population ?? CONSTANTS.START_POPULATION,
      grain: p.grain ?? CONSTANTS.START_GRAIN,
      ration: p.ration ?? 1,
    });
  }
  return state;
}

export function cultivableLand(player) {
  return Math.min(player.land, player.population * CONSTANTS.LAND_PER_PEASANT);
}

export function setRation(state, playerIdx, rationIdx) {
  if (!CONSTANTS.RATIONS[rationIdx]) throw new RangeError(`no such ration: ${rationIdx}`);
  const next = structuredClone(state);
  next.players[playerIdx].ration = rationIdx;
  return next;
}

function rollWeather(state) {
  const W = CONSTANTS.WEATHER;
  const r = rand(state);
  if (r < W.CATASTROPHE_P) return W.CATASTROPHE;
  if (r > 1 - W.BUMPER_P) return W.BUMPER;
  const u = (r - W.CATASTROPHE_P) / (1 - W.CATASTROPHE_P - W.BUMPER_P);
  return W.NORMAL_MIN + u * W.NORMAL_SPAN;
}

export function weatherLabel(weather) {
  if (weather <= 0.4) return 'catastrophic';
  if (weather < 0.85) return 'poor';
  if (weather <= 1.15) return 'average';
  if (weather <= 1.5) return 'good';
  return 'bumper';
}

// Resolves one year for every living ruler, phase by phase:
// harvest → feeding → aging. Returns the next state plus a structured
// chronicle of what happened; the UI narrates the chronicle, it never
// computes rules.
export function resolveYear(state) {
  const next = structuredClone(state);
  const chronicle = [];
  for (let i = 0; i < next.players.length; i++) {
    const p = next.players[i];
    if (!p.alive) continue;

    const weather = rollWeather(next);
    const cultivated = cultivableLand(p);
    const fallow = p.land - cultivated;
    const harvest = Math.round(cultivated * CONSTANTS.YIELD_PER_MORGEN * weather);
    p.grain += harvest;
    chronicle.push({ phase: 'harvest', player: i, data: { weather, cultivated, fallow, harvest } });

    const ration = CONSTANTS.RATIONS[p.ration];
    const required = Math.round(p.population * ration.perHead);
    let eaten;
    let deaths = 0;
    let growth = 0;
    if (p.grain >= required) {
      eaten = required;
      growth = Math.round(p.population * ration.growthRate);
    } else {
      eaten = p.grain;
      const fed = Math.floor(eaten / ration.perHead);
      const unfed = p.population - fed;
      deaths = Math.round(unfed * CONSTANTS.STARVATION_DEATH_RATE);
    }
    p.grain -= eaten;
    p.population = Math.max(0, p.population - deaths + growth);
    chronicle.push({ phase: 'feeding', player: i, data: { ration: p.ration, required, eaten, deaths, growth } });

    p.age += 1;
    if (p.age >= p.deathAge) {
      p.alive = false;
      chronicle.push({ phase: 'death', player: i, data: { name: p.name, age: p.age } });
    } else {
      chronicle.push({ phase: 'aging', player: i, data: { age: p.age } });
    }
  }
  next.year += 1;
  if (next.players.every((p) => !p.alive)) {
    next.finished = true;
    chronicle.push({ phase: 'gameover', data: {} });
  }
  return { state: next, chronicle };
}
