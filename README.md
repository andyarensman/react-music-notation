# React Music Notation

React components for rendering Western music notation (sheet music) in the browser. A score is composed the way you'd compose any other UI — `<Staff><Measure><Note /></Measure></Staff>` — instead of being handed to a canvas or SVG engraving engine. Layout is built entirely from CSS flex and grid (not fixed engraving coordinates), so notation reflows and wraps like other web content, and the whole thing scales from a single `--staff-space` CSS custom property. Glyphs come from the [Leland](https://github.com/MuseScoreFonts/Leland) SMuFL music font. The data model (pitches as `{ step, octave }`, key signatures as `fifths`, time signatures as `beat`/`beatType`) is loosely inspired by MusicXML vocabulary, though this library only renders notation — it doesn't read or write MusicXML.

The package is publish-ready (library build, bundled types, single stylesheet with the font inlined) but not yet on npm — see [Installing](#installing).

## Status

The project is built in phases; each completed phase has a kitchen-sink story under **Demo** in Storybook (`Demo/Phase 1` through `Demo/Phase 4`).

**Phase 1 (MVP)**

- Single staff, single voice
- G, F, and C clefs; key signatures -7..7 placed per clef; numeric and common/cut time signatures
- Note values whole through 16th, rests, dotted notes, accidentals
- Ledger lines up to two above/below the staff
- Beaming for uniform groups of 8ths or 16ths (explicit `BeamContainer` wrapping)
- Sizing via `--staff-space` and responsive measure wrapping via flex

**Phase 2**

- Chords via `NoteStack`: shared stem sized to the outer noteheads, seconds flipped across the stem, accidentals stacked into non-colliding columns, standalone flag glyphs for unbeamed 8th/16th chords, beamable
- Pitch → position derivation: notes can take `pitch={{ step, octave }}` instead of `position`; the measure's clef (provided via context, carried across measures by `Staff`) determines placement
- Accidentals reserve horizontal space instead of overlapping the previous note
- Barline types on `Measure`: regular, double, final, repeat end, plus `startRepeat` for the left side
- Mixed beam groups: 8ths and 16ths share a primary beam; 16th runs get a secondary beam segment and lone 16ths get a partial stub (dotted-8th + 16th works)

**Phase 3**

- Grand staff (piano-style): `GrandStaff` + `GrandMeasure` stack a treble and bass measure with a brace and barlines spanning both staves; grand measures wrap together as a unit
- Onset-grid alignment: each grand measure lays both staves on a shared CSS grid whose columns are the union of both staves' note onsets, so notes that sound together sit at the same x even when the hands have different rhythms (see `layout.tsx`)
- Minimum note spacing so dense rhythms can't crush together (beam groups reserve their minimum as a unit to keep stem positions exactly flex-proportional)

**Phase 4**

- Two voices per staff via `Voice`: stems forced per voice (up/down), events laid on the measure's shared onset grid so voices align with each other and (in a grand measure) with the other staff; beams inherit the voice's stem direction; rests default high in the up voice and low in the down voice
- Ties: `tie="start"`/`"stop"` on `Note` draws a filled lens curve to the next note. Direction is opposite the stem for single-voice music; inside a `Voice` the tie curves toward the voice's outer side (standard multi-voice rule); `tieDirection` overrides either

**Phase 5**

- Real system layout: `Staff` and `GrandStaff` break measures into systems (lines) from the measured container width (`ResizeObserver` + estimated measure widths in `systemLayout.tsx`) instead of blind `flex-wrap`
- Every system restates the running clef and key signature (time signatures are correctly not restated); the running clef/key track mid-piece changes
- Every grand system gets its own brace
- A mostly-empty final system keeps its natural width instead of justifying (`LOOSE_SYSTEM_THRESHOLD`)

**Phase 6**

- 32nd notes: note/rest/flag glyphs, triple beams, and mixed 8th/16th/32nd
  groups with per-level beam segments and partial stubs
- Articulations (`articulation` on `Note`/`NoteStack`): staccato, tenuto,
  accent, staccatissimo, marcato, and the combined forms — placed per Gould
  ("Behind Bars", pp. 115-121, see `references/`): notehead side by default,
  staccato/tenuto centred in the nearest clear stave-space, accents/wedges
  outside the staff, marcato above regardless of stem direction, and inside
  a `Voice` at the stem end (the double-stemmed rule)
- Dynamics (`dynamic` on `Note`/`NoteStack`/rests): pp through ff, fp, sf,
  sfz, rf, rfz — rendered below the staff at the event's position, dropping
  lower when a below-side articulation needs the space

**Phase 7**

- npm packaging: components moved to `src/components/` with a public API in
  `src/index.ts`; Vite library build producing ESM + CJS bundles, a full
  `.d.ts` tree, and one `dist/style.css` with the Leland font inlined as a
  data URI (no asset-path issues inside `node_modules`); MIT license with
  the font's OFL notice; verified by installing the `npm pack` tarball into
  a separate Vite app and rendering a grand-staff score
- CI (typecheck + library build + Storybook build) and a Storybook →
  GitHub Pages deploy workflow

**Phase 8 (the "real music" pack)**

- Tuplets: `<Tuplet ratio={[3, 2]}>` scales its children's durations and
  draws the bracket-and-number (above by default, below via `position` or a
  down-voice); beamed and bracketed forms both work
- Slurs: `<Slur>` wraps a contiguous run of events and draws the curve from
  the first to the last notehead — below when every stem points up, above
  otherwise (including over up-stemmed beam groups, where it clears the stem
  tips); `direction` overrides, and voices push slurs to their outer side
- Hairpins: `<Hairpin type="crescendo" | "diminuendo">` draws the wedge at
  dynamics height under the wrapped events
- Tempo marks (`tempo` on `Measure`): text and/or a metronome equation
  (♩ = 120, SMuFL metronome glyphs) above the staff; expression text
  (`text` on `Note`/`NoteStack`) in italics on the dynamics line
- Slur/hairpin wrappers are transparent to the onset grid (their inner notes
  still align across staves); tuplets stay opaque

**Phase 9**

- Multi-instrument scores: `Score` + `ScoreMeasure` stack any number of
  parts per measure — all parts share the union onset grid so different
  rhythms align vertically across every staff, one barline spans from the
  top staff to the bottom, each system starts with a systemic barline, and
  each part's running clef/key restates per system
- Part names (`partNames` on `Score`) in a left gutter on the first system
- Slur/beam clearance and tuplet bracket extents fixed against Gould
  (pp. 195, "Length of brackets"; slurs remain outside beams)

**Phase 10**

- MusicXML import as a subpath export (`react-music-notation/musicxml`,
  zero extra cost to consumers who don't use it): `parseMusicXML(xml)` and a
  `<MusicXMLScore xml={...}/>` component map score-partwise documents onto
  the component tree — keys/times/clefs, notes/rests/chords, voices, beams,
  tuplets (time-modification), slurs, ties, articulations, dynamics, wedges,
  tempo/words, barlines/repeats; one part → `Staff`, a two-staff part →
  `GrandStaff`, multiple parts → `Score` with part names
- Graceful degradation: unsupported elements (ornaments, fermata, ...)
  are skipped and reported through `onWarnings`

**Phase 11**

- Lyrics (`lyrics` on `Note`/`NoteStack`): syllables in roman serif centered
  under their noteheads, one line per verse; hyphens drawn between the parts
  of split words (`syllabic: "begin" | "middle" | "end"`); long syllables
  widen their note's slot (a CSS min-width floor that also feeds the
  system-breaking estimates, and yields inside beam groups so beam geometry
  stays exact)
- MusicXML `<lyric>` elements import (number/syllabic/text; `<extend>`
  melisma lines reported as skipped)

**Phase 12**

- Grace notes (`grace` on `Note`/`NoteStack`): small pre-scaled SMuFL
  grace glyphs drawn before the host note (and before its accidentals),
  spaced like accidentals so beam geometry is untouched; `slash: true`
  for acciaccaturas, plain for appoggiaturas; width feeds the
  system-breaking estimates
- Volta endings (`ending` on `Measure`): first/second-ending brackets
  above the staff — a label string (`ending="1."`) draws a closed
  bracket, `{ text, open, continues }` composes open hooks
  (`"discontinue"`) and multi-measure spans
- MusicXML: `<grace>` (with `slash`) collects runs of grace notes onto
  the next host note; `<ending>` start/stop/discontinue maps across
  measures onto the `ending` prop

**Phase 13**

- Slurs and ties across barlines and system breaks: `tie="start"` reaches
  the next note wherever it lives; `slur={{ start }}` / `slur={{ end }}`
  markers draw slurs between notes in different measures. At a system
  break the curve splits into outgoing/incoming half-curves (Gould); the
  drawing happens in a per-staff pixel-space overlay (`CurveOverlay`)
  that measures the DOM after layout, so it survives resizes and system
  re-breaking, works inside `GrandStaff`/`Score` (per-staff pairing), and
  respects voices
- Curves clear every covered stem and beam: the bezier is sampled against
  each obstacle and endpoints lift above a beam that runs to the end of
  the span
- MusicXML: cross-measure `<slur>` boundaries become marker props (the
  `number` attribute is the pairing id); `<tie>` start/stop already mapped

**Phase 14**

- Two-voice collision handling (Gould, "Two voices on one stave"):
  simultaneous notes a second apart or in unison offset the down-stem
  voice's note to the right — paint-only transforms on the onset grid,
  so cross-staff alignment holds. Same-value unisons stay superimposed
  (they read as the engravers' shared notehead); mixed values, wholes,
  and chords separate; dotted up-voice notes widen the shift to clear
  the dot. Applies automatically to two-voice MusicXML imports.

**Still out**: grace-note accidentals and beamed/slurred grace-note runs, D.S./D.C./segno/coda navigation marks, cross-staff beaming, collisions inside beamed groups between voices, ties on chord members, nested tuplets, 64th+ notes, automatic beam grouping from the time signature, courtesy naturals on key changes, bracketed instrument-family groups in scores, a grand-staff part inside a `Score`, melisma extender lines and elisions, verse numbers, 3+ lyric verses (they overflow toward the next system), `.mxl` unzipping (pass the contained XML string yourself), MusicXML export, MIDI, playback, and print layout. See `ROADMAP.md` for the full coverage audit against Behind Bars and the MusicXML element reference.

**MusicXML coverage roadmap** — auditing the [MusicXML 4.0 element reference](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/) against what renders today, the notable visual-notation elements still missing are: ornaments (`trill-mark`, `turn`/`inverted-turn`, `mordent`/`inverted-mordent`, `wavy-line`), `cue` notes, `fermata`, `breath-mark`/`caesura`, `tremolo`, `arpeggiate`, `glissando`/`slide`, `octave-shift` (8va), `pedal`, `segno`/`coda`, `rehearsal` marks, `multiple-rest` (multi-measure rests), harmony/chord symbols, tablature, and percussion notation. These are the candidate pool for future phases.

## Installing

The package is not published to npm yet; publishing is a deliberate manual step (`npm publish` from a logged-in account — `prepublishOnly` rebuilds `dist/` automatically). Once published:

```
npm install react-music-notation
```

```tsx
import { Staff, Measure, Note } from "react-music-notation";
import "react-music-notation/styles.css"; // staff styles + the Leland font

const Melody = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
    </Measure>
  </Staff>
);
```

React 18 is a peer dependency. Until it's published, `npm pack` in this repo produces an installable tarball.

## Getting started (development)

```
npm install
npm run storybook
```

Storybook runs at `http://localhost:6006`. The phase kitchen-sink demos live under **Demo**; individual component stories (Note, NoteStack, Measure, Staff, GrandStaff, Voice, Barline, Clef, KeySignature, TimeSignature, StaffLines) are grouped by component name. Components live in `src/components/`, their stories in `src/stories/`. Pushes to `main` deploy the Storybook to GitHub Pages (once Pages is enabled for the repo) and run CI.

## Usage

The examples below are trimmed from the actual `Demo*.stories.tsx` files and use the real prop types (`src/helpers/types.ts`).

### A single measure

```tsx
<Staff>
  <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
    <Note position="line-4" noteValue="quarter" dotted={1} />
    <Note position="space-3" noteValue="eighth" />
  </Measure>
</Staff>
```

`Measure` accepts `clef` (`"gClef" | "fClef" | "cClef"`), `fifths` (a `KeyRange`, `-7`..`7`; positive draws sharps, negative flats), and `time` (either `{ beat, beatType }` or `{ timeSymbol: "common" | "cut" }`). `position` is one of the 17 `PitchPosition` strings (`"line-above-2"` … `"line-3"` (middle line) … `"line-below-2"`).

### Pitches instead of positions

A `Note` can take `pitch={{ step, octave }}` instead of an explicit `position`. The measure's clef — provided through `ClefContext` and carried across measures that don't restate it by `Staff` — determines where the pitch lands (`derivePosition` in `helpers.ts`). Explicit `position` always wins if both are given; if neither is given, the note falls back to the middle line.

```tsx
<Measure clef="gClef">
  <Note pitch={{ step: "G", alter: "sharp", octave: 5 }} noteValue="quarter" />
</Measure>
```

### Chords (`NoteStack`)

```tsx
<NoteStack
  noteValue="quarter"
  pitches={[
    { pitch: { step: "C", octave: 3, alter: "sharp" } },
    { pitch: { step: "D", octave: 3, alter: "flat" } },
  ]}
/>
```

`pitches` is an array of `StackedNote` (`{ pitch }` or `{ position }`). `NoteStack` derives one shared stem sized to the outer noteheads, flips seconds to the far side of the stem, and stacks accidentals into non-overlapping columns (`assignAccidentalColumns` in `helpers.ts`). Whole-note chords render stemless; other values pick a stem direction from the notehead farthest from the middle line unless `stem` is passed explicitly. Unbeamed 8th/16th chords get a standalone flag glyph (chords don't have flags built into their notehead glyph the way single notes do).

### Beams (`BeamContainer`)

```tsx
<BeamContainer stem="upStem">
  <Note position="space-2" noteValue="eighth" />
  <Note position="line-2" noteValue="eighth" />
  <Note position="space-1" noteValue="eighth" />
  <Note position="line-1" noteValue="eighth" />
</BeamContainer>
```

`BeamContainer` takes a `stem` (`"upStem" | "downStem"`, default `"upStem"`) and two or more `Note`/`NoteStack` children; it overrides each child's `stem` to `"noStem"` and injects a computed `stemEndValue`. Mixed 8th/16th groups share a primary beam, with 16th runs getting a secondary beam segment:

```tsx
<BeamContainer stem="upStem">
  <Note pitch={{ step: "E", octave: 4 }} noteValue="eighth" dotted={1} />
  <Note pitch={{ step: "F", octave: 4 }} noteValue="16th" />
</BeamContainer>
```

`NoteStack` chords can appear inside a `BeamContainer` too — see [Beaming](#beaming) for how the anchor notehead is chosen.

### Dotted notes and ties

```tsx
<Note position="line-4" noteValue="quarter" dotted={1} />

<Note pitch={{ step: "G", octave: 5 }} noteValue="half" tie="start" />
<Note pitch={{ step: "G", octave: 5 }} noteValue="half" tie="stop" />
```

`dotted?: 1` adds an augmentation dot (and 50% more flex-grow — see [Layout engine](#layout-engine)). `tie="start"` draws a curve from that note to the next note in the same measure; the receiving note should be marked `tie="stop"`. Direction defaults to opposite the stem, or `tieDirection="above" | "below"` to override — `Voice` sets this automatically so ties curve toward the voice's outer side.

### Articulations and dynamics

```tsx
<Note
  pitch={{ step: "E", octave: 5 }}
  noteValue="quarter"
  articulation="accent"
  dynamic="f"
/>
```

`articulation` (also on `NoteStack`) is an `ArticulationType` — `"accent" | "staccato" | "tenuto" | "staccatissimo" | "marcato"` plus the combined `"marcatoStaccato" | "accentStaccato" | "tenutoStaccato" | "accentTenuto"`. Placement follows Gould ("Behind Bars", pp. 115-121; the PDFs in `references/` are the source of truth here):

- Marks go on the notehead side (opposite the stem), using the SMuFL above/below glyph variants; stemless notes are treated as if stemmed.
- Staccato and tenuto marks are centred in a stave-space — the adjacent space for a note in a space, the next *clear* space for a note on a line (`getArticulationIndex` in `helpers.ts`).
- Accents and wedges clamp to outside the staff, where they're most conspicuous; marcato goes above the staff regardless of stem direction.
- Inside a `Voice`, articulation moves to the stem end (never the notehead side, per the double-stemmed rule) — `Voice` injects `articulationPlacement`, which is also user-overridable.

`dynamic` is a `DynamicType` (`"pp"` … `"ff"`, `"fp"`, `"sf"`, `"sfz"`, `"rf"`, `"rfz"`) rendered below the staff at the event's position (dropping lower when a below-side articulation needs the room); rests can carry one too.

### Tuplets, slurs, hairpins, tempo

```tsx
<Measure
  clef="gClef"
  time={{ beat: 4, beatType: 4 }}
  tempo={{ text: "Allegro", beatUnit: "quarter", bpm: 120 }}
>
  <Slur>
    <BeamContainer>
      <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
      <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
    </BeamContainer>
    <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
  </Slur>
  <Tuplet ratio={[3, 2]}>
    <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
    <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
    <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
  </Tuplet>
</Measure>
```

`Tuplet`, `Slur`, and `Hairpin` all wrap a contiguous run of events and can nest beam groups. A tuplet's `ratio={[actual, normal]}` scales its children's durations (three-in-the-time-of-two = each note at ⅔ width), so the measure's flex math and the onset grid keep working. Inside a `Voice`, all three inherit the voice's stem direction and outer side.

### Slurs and ties across barlines and system breaks

```tsx
<Staff>
  <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
    <Note pitch={{ step: "F", octave: 5 }} noteValue="half" slur={{ start: true }} />
    <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="start" />
  </Measure>
  <Measure barline="final">
    <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="stop" />
    <Note pitch={{ step: "E", octave: 5 }} noteValue="half" slur={{ end: true }} />
  </Measure>
</Staff>
```

The `Slur` wrapper can't cross a barline (its children live in one measure), so cross-measure slurs use marker props instead: `slur={{ start }}` on the first note, `slur={{ end }}` on the last (string ids pair concurrent slurs; `direction` overrides the side). A `tie="start"` whose next note sits in a following measure automatically reaches across. The enclosing `Staff`/`GrandStaff`/`Score` draws these curves in a pixel-space overlay after layout — and when the endpoints land on different systems, the curve splits at the break into an outgoing half-curve (to the system's right edge) and an incoming one leading into the destination note, with a full-width segment across any middle systems. The curves stay clear of every stem and beam they cover (the endpoint lifts above a beam that runs to the end of the span, per Gould), and everything repaints on resize as systems re-break.

### Lyrics

```tsx
<Note
  pitch={{ step: "E", octave: 4 }}
  noteValue="quarter"
  lyrics={[{ text: "Sing", syllabic: "begin" }, "Voice"]}
/>
```

`lyrics` (also on `NoteStack`) takes one entry per verse: a plain string for a whole word, or `{ text, syllabic }` where `syllabic: "begin" | "middle"` draws a hyphen toward the next syllable. Syllables center under the notehead; a long syllable raises its note's minimum slot width so neighboring verses never collide (the same estimate feeds system breaking). Two verses fit comfortably; more will crowd the next system.

### Grace notes

```tsx
<Note
  pitch={{ step: "E", octave: 5 }}
  noteValue="quarter"
  grace={[{ pitch: { step: "D", octave: 5 }, slash: true }]}
/>
```

`grace` (also on `NoteStack`) takes an array of small notes drawn before the host note, in order. Each entry is a `GraceNote`: a `pitch` (or explicit `position`) plus `slash: true` for an acciaccatura (slashed, "crushed") or omitted for an appoggiatura. Graces reserve margin the same way accidentals do — before the accidental block when both are present — so they never disturb beam geometry or onset alignment. Grace-note accidentals and beamed grace-note runs are not drawn yet.

### Rests

```tsx
<Note rest noteValue="quarter" dotted={1} />
```

`rest: true` drops `pitch`, `stem`, `stemEndValue`, and `tie` from the prop type (`RestProps` in `types.ts`); `position` can still be set explicitly to move the rest off the default line.

### Clefs, key signatures, time signatures, barlines

All four are props on `Measure`, plus `startRepeat` for a left-side repeat barline:

```tsx
<Measure
  clef="fClef"
  fifths={-3}
  time={{ beat: 4, beatType: 4 }}
  startRepeat
  barline="repeatEnd"
>
  {/* ... */}
</Measure>
```

`barline` is a `BarlineType`: `"regular" | "double" | "final" | "repeatStart" | "repeatEnd"` (default `"regular"`), rendered at the measure's right edge. `startRepeat` renders a `repeatStart` barline at the left edge instead of taking a `BarlineType` value itself.

### Volta (first/second) endings

```tsx
<Measure ending="1." barline="repeatEnd">{/* first time */}</Measure>
<Measure ending={{ text: "2.", open: true }}>{/* second time */}</Measure>
```

`ending` draws a volta bracket above the measure. A plain string draws a closed bracket (label at the left hook, a downward hook at the right — the usual first ending into a repeat barline). The object form composes the other shapes: `open: true` omits the right hook (conventional for a final ending), and `continues: true` draws just the horizontal line for the middle/end measures of a bracket that spans several measures (put the `text` only on the first one). The bracket spans the full measure width.

### `Staff`: wrapping measures with a running clef

```tsx
<Staff>
  <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>{/* ... */}</Measure>
  <Measure>{/* clef inherited from the previous measure */}</Measure>
</Staff>
```

`Staff` breaks its measures into systems (lines) from the measured container width: each system is a justified flex row, and the first measure of every system after the first restates the running clef and key signature (time signatures are not restated, per convention). The running clef/key also drive pitch derivation, so a measure that doesn't declare its own `clef` inherits whatever was last declared — including across a mid-piece clef change. A mostly-empty final system keeps its natural width instead of stretching its measures. Line breaking uses estimated measure widths (`systemLayout.tsx`), not DOM measurement of the notes, so a very dense measure can occasionally overflow its estimate.

### `GrandStaff` / `GrandMeasure`: piano-style layout

```tsx
<GrandStaff>
  <GrandMeasure
    upper={
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        {/* ... */}
      </Measure>
    }
    lower={
      <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "C", octave: 3 } },
            { pitch: { step: "G", octave: 3 } },
          ]}
        />
      </Measure>
    }
  />
</GrandStaff>
```

`GrandMeasure` takes `upper`/`lower` (each a `<Measure>` element), plus `barline` and `startRepeat` applied across both staves. `GrandStaff` draws the brace and tracks a running clef per staff, the same way `Staff` does for one. See [Grand staff](#grand-staff) for the layout and known limitations.

### `Score` / `ScoreMeasure`: multi-instrument systems

```tsx
<Score partNames={["Violin", "Cello"]}>
  <ScoreMeasure
    parts={[
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>{/* ... */}</Measure>,
      <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>{/* ... */}</Measure>,
    ]}
  />
</Score>
```

`ScoreMeasure` takes one `Measure` per part (top staff first) plus `barline`/`startRepeat` applied across all staves. `Score` breaks measures into systems like `Staff`/`GrandStaff` do, draws a systemic barline at each system's start, tracks running clef/key per part, and renders `partNames` in a left gutter on the first system. All parts of a measure share the union onset grid, so simultaneous notes align across every staff.

### MusicXML import

```tsx
import { MusicXMLScore, parseMusicXML } from "react-music-notation/musicxml";

<MusicXMLScore xml={xmlString} onWarnings={(w) => console.log(w)} />;

// or, for the element + warnings directly:
const { element, warnings } = parseMusicXML(xmlString);
```

The importer accepts score-partwise MusicXML as a string (unzip `.mxl` files yourself and pass the contained document) and renders the subset this library supports, skipping the rest with a warnings report. Durations come from each note's `<type>`/`<dot>`/`<time-modification>`; `<backup>`/`<forward>` cursors are not needed because voices are reconstructed from `<voice>` numbers.

### `Voice`: two voices per staff

```tsx
<Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
  <Voice stem="upStem">
    <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
    <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
  </Voice>
  <Voice stem="downStem">
    <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
    <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
  </Voice>
</Measure>
```

`Voice` forces `stem` onto every child that doesn't set its own, defaults rests to `"space-4"` (up voice) or `"space-1"` (down voice) when the rest doesn't set an explicit `position`, and defaults `tieDirection` to the voice's outer side. Voices in the same measure — and, inside a grand measure, across both staves — lay their events out on a shared onset grid so simultaneous notes line up (see [Layout engine](#layout-engine)).

Colliding simultaneous notes are offset automatically per Gould's two-voice rules: when the voices sound a second apart or in unison, the down-stem voice's note shifts right of the up-stem note (a paint-only transform, so the onset grid and cross-staff alignment are untouched). A unison of two single notes with the same value and dotting is left superimposed — the merged heads with both stems read as the shared notehead engravers use. Wholes and mixed-value unisons always separate; a dotted up-voice note widens the shift to clear its dot. Not yet handled: colliding notes *inside a beamed group* of the down-stem voice (shifting one head would detach it from the beam's geometry), and accidental collisions between voices.

## Sizing system

All sizing is driven by two CSS custom properties declared in `src/global.css`:

- **`--staff-space`** (default `8px`) — the distance from the center of one staff line to the center of the next. This is the master knob.
- **`--staff-line-thickness`** (default `1px`) — staff lines, ledger lines, and barlines. Kept separate from `--staff-space` because hairlines shouldn't scale linearly at small sizes; bump it manually for very large staves.

Override `--staff-space` on any container to scale all notation inside it as a unit (see the `staffSpace` control on the Demo stories).

### Derivation

- **Font size**: the Leland glyphs are sized by setting `font-size` on the `.leland` class. Font size is `4 * --staff-space` — at the default `8px` staff-space that's a `32px` font.
- **Notehead height**: divide the font size by 8. At `32px` that's `4px` — a quarter-note notehead is 4px tall at the default size. Because pixel heights shouldn't be cut in half, this originally constrained supported sizes to font sizes that are multiples of 8 (notehead-height : font-size pairs `2:16`, `3:24`, `4:32`, `5:40`, `6:48`, …); the `--staff-space` system generalizes this but the same "keep it a whole/half pixel" logic still applies (see "Crisp sizes" below).
- **Staff line spacing**: double the notehead size to get one full staff-space (`8px` at the default size). Split that between the line thickness (`--staff-line-thickness`, `1px`) and the gap between lines, so the gap is `staff-space - line-thickness` (`7px` by default). Each pitch-position step (line-to-space or space-to-line) is `staff-space / 2`.
- **Glyph line box**: the Leland font's actual em-box is much taller than the nominal font size — `129px` tall at a `32px` font size, i.e. `16.125 * --staff-space`. This is used as vertical cushioning around the five staff lines.
- **Staff margin**: the total height of the five staff lines is `4 * (staff-space - line-thickness) + 5 * line-thickness` (`33px` at the default size — four gaps plus five hairlines). Subtracting that from the `16.125 * staff-space` glyph line box and halving it gives the top/bottom margin around `.staff`: `(12.125 * staff-space - line-thickness) / 2` (`48px` at the default size).

Sizes that keep these derived values on whole or half pixels (`--staff-space` of `6, 8, 10, 12, 16`, …) render crispest; other values still work but can blur on sub-pixel boundaries.

The stem/beam SVGs use `viewBox="0 0 100 129"` with `preserveAspectRatio="none"`, so the `StemPositions`/`BeamPositions` tables in `helpers.ts` are resolution-independent viewBox coordinates (1 staff-space = 8 units) and never need to change with sizing — the SVG is stretched to the real rendered size. Stems use `vector-effect: non-scaling-stroke` with a CSS `stroke-width` of `0.15 * --staff-space`; without that, the non-uniform viewBox stretch would make stem thickness vary with measure width.

The C-clef centering issue noted in earlier development has been resolved and verified against screenshots at multiple sizes — the clef's center notch sits on the middle line.

## Layout engine

Horizontal spacing is duration-proportional, not fixed-width: every note/rest gets `flexGrow` equal to its `noteValue`'s relative duration (`getNoteFlex` in `helpers.ts` — whole = 16, half = 8, quarter = 4, eighth = 2, 16th = 1), and a dot multiplies that by 1.5. Because every note has `flex-basis: 0`, horizontal position within a measure is exactly proportional to cumulative flex-grow — there's no absolute positioning or DOM measurement involved.

### The onset grid

`GrandMeasure` and `Voice` need something stronger than plain flex: notes on different staves (or in different voices) that sound at the same instant must land at the same x position even though the two lines of music may subdivide the beat differently. `layout.tsx` solves this with an onset grid:

- Each event's duration converts to flex units (`getEventFlex`; a `BeamContainer`'s duration is the sum of its children's).
- `getOnsetBoundaries` walks a measure's children and produces the cumulative onset (in flex units) at which each event starts — the boundaries array.
- For a grand measure, `unionBoundaries` merges both staves' boundary arrays; for a measure with `Voice` layers, boundaries are the union of each voice's own boundaries.
- `gridTemplateFromBoundaries` turns consecutive boundary deltas into CSS grid `fr` track sizes for a `display: grid` container.
- `placeEventsOnGrid` wraps each event in a `.grid-event` `<div>` spanning the grid columns between its start and end onset. The wrapper itself is a flex row, so the event's own `flex-grow` fills it exactly as it would in an ungridded measure.

This works because CSS grid `fr` columns are proportional exactly like `flex-grow` with `flex-basis: 0` — all the beam geometry (stem interpolation, secondary beam segments) keeps working unchanged inside a column span, since a beam group's internal notes are still flex-proportional within their grid cell. A beam group therefore lines up with the outer grid automatically without any special-casing.

### Minimum note spacing

Dense rhythms (a run of 16ths) could otherwise crush together at small sizes. `BeamContainer` reserves `min-width: calc(var(--staff-space) * 2.2 * <note count>)` on the whole group, so beam groups keep a minimum width as a unit — this preserves exact flex-proportional stem positions inside the group (since the group still flex-grows and lays its children out by ratio) rather than giving individual notes independent minimum widths, which would break the proportionality the beam-angle math depends on.

## Beaming

Textbook engraving rules this implementation targets:

- When a note is in a space, the stem length is 3½ staff-spaces; on a line, it's shortened to 3¼ staff-spaces.
- Beam angles usually cross no more than one staff line.
- The outer notes of the group determine the beam direction and angle.
- The beam is horizontal when the group begins and ends on the same note, when there's a repeated pattern of pitches, or when an inner note is closer to the beam than either outer note (concave groups are horizontal; convex groups are sloped).

### Implemented algorithm

`beamCreator.ts` decides the beam line; `BeamContainer` renders it and sets each stem:

1. Look up each note's standard beam position (`BeamPositions`, a standard-length stem away from the notehead).
2. The note closest to the beam is the anchor — its stem stays standard length; every other stem gets longer (never shorter).
3. If that closest note is an inner note (a concave group), or the outer notes match, the beam is horizontal at the anchor.
4. Otherwise the beam slopes from the anchor toward the other outer note, with the rise clamped to one staff-space (`MAX_BEAM_SLANT` in `beamCreator.ts`) since beams shouldn't cross more than one staff line. This clamp is what fixed an earlier "inner notes too short" problem, where steep intervals could drag the beam through the middle of the group.
5. Inner stem heights are plain linear interpolation between the beam ends. Because every note is `flex-basis: 0`, horizontal positions are exactly proportional to flex-grow values, so the interpolation ratio is `prefixFlex / beamSpanFlex` — no trigonometry, no `ResizeObserver`, no measuring the DOM.
6. Secondary beams (16ths get a second, 32nds a third) each sit a further three-quarters of a staff-space toward the noteheads: for each beam level, runs of consecutive notes carrying that level share one segment, and an isolated note gets a partial stub half its own width, pointing back toward the previous note (or forward when it starts the group). Since stem x-positions are flex ratios, segment endpoints are too.
7. Chords participate in beams: `BeamContainer` uses the chord's notehead nearest the beam as its effective position, and `NoteStack` runs its stem from the notehead farthest from the beam to the `stemEndValue` it receives from the beam container.

**Not implemented yet**: the "repeated pattern of pitches goes horizontal" rule.

While figuring out stem geometry, this trick handled the upward stem sitting off from the left edge of its container: positive margin on the left, negative margin on the right (now the `.stem-above` class in `Note.css`). Background reading kept from that phase of development:

- [Make Awesome SVG Animations with CSS // 7 Useful Techniques](https://www.youtube.com/watch?v=UTHgr6NLeEw)
- [SVG image without aspect ratio](https://stackoverflow.com/questions/50226255/scale-svg-image-without-aspect-ratio)

## Grand staff

- The onset grid (see [Layout engine](#layout-engine)) is what lets two staves with independent rhythms align: `.grid-event` wrappers span their onset columns, and a beam group whose internal notes are flex-proportional lines up with the outer grid automatically.
- The two staves overlap their Leland line boxes by 6 staff-spaces (each line box is `16.125 * staff-space` tall), which leaves a 6 staff-space gap between the bottom of the treble staff and the top of the bass staff. The system barline height and the brace height both derive from that same overlap.
- Systems: `GrandStaff` breaks grand measures into systems the same way `Staff` does; every system gets its own brace and restates the running clef and key on both staves.
- **Known limitations**: `repeatEnd` barlines render per staff (so the repeat dots sit on each staff individually); every other barline type spans both staves as one barline. A grand measure whose staves have mismatched total durations falls back to unaligned flow for the events past the mismatch (an event that doesn't land on a shared onset boundary just renders inline instead of being grid-placed).

## Known limitations / rough edges

- **Accidental margins inside beams**: accidentals reserve horizontal space via a margin on the note's container. Inside a `BeamContainer`, that margin shifts the real stem position, but the beam's flex-ratio interpolation doesn't account for it, so a beamed note with an accidental can have its stem meet the beam slightly off. Rare in practice; the fix would be folding margins into the flex math.
- **Spacing is legible, not engraving-grade**: `flex-grow` spacing is proportional to duration, which reads fine but isn't real engraving spacing (professional engraving uses a roughly logarithmic scale). Very tight 16th-note groups can nearly touch at default sizes.
- **Voice collisions**: `Voice` doesn't do collision avoidance — unisons or seconds between two voices on the same staff will visually overlap.
- See also the grand-staff-specific limitations above (brace/clef restatement on wrapped systems, per-staff repeat-end barlines, mismatched-duration fallback) and the "Still out" list under [Status](#status).

## Development

Built with [Vite](https://vitejs.dev/), [Storybook](https://storybook.js.org/), and TypeScript.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc`) then build with Vite |
| `npm run lint` | ESLint |
| `npm run storybook` | Storybook dev server on port 6006 |
| `npm run build-storybook` | Static Storybook build |

## Resources

- [Video about the MuseScore font](https://www.youtube.com/watch?v=XGo4PJd1lng)
- [Leland music fonts](https://github.com/MuseScoreFonts/Leland)
- [Standard Music Font Layout (SMuFL) spec](https://w3c.github.io/smufl/latest/index.html)
- [MusicXML wiki](https://www.w3.org/2021/06/musicxml40/)
- [Tool for viewing all font symbols](https://fontdrop.info/)
- [Font conversion tool](https://www.fontsquirrel.com/tools/webfont-generator)
- [Subsetting web fonts](https://web.dev/learn/performance/optimize-web-fonts#:~:text=Note%3A%20The%20only%20time%20you,font%20formats%20other%20than%20WOFF2.)
- [Deep Controls Addon docs](https://www.npmjs.com/package/storybook-addon-deep-controls)
- [Make Awesome SVG Animations with CSS // 7 Useful Techniques](https://www.youtube.com/watch?v=UTHgr6NLeEw)
- [SVG image without aspect ratio](https://stackoverflow.com/questions/50226255/scale-svg-image-without-aspect-ratio)
