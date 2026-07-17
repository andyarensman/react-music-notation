# Changelog

Format follows [Keep a Changelog](https://keepachangelog.com); versioning
will follow semver once published. Until the first npm publish everything
lives under Unreleased. (Adopt changesets before the first release —
see QUALITY.md.)

## [Unreleased] — 0.1.0

The entire library to date, built in numbered phases (one commit per
phase, each with a `Demo/Phase N` Storybook story).

### Core engraving (Phases 1–11)

- `Staff`/`Measure`/`Note` with duration-proportional flex spacing, all
  sizing derived from the `--staff-space` CSS variable, Leland (SMuFL)
  glyphs, ledger lines, accidentals, dots, articulations, dynamics,
  lyrics.
- Chords (`NoteStack`), beaming (`BeamContainer`), tuplets, slurs,
  hairpins, ties, two-voice writing (`Voice`), repeats and barline
  types, key/time signatures, tempo marks, clefs (G/F/C), system
  breaking with clef/key restatement, `GrandStaff` (piano) and `Score`
  (multi-part) with onset-grid cross-staff alignment.
- MusicXML 4.0 importer (`react-music-notation/musicxml`):
  score-partwise subset with a warnings report for everything skipped.

### Phases 12–23

- **12** Grace notes (Leland's swapped E561/E562 handled) and voltas.
- **13** Cross-measure/cross-system slurs and ties: `CurveOverlay`
  draws from note-published `data-*` anchors; half-curves at system
  breaks; endpoints lift clear of beams by sampling the bezier.
- **14** Two-voice collision shifts per Gould (unisons/seconds); true
  unisons merge.
- **15** Ottava lines (8va/8vb/15ma/15mb) with `OttavaContext` display
  transposition.
- **16** Interactivity + a11y: per-note aria labels, keyboard focus,
  `onNoteClick`/`onNoteHover`, `selected`, measure group labels.
- **17** Percussion: percussion clef, alternative noteheads (x,
  circle-x, diamond, slash…), unpitched events.
- **18** Guitar tablature: TAB clef, six-line staff, `TabNote` fret
  digits (rhythm-less), standard-notation pairing.
- **19** Cross-staff beaming (piano writing between the hands), with
  per-end stem-side offsets and full-stack stems.
- **20** Sounding pitch vs drawn accidentals: `AccidentalContext`
  (key signature + measure carry, both reconcile directions),
  `soundingAlter`, `midiOf`.
- **21** Playback (`react-music-notation/playback`): score extraction
  from the same React tree (repeats/voltas expanded, ties merged,
  tuplets scaled, graces steal time), WebAudio synth `Instrument`
  interface, `usePlayback` with a score-synced cursor.
- **22** Mid-measure clef changes (render-time `ClefContext`
  providers; correctly sized/registered small clefs derived from font
  metrics).
- **23** Margin-exact beam geometry: per-interval beam segments whose
  math includes accidental/grace/clef margins, so stems always meet
  beams.

### Quality infrastructure (July 2026)

- Unit tests (vitest) for the pure cores: pitch math, sounding pitch,
  onset-grid layout, playback extraction (hand-verified table locked
  as assertions).
- Cross-engine visual regression: Playwright screenshots of every
  story in Chromium/Firefox/WebKit against committed baselines
  (`npm run test:visual`), Windows-local.
- Theming: every mark paints `currentColor`; `--rmn-ink/-paper/-hover/
  -selected/-focus` variables; dark mode works. Staff lines no longer
  vanish behind ancestor backgrounds (`isolation: isolate`).
- Escape hatches: `ref` forwarding + `className`/`style` passthrough
  on `Note`, `NoteStack`, `TabNote`, `Measure`, `Staff`, `GrandStaff`,
  `Score`; `ClefContext`/`OttavaContext`/`mergeRefs` exported.
- Robustness corpus: 12 real-world MusicXML files (Bach, Beethoven,
  Schumann, Mozart, Joplin…) parse + SSR-render on every `npm test`
  with snapshot-stable importer warnings; pure-Node SSR smoke test.
