# Roadmap

## Coverage audit (July 2026)

A systematic pass over the three references — the chapter list of Gould,
*Behind Bars* (`references/`), the MPA *Standard Music Notation Practice*
booklet, and the [MusicXML 4.0 element
reference](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/)
— listing everything the library does **not** yet render. Items overlap
between sources; each appears once, under the source that treats it most
fully.

### From Behind Bars, Part I (general conventions)

- **Ground rules (ch. 1)**: octave clefs (G8vb vocal tenor, 8va/8vb-marked
  clefs), percussion clef, single-line staves, cue-size/small staves,
  whole-bar rest centering (ours left-aligns), multi-measure rests (H-bar
  with count), beam sub-grouping within long groups, stemlets over rests
  inside beams, fanned/accelerando beams, engraving-grade (roughly
  logarithmic) horizontal spacing.
- **Chords, dotted notes, ties (ch. 2)**: ties on individual chord
  noteheads, cross-measure/cross-system ties (half-curves), double dots,
  laissez-vibrer ties.
- **Accidentals & key signatures (ch. 3)**: courtesy/cautionary
  accidentals (parenthesized), cancellation naturals on key changes,
  microtonal accidentals.
- **Dynamics & articulation (ch. 4)**: niente hairpins, dashed hairpins,
  subito markings, dynamic alignment across a system.
- **Grace notes etc. (ch. 5)**: the whole chapter — grace notes,
  arpeggiated chords (wavy line), trills + wavy extension lines, turns,
  mordents, glissandos/slides, vibrato lines.
- **Metre (ch. 6)**: polymetre, metric modulation equations, unmetred
  music/cadenza notation, senza-misura passages.
- **Tuplets (ch. 7)**: nested tuplets, ratio-with-colon and
  numeral-with-note-value displays, tuplets spanning barlines.
- **Repeat signs (ch. 8)**: volta endings (1./2. brackets), D.C./D.S. al
  Fine/Coda, segno & coda signs, single- and two-bar measure-repeat signs
  (%), rhythmic slash notation.

### From Behind Bars, Parts II-III (idiomatic notation & layout)

- **Keyboard (ch. 11)**: cross-staff beaming, pedal lines/markings,
  arpeggio lines spanning both staves, voice-collision offsets (unisons/
  seconds between voices).
- **Vocal (ch. 15)**: melisma extender (underscore) lines, verse numbers
  before the first syllable, elision slurs between syllables, breath marks
  and caesuras, 3+ verses without vertical collision.
- **Percussion (ch. 10)**: unpitched staves, alternative noteheads (x,
  diamond), stem tremolos, rolls.
- **Strings (ch. 14)**: bowing marks (up/down bow), fingering numbers,
  harmonics circles, divisi conventions, pizzicato/arco text handled only
  as generic expression text.
- **Harp/guitar (chs. 12-13)**: pedal diagrams, tablature, chord frames,
  fingering.
- **Score layout (chs. 16-18)**: square instrument-family brackets (we
  draw only the keyboard brace), a grand-staff part inside a `Score`,
  title/composer headers, bar numbering (the `measureNumber` prop is
  currently unrendered), rehearsal marks, cue notes in parts, page/print
  layout.

### From the MusicXML 4.0 element reference (not already listed above)

`<tremolo>`, `<arpeggiate>`/`<non-arpeggiate>`, `<glissando>`/`<slide>`,
`<octave-shift>`, `<pedal>`, `<harp-pedals>`, `<scordatura>`,
`<string-mute>`, `<ending>`, `<segno>`/`<coda>`, `<rehearsal>`,
`<multiple-rest>`, `<breath-mark>`/`<caesura>`, `<fermata>`, `<grace>`,
`<cue>`, lyric `<extend>` and `<elision>`, `<harmony>` (chord symbols),
technical marks (`<hammer-on>`, `<bend>`, ...), `<soft-accent>`, and the
tablature/percussion families. Importer-side only: `.mxl` unzipping,
score-timewise documents, `<transpose>`.

---

Remaining work, split by how much heavy lifting it needs. The first list is
architecture-shaping work worth doing with maximum model capability; the
second is well-scoped follow-the-pattern work a smaller model (or a spare
afternoon) can handle. Grounded against the
[MusicXML 4.0 element reference](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/)
— see the coverage note in the README.

## Heavy lifts (architecture-shaping)

- ~~**MusicXML import**~~ — shipped as `react-music-notation/musicxml`
  (score-partwise → components with a warnings report). Importer coverage
  now grows with the notation roadmap: grace notes, lyrics, voltas, 8va,
  and ornaments below all have MusicXML elements waiting on renderer
  support.
- ~~**Lyrics**~~ — shipped: verse-stacked syllables with hyphenation, slot
  widths fed into the spacing engine, MusicXML `<lyric>` mapped. Still
  open: melisma extender lines, elisions, verse numbers, 3+ verses.
- ~~**Grace notes** (`<grace>`)~~ — shipped: pre-scaled SMuFL grace glyphs
  spaced like accidentals (margin reservation, so the flex/onset model is
  untouched), acciaccatura/appoggiatura variants, MusicXML `<grace>` runs
  collected onto the next host note. Still open: grace-note accidentals,
  beamed grace runs, grace slurs, cue notes (`<cue>`).
- ~~**Volta endings** (`<ending>`)~~ — shipped: per-measure `ending` prop
  with `{ text, open, continues }` composition for multi-measure spans;
  MusicXML start/stop/discontinue mapped. Still open: **segno/coda**
  navigation marks, and voltas restating their label after a system break
  (a continuation line renders, but unlabeled).
- ~~**Cross-measure/system slurs and ties**~~ — shipped: `tie="start"`
  reaches across barlines automatically; `slur={{ start }}`/`{{ end }}`
  markers span measures. A per-staff `CurveOverlay` measures the DOM
  after layout and paints pixel-space curves, splitting into half-curves
  at system breaks and sampling the bezier against every covered
  stem/beam. Still open: ties on chord members, curves anchored to grace
  notes.
- ~~**Voice collision engine**~~ — shipped: unisons/seconds between the
  two voices offset the down-stem note per Gould (paint-only transforms
  on the onset grid; same-value unisons merge visually). Still open:
  collisions inside beamed groups, cross-voice accidental collisions.
- ~~**Collision-aware beam spacing**~~ — shipped: beams render as
  per-interval segments positioned with calc(% + staff-spaces) using the
  exact leading margins (accidentals/graces/clef changes) each note
  gets, so stems meet beams precisely. Still open: the same margin skew
  on onset-grid columns (cross-staff x alignment when one staff carries
  accidentals at a shared onset).
- ~~**Octave shift / 8va**~~ — shipped: the `Ottava` wrapper (8va/8vb/
  15ma/15mb) draws the dashed line + label and re-octaves the staff
  positions beneath it via context; MusicXML `<octave-shift>` maps
  within measures. Still open: octave lines crossing barlines/system
  breaks (would ride the CurveOverlay mechanism).
- ~~**Interactivity + accessibility pack**~~ — shipped: score-level
  `onNoteClick`/`onNoteHover` with `NoteInteractionInfo`, per-note
  `onClick`/`selected`, keyboard activation, hover/selection recoloring
  via `currentColor`, spoken aria-labels on every event, labeled measure
  groups with auto-numbering. Still open: roving-tabindex/arrow-key
  navigation, built-in selection for `MusicXMLScore`, aria-labels
  describing articulations/lyrics.
- ~~**Cross-staff beaming**~~ — shipped: `crossStaff` on notes inside a
  `GrandMeasure` (pitch resolves on the other staff's clef, glyphs shift
  a staff-stride, mixed beam groups share a horizontal beam between the
  staves). Still open: cross-staff chords, MusicXML per-note `<staff>`
  mapping, sloped cross-staff beams.
- ~~**Percussion and tablature** notation families~~ — shipped:
  percussion clef + x/circle-x/diamond/triangle noteheads with separate
  stems (`<unpitched>`/`<notehead>` import), and six-line TAB staves
  with `TabNote` fret numbers (`<string>`/`<fret>` import). Still open:
  single-line percussion staves, slash notation, rolls/tremolos, rhythm
  stems on tab, hammer-on/bend marks.

- ~~**Playback**~~ — shipped as `react-music-notation/playback`:
  `extractPlaybackScore` (tempo/repeats/voltas/ties/tuplets/graces/keys/
  tab/percussion → timed events) + `usePlayback` on a dependency-free
  Web Audio synth with an `Instrument` swap point and `onEvent` cursor
  callbacks. Built on Phase 20's sounding-pitch model. Still open:
  pause/seek, velocity from dynamics, MIDI file export on top of the
  same extraction, richer default instrument.

## Fable-tier — do these while Fable is available

Ordered by (risk × geometry complexity). Everything else in this file
follows established patterns; these don't.

1. **Onset-grid column margin skew** — the last known core geometry
   defect. When staves share an onset grid and one staff carries
   accidentals/graces at a shared onset, that staff's noteheads shift
   right inside their grid column while the other staff's don't, so
   simultaneous notes disagree in x. The fix is the grid-column
   analogue of Phase 23's margin-exact beams (union the margins into
   the column template or compensate per cell) and touches
   `layout.tsx`'s grid math — the most invariant-dense file in the
   repo.
2. **Ties on chord noteheads** — the importer skips them today and 4 of
   the 12 corpus files hit the warning, so it's the most common
   real-world gap. Needs per-notehead anchors from `NoteStack`
   published to `CurveOverlay` (today ties anchor per event), plus
   Gould's rules for tie stacking/direction in chords.
3. **Collisions inside beamed groups** (down-stem voice) — deferred
   from Phase 14 because sideways-shifting a beamed head must not
   detach it from Phase 23's margin-exact stem/beam math; solve them
   together or not at all.

## Post-Fable friendly (well-scoped, follow existing patterns)

- **Richer default instrument** — the built-in synth is confirmed
  accurate (pitch/tempo) but plinky. Better envelope + a couple of
  detuned oscillators + a gentle lowpass gets to "soft piano-ish";
  document the `Instrument` interface recipe for soundfont users.
  All contained in `src/playback/instrument.ts`.
- **Instrument-name polish** — `Score` already renders `partNames` in a
  first-system gutter; still missing: abbreviated names on later
  systems (Vln., Vc.), a name/label for `GrandStaff`, and
  instrument-family brackets.

- **TSDoc/JSDoc prop documentation** — doc comments on all exported
  components/props/types so IDE hover tooltips explain the API (in progress).
- **Storybook-as-wiki reorganization** — component stories currently
  auto-title under a "stories/" folder; retitle into deliberate sidebar
  categories (e.g. Notes / Measure Meta / Wrappers / Layout / MusicXML /
  Demos), add MDX doc pages per feature, and enable autodocs so the
  published Storybook (GitHub Pages) reads as the project wiki. Every
  feature/symbol should have its own story: Note, NoteStack, graces,
  lyrics, Voice, Slur, Tuplet, Hairpin, Barline, Clef, Key/TimeSignature,
  Tempo, Volta, Staff, GrandStaff, Score, MusicXMLScore.
- **Simple glyph placements** in the established articulation pattern:
  fermata, breath mark, caesura, `strong-accent`/`soft-accent`/
  `detached-legato` variants.
- **Rehearsal marks** (boxed letters above the staff) and simple text
  directions — same pattern as the tempo mark.
- **Segno/coda glyphs** as static marks (without playback-order semantics).
- **64th notes** — mechanical: glyphs, flex 0.25, fourth beam level.
- **Tremolo slashes** (`<tremolo>`) on stems; **arpeggiate** wavy line
  before chords.
- **Multi-measure rests** (`<multiple-rest>`) — H-bar with a count.
- **Courtesy accidentals/naturals** — a `courtesy` flag rendering
  parenthesized accidentals; naturals on key changes.
- **More barline types** (dashed, heavy-heavy, tick) from the MusicXML
  bar-style list.
- **Unit tests** for the pure helpers (derivePosition, beamCreator,
  onset boundaries, getLedgerLines, getArticulationIndex).
- **README screenshots** — capture the phase demos and embed in the README
  for GitHub browsing.
- **Storybook autodocs** pages and richer controls.
- **Publishing chores** — CHANGELOG, version bumps, npm publish, enabling
  GitHub Pages.
