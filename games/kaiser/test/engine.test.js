// Engine tests — the single testing seam is the engine's public API.
// Fixed seeds make every assertion exact, not statistical.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSTANTS,
  createGame,
  cultivableLand,
  resolveYear,
  setRation,
  weatherLabel,
} from '../js/engine.js';

function playYears(state, years) {
  const chronicles = [];
  for (let i = 0; i < years; i++) {
    const r = resolveYear(state);
    state = r.state;
    chronicles.push(r.chronicle);
  }
  return { state, chronicles };
}

test('same seed and decisions reproduce the identical game', () => {
  const a = playYears(createGame({ seed: 42 }), 15);
  const b = playYears(createGame({ seed: 42 }), 15);
  assert.deepEqual(a.state, b.state);
  assert.deepEqual(a.chronicles, b.chronicles);
});

test('different seeds diverge', () => {
  const a = playYears(createGame({ seed: 1 }), 5);
  const b = playYears(createGame({ seed: 2 }), 5);
  assert.notDeepEqual(a.state, b.state);
});

test('state survives a JSON round-trip and continues identically', () => {
  const { state } = playYears(createGame({ seed: 7 }), 5);
  const revived = JSON.parse(JSON.stringify(state));
  assert.deepEqual(revived, state);
  assert.deepEqual(resolveYear(revived), resolveYear(state));
});

test('resolveYear and setRation do not mutate their input', () => {
  const state = createGame({ seed: 3 });
  const snapshot = structuredClone(state);
  resolveYear(state);
  setRation(state, 0, 2);
  assert.deepEqual(state, snapshot);
});

test('cultivation is capped by population; surplus land lies fallow', () => {
  const state = createGame({ seed: 5, players: [{ population: 10, land: 1000 }] });
  assert.equal(cultivableLand(state.players[0]), 100);
  const { chronicle } = resolveYear(state);
  const harvest = chronicle.find((e) => e.phase === 'harvest');
  assert.equal(harvest.data.cultivated, 100);
  assert.equal(harvest.data.fallow, 900);
});

test('with no grain and no harvest, unfed subjects starve', () => {
  const state = createGame({ seed: 5, players: [{ land: 0, grain: 0, population: 100, ration: 1 }] });
  const { state: next, chronicle } = resolveYear(state);
  const feeding = chronicle.find((e) => e.phase === 'feeding');
  assert.equal(feeding.data.eaten, 0);
  assert.equal(feeding.data.deaths, Math.round(100 * CONSTANTS.STARVATION_DEATH_RATE));
  assert.equal(next.players[0].population, 100 - feeding.data.deaths);
  assert.equal(next.players[0].grain, 0);
});

test('a generous ration grows the population', () => {
  const state = createGame({ seed: 5, players: [{ grain: 100000, population: 100, ration: 3 }] });
  const { state: next } = resolveYear(state);
  const rate = CONSTANTS.RATIONS[3].growthRate;
  assert.equal(next.players[0].population, 100 + Math.round(100 * rate));
});

test('a starvation ration shrinks the population even with full stores', () => {
  const state = createGame({ seed: 5, players: [{ grain: 100000, population: 100, ration: 0 }] });
  const { state: next } = resolveYear(state);
  assert.ok(next.players[0].population < 100);
});

test('the ruler dies at the hidden death age and the game ends', () => {
  const state = createGame({ seed: 5, players: [{ age: 60, deathAge: 61 }] });
  const { state: next, chronicle } = resolveYear(state);
  assert.equal(next.players[0].alive, false);
  assert.equal(next.finished, true);
  assert.ok(chronicle.some((e) => e.phase === 'death' && e.data.age === 61));
  assert.ok(chronicle.some((e) => e.phase === 'gameover'));
});

test('death age is always within 55-70', () => {
  for (let seed = 0; seed < 200; seed++) {
    const { deathAge } = createGame({ seed }).players[0];
    assert.ok(deathAge >= 55 && deathAge <= 70, `seed ${seed}: ${deathAge}`);
  }
});

test('long games keep weather, grain, and population within bounds', () => {
  let state = createGame({ seed: 99, players: [{ deathAge: 1000 }] });
  const W = CONSTANTS.WEATHER;
  for (let i = 0; i < 50; i++) {
    const r = resolveYear(state);
    state = r.state;
    const weather = r.chronicle.find((e) => e.phase === 'harvest').data.weather;
    assert.ok(weather >= W.CATASTROPHE && weather <= W.BUMPER);
    assert.ok(state.players[0].grain >= 0);
    assert.ok(state.players[0].population >= 0);
  }
});

test('weather labels cover the whole factor range', () => {
  assert.equal(weatherLabel(0.3), 'catastrophic');
  assert.equal(weatherLabel(0.7), 'poor');
  assert.equal(weatherLabel(1.0), 'average');
  assert.equal(weatherLabel(1.3), 'good');
  assert.equal(weatherLabel(1.8), 'bumper');
});

test('setRation rejects unknown ration levels', () => {
  const state = createGame({ seed: 1 });
  assert.throws(() => setRation(state, 0, 4), RangeError);
  assert.throws(() => setRation(state, 0, -1), RangeError);
});
