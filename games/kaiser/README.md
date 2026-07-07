# KAISER

A retro browser game inspired by the concept and feel of Ariolasoft's *Kaiser* (C64, 1984). Rise from Mister to Kaiser by managing grain, land, taxes, and your people — before your ruler dies.

Design: [PRD.md](PRD.md) · Implementation plan: [ISSUES.md](ISSUES.md)

## Run

The game uses ES modules, which browsers refuse to load over `file://` — serve the directory with any static file server:

```sh
cd games/kaiser
python3 -m http.server 8000
# then open http://localhost:8000/
```

## Keys

`←`/`→` adjust the focused control · `Enter` end the year · `Space` skip the chronicle · `L` toggle German/English · `C` toggle CRT scanlines

## Tests

Engine tests run headlessly with plain Node (≥ 20), no installation:

```sh
cd games/kaiser
node --test
```

## Status

Slice 1 of [ISSUES.md](ISSUES.md) — walking skeleton: one ruler, harvest/feeding/aging loop, C64 shell, DE/EN, keyboard-first.
