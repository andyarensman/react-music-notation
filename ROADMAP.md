# Roadmap

Remaining work, split by how much heavy lifting it needs. The first list is
architecture-shaping work worth doing with maximum model capability; the
second is well-scoped follow-the-pattern work a smaller model (or a spare
afternoon) can handle. Grounded against the
[MusicXML 4.0 element reference](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/)
— see the coverage note in the README.

## Heavy lifts (architecture-shaping)

- **MusicXML import** — parse `.musicxml`/`.mxl` into the component tree.
  The biggest adoption lever; touches every feature and forces API
  completeness. Needs tuplet/slur/tie coverage (done) plus grace notes and
  voltas to represent real files faithfully.
- **Lyrics** (`<lyric>`) — verse text under notes interacts with the
  spacing engine (syllable widths can exceed note widths) and with
  multi-verse alignment.
- **Grace notes** (`<grace>`) and cue notes (`<cue>`) — zero-duration events
  break the duration-proportional flex model's core assumption; need their
  own width treatment inside the onset grid.
- **Volta endings** (`<ending>`), **segno/coda** navigation — need
  system-layout awareness (brackets spanning measures, possibly across
  breaks).
- **Cross-measure/system slurs and ties** — half-curves at system breaks;
  requires plumbing system-position knowledge into the curve renderers.
- **Voice collision engine** — offsetting unisons/seconds between voices,
  and more generally collision-aware horizontal spacing (accidentals inside
  beams currently shift stems slightly off the beam math).
- **Octave shift / 8va** (`<octave-shift>`) — dashed bracket + changing the
  pitch-to-position mapping under it.
- **Interactivity + accessibility pack** — onNoteClick/hover/selection
  passthrough, ARIA labels per note/measure, keyboard focus. The
  differentiator versus canvas engraving engines.
- **Cross-staff beaming** (piano writing between the hands).
- **Percussion and tablature** notation families.

## Post-Fable friendly (well-scoped, follow existing patterns)

- **TSDoc/JSDoc prop documentation** — doc comments on all exported
  components/props/types so IDE hover tooltips explain the API (in progress).
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
