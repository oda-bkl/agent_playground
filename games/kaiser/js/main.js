import { CONSTANTS, createGame, setRation, resolveYear } from './engine.js';
import { UI } from './ui.js';

function newGame() {
  return createGame({ seed: (Math.random() * 0x7fffffff) | 0 });
}

let state = newGame();

const ui = new UI(document, {
  onRationChange(delta) {
    const next = state.players[0].ration + delta;
    if (!CONSTANTS.RATIONS[next]) return;
    state = setRation(state, 0, next);
    ui.renderDashboard(state);
  },
  onEndYear() {
    const yearResolved = state.year;
    const result = resolveYear(state);
    state = result.state;
    ui.playChronicle(state, result.chronicle, yearResolved);
  },
  onChronicleDone() {
    if (state.players[0].alive) ui.renderDashboard(state);
    else ui.showEnd(state);
  },
  onNewGame() {
    state = newGame();
    ui.renderDashboard(state);
  },
});

ui.renderDashboard(state);
