// Rendering and input. The UI narrates engine chronicles and forwards
// decisions; it never computes game rules.

import { CONSTANTS, cultivableLand, weatherLabel } from './engine.js';
import { getString, DEFAULT_LANG } from './strings.js';

const LINE_MS = 900;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export class UI {
  constructor(doc, handlers) {
    this.doc = doc;
    this.handlers = handlers;
    this.lang = localStorage.getItem('kaiser.lang') ?? DEFAULT_LANG;
    this.crt = (localStorage.getItem('kaiser.crt') ?? 'on') === 'on';
    this.mode = 'dashboard';
    this.state = null;
    this.chron = null;
    this.header = doc.getElementById('header');
    this.screen = doc.getElementById('screen');
    this.hints = doc.getElementById('hints');
    this.applyCrt();
    this.applyLang();
    doc.addEventListener('keydown', (e) => this.onKey(e));
  }

  t(key, params) {
    return getString(this.lang, key, params);
  }

  fmt(n) {
    return new Intl.NumberFormat(this.lang === 'de' ? 'de-DE' : 'en-GB').format(n);
  }

  applyCrt() {
    this.doc.body.classList.toggle('crt', this.crt);
  }

  applyLang() {
    this.doc.documentElement.lang = this.lang;
  }

  toggleLang() {
    this.lang = this.lang === 'de' ? 'en' : 'de';
    localStorage.setItem('kaiser.lang', this.lang);
    this.applyLang();
    this.rerender();
  }

  toggleCrt() {
    this.crt = !this.crt;
    localStorage.setItem('kaiser.crt', this.crt ? 'on' : 'off');
    this.applyCrt();
  }

  rerender() {
    if (this.mode === 'dashboard') this.renderDashboard(this.state);
    else if (this.mode === 'chronicle') this.renderChronicle();
    else if (this.mode === 'end') this.showEnd(this.state);
  }

  renderHeader(subtitle) {
    this.header.innerHTML = `
      <div class="brand">${this.t('title')} <span class="tagline">${this.t('tagline')}</span></div>
      <div class="meta">
        <span class="sub">${esc(subtitle)}</span>
        <span class="badge" id="badge-lang">${this.lang.toUpperCase()}</span>
        <span class="badge" id="badge-crt">CRT</span>
      </div>`;
    this.header.querySelector('#badge-lang').addEventListener('click', () => this.toggleLang());
    this.header.querySelector('#badge-crt').addEventListener('click', () => this.toggleCrt());
  }

  renderDashboard(state) {
    this.state = state;
    this.mode = 'dashboard';
    const p = state.players[0];
    const ration = CONSTANTS.RATIONS[p.ration];
    const cultivated = cultivableLand(p);
    const growthPct = `${ration.growthRate > 0 ? '+' : ''}${Math.round(ration.growthRate * 100)}%`;
    this.renderHeader(this.t('year', { year: this.fmt(state.year) }));
    this.screen.innerHTML = `
      <div class="panels">
        <section class="panel">
          <h2>${this.t('panel_ruler')}</h2>
          <div class="stat">${esc(p.name)}</div>
          <div class="sub">${this.t('stat_age', { age: this.fmt(p.age) })}</div>
        </section>
        <section class="panel">
          <h2>${this.t('panel_granary')}</h2>
          <div class="stat">${this.t('stat_grain', { grain: this.fmt(p.grain) })}</div>
        </section>
        <section class="panel">
          <h2>${this.t('panel_land')}</h2>
          <div class="stat">${this.t('stat_land', { land: this.fmt(p.land) })}</div>
          <div class="sub">${this.t('stat_cultivable', { cultivated: this.fmt(cultivated) })}</div>
          <div class="sub ${p.land - cultivated > 0 ? 'warn' : ''}">${this.t('stat_fallow', { fallow: this.fmt(p.land - cultivated) })}</div>
        </section>
        <section class="panel">
          <h2>${this.t('panel_people')}</h2>
          <div class="stat">${this.t('stat_population', { population: this.fmt(p.population) })}</div>
        </section>
        <section class="panel control focused">
          <h2>${this.t('panel_rations')}</h2>
          <div class="selector">
            <span class="arrow" id="ration-prev">&lt;</span>
            <span class="sel-name">${this.t(`ration_${ration.id}`)}</span>
            <span class="arrow" id="ration-next">&gt;</span>
          </div>
          <div class="sub">${this.t('ration_cost', { cost: this.fmt(Math.round(p.population * ration.perHead)) })}</div>
          <div class="sub">${this.t('ration_growth', { pct: growthPct })}</div>
        </section>
      </div>
      <button class="endyear" id="end-year">${this.t('end_year')}</button>`;
    this.screen.querySelector('#ration-prev').addEventListener('click', () => this.handlers.onRationChange(-1));
    this.screen.querySelector('#ration-next').addEventListener('click', () => this.handlers.onRationChange(1));
    this.screen.querySelector('#end-year').addEventListener('click', () => this.handlers.onEndYear());
    this.hints.textContent = this.t('hints');
  }

  chronLines() {
    const lines = [];
    for (const entry of this.chron.chronicle) {
      const d = entry.data;
      switch (entry.phase) {
        case 'harvest':
          lines.push({
            text: this.t('ch_harvest', {
              weather: this.t(`weather_${weatherLabel(d.weather)}`),
              cultivated: this.fmt(d.cultivated),
              fallow: this.fmt(d.fallow),
            }),
          });
          lines.push({ text: this.t('ch_harvest_yield', { harvest: this.fmt(d.harvest) }) });
          break;
        case 'feeding':
          lines.push({
            text: this.t('ch_feed', {
              ration: this.t(`ration_${CONSTANTS.RATIONS[d.ration].id}`),
              eaten: this.fmt(d.eaten),
            }),
          });
          if (d.deaths > 0) lines.push({ text: this.t('ch_starve', { deaths: this.fmt(d.deaths) }), grim: true });
          else if (d.growth > 0) lines.push({ text: this.t('ch_growth_up', { growth: this.fmt(d.growth) }) });
          else if (d.growth < 0) lines.push({ text: this.t('ch_growth_down', { loss: this.fmt(-d.growth) }), grim: true });
          break;
        case 'aging':
          lines.push({ text: this.t('ch_aging', { age: this.fmt(d.age) }) });
          break;
        case 'death':
          lines.push({ text: this.t('ch_death', { name: d.name, age: this.fmt(d.age) }), grim: true });
          break;
      }
    }
    return lines;
  }

  playChronicle(state, chronicle, yearResolved) {
    this.state = state;
    this.mode = 'chronicle';
    this.chron = { chronicle, yearResolved, revealed: 1, done: false, timer: null };
    if (this.chronLines().length <= 1) this.chron.done = true;
    else this.chron.timer = setInterval(() => this.tickChronicle(), LINE_MS);
    this.renderChronicle();
  }

  tickChronicle() {
    const total = this.chronLines().length;
    this.chron.revealed = Math.min(this.chron.revealed + 1, total);
    if (this.chron.revealed >= total) this.stopChronicleTimer();
    this.renderChronicle();
  }

  stopChronicleTimer() {
    if (this.chron.timer) clearInterval(this.chron.timer);
    this.chron.timer = null;
    this.chron.done = true;
  }

  skipChronicle() {
    this.chron.revealed = this.chronLines().length;
    this.stopChronicleTimer();
    this.renderChronicle();
  }

  renderChronicle() {
    const lines = this.chronLines();
    this.renderHeader(this.t('year', { year: this.fmt(this.chron.yearResolved) }));
    const shown = lines
      .slice(0, this.chron.revealed)
      .map((l) => `<div class="line${l.grim ? ' grim' : ''}">${esc(l.text)}</div>`)
      .join('');
    this.screen.innerHTML = `
      <div class="chronicle">
        <h2>${this.t('chronicle_title', { year: this.fmt(this.chron.yearResolved) })}</h2>
        ${shown}
        ${this.chron.done ? `<div class="continue">${this.t('continue')}</div>` : ''}
      </div>`;
    this.hints.textContent = this.t('hints_chronicle');
  }

  showEnd(state) {
    this.state = state;
    this.mode = 'end';
    const p = state.players[0];
    this.renderHeader(this.t('year', { year: this.fmt(state.year - 1) }));
    this.screen.innerHTML = `
      <div class="endscreen">
        <h1>${this.t('end_title')}</h1>
        <p>${esc(
          this.t('end_body', {
            name: p.name,
            year: this.fmt(state.year - 1),
            age: this.fmt(p.age),
            years: this.fmt(p.age - CONSTANTS.START_AGE),
          }),
        )}</p>
        <div class="continue">${this.t('new_game')}</div>
      </div>`;
    this.hints.textContent = this.t('hints_chronicle');
  }

  onKey(e) {
    if (e.key === 'l' || e.key === 'L') return this.toggleLang();
    if (e.key === 'c' || e.key === 'C') return this.toggleCrt();
    if (this.mode === 'dashboard') {
      if (e.key === 'ArrowLeft') this.handlers.onRationChange(-1);
      else if (e.key === 'ArrowRight') this.handlers.onRationChange(1);
      else if (e.key === 'Enter') this.handlers.onEndYear();
    } else if (this.mode === 'chronicle') {
      if (e.key === ' ') {
        e.preventDefault();
        if (!this.chron.done) this.skipChronicle();
      } else if (e.key === 'Enter') {
        if (!this.chron.done) this.skipChronicle();
        else this.handlers.onChronicleDone();
      }
    } else if (this.mode === 'end') {
      if (e.key === 'Enter') this.handlers.onNewGame();
    }
  }
}
