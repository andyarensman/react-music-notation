# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },
};
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## Scope

Each completed phase has a kitchen-sink story under `Demo` in Storybook.

Phase 1 (MVP):

- Single staff, single voice
- G, F, and C clefs; key signatures -7..7 placed per clef; numeric and common/cut time signatures
- Note values whole through 16th, rests, dotted notes, accidentals
- Ledger lines up to two above/below the staff
- Beaming for uniform groups of 8ths or 16ths (explicit `BeamContainer` wrapping)
- Sizing via `--staff-space` and responsive measure wrapping via flex

Phase 2:

- Chords via `NoteStack`: shared stem sized to the outer noteheads, seconds
  flipped across the stem, accidentals stacked into non-colliding columns,
  standalone flag glyphs for unbeamed 8th/16th chords, beamable
- Pitch -> position derivation: notes can take `pitch={{ step, octave }}`
  instead of `position`; the measure's clef (provided via context, carried
  across measures by `Staff`) determines placement
- Accidentals reserve horizontal space instead of overlapping the previous note
- Barline types on `Measure`: regular, double, final, repeat end, plus
  `startRepeat` for the left side
- Mixed beam groups: 8ths and 16ths share a primary beam; 16th runs get a
  secondary beam segment and lone 16ths get a partial stub (dotted-8th + 16th
  works)

Phase 3:

- Grand staff (piano-style): `GrandStaff` + `GrandMeasure` stack a treble and
  bass measure with a brace and barlines spanning both staves; grand measures
  wrap together as a unit
- Onset-grid alignment: each grand measure lays both staves on a shared CSS
  grid whose columns are the union of both staves' note onsets, so notes that
  sound together sit at the same x even when the hands have different rhythms
  (see `layout.tsx`)
- Minimum note spacing so dense rhythms can't crush together (beam groups
  reserve their minimum as a unit to keep stem positions exactly
  flex-proportional)

Phase 4:

- Two voices per staff via `Voice`: stems forced per voice (up/down), events
  laid on the measure's shared onset grid so voices align with each other and
  (in a grand measure) with the other staff; beams inherit the voice's stem
  direction; rests default high in the up voice and low in the down voice
- Ties: `tie="start"/"stop"` on Note draws a filled lens curve to the next
  note. Direction is opposite the stem for single-voice music; inside a Voice
  the tie curves toward the voice's outer side (standard multi-voice rule);
  `tieDirection` overrides either

Still out: cross-staff beaming, slurs, tuplets, cross-measure ties, ties on chord members, 32nd+ notes, articulations/dynamics (glyph tables exist in `glyphs.ts`), automatic beam grouping from the time signature, voice-collision handling (unisons/seconds between voices overlap), MusicXML/MIDI, playback, print layout, and npm packaging (no lib build/exports yet — deliberately deferred).

### Grand staff notes

- The onset grid works because CSS grid `fr` columns are proportional exactly
  like `flex-grow` with `flex-basis: 0` — all the beam geometry keeps working
  unchanged inside a column span. Events are wrapped in `.grid-event` items
  spanning their onset columns; a beam group whose internal notes are
  flex-proportional lines up with the outer grid automatically.
- The two staves overlap their Leland line boxes by 6 staff-spaces, leaving a
  6 staff-space gap between the staves. The system barline and the brace both
  derive from that.
- Known limitations: the brace only renders on the first system (re-bracing
  wrapped rows needs real system layout, as does restating clefs per system);
  `repeatEnd` barlines render per staff so the dots sit on each staff, other
  barline types span both staves; a grand measure whose staves have
  mismatched total durations falls back to unaligned flow for the events past
  the mismatch.

## Sizing:

To determine the position of note heads, you take the font size of the Leland font and divide it by 8. So we are currently using font size 32px, which equates to 4px being the height of the note heads.I don't think pixels should be cut in half, so right now the font size options are 2:16, 3:24, 4:32, 5:40, 6:48, etc. This means I will likely need to limit the user to these font ratios.

To determine the sizing of the staff lines, you need to first double the note head size. We're at 4, so that gives us 8. We need to split this up by our line thickness and the gap between the lines. I want the lines `.line` to be 1px in thickness right now, so the gap `.staff` should be 7px. Larger font sizes may require thicker lines, which will need some testing.

The height of the leland font is not 32px, it is much larger at 129px (for this font size). We will use that as cushioning so we need to take the total height of our staff lines, subtract it from 129, and divide it by 2 to get our top and bottom border. The total height of the staff lines is 33px, so that gives us 48px margins for `.staff`.

### The --staff-space system

All of the sizing above is now driven by two CSS custom properties declared in `src/global.css`:

- `--staff-space` (default `8px`) — the distance from the center of one staff line to the center of the next. This is the master knob: font-size is `4 * staff-space`, each pitch-position step is `staff-space / 2`, the Leland line box is `16.125 * staff-space` (the 129px above), and the staff margin is `(12.125 * staff-space - line-thickness) / 2`.
- `--staff-line-thickness` (default `1px`) — staff lines, ledger lines, and barlines. Kept separate because hairlines shouldn't scale linearly at small sizes; bump it manually for very large staves.

Override `--staff-space` on any container to scale all notation inside it as a unit (see the Demo stories). Sizes that keep the derived values on whole/half pixels (6, 8, 10, 12, 16...) render crispest.

The stem/beam SVGs use `viewBox="0 0 100 129"` with `preserveAspectRatio="none"`, so the `StemPositions`/`BeamPositions` tables in `helpers.ts` are resolution-independent viewBox coordinates (1 staff-space = 8 units) and never need to change with sizing. Stems use `vector-effect: non-scaling-stroke` with a CSS `stroke-width` of `0.15 * staff-space` — without that, the non-uniform viewBox stretch would make stem thickness vary with measure width.

The C Clef centering issue mentioned previously appears resolved — verified against screenshots at multiple sizes; the center notch sits on the middle line.

## Beaming:

I'm not quite sure how this will work. Wether it will be within the note component or within the measure component. SVG is probably the only way to do it. Not sure how the view window will work either.

To account for the upward stem being off from from the left edge of the container, I can user positive margin on the left and negative margin on the right.

- [Make Awesome SVG Animations with CSS // 7 Useful Techniques](https://www.youtube.com/watch?v=UTHgr6NLeEw)
- [SVG image without aspect ratio](https://stackoverflow.com/questions/50226255/scale-svg-image-without-aspect-ratio)

### Beaming Rules

- When notes are in a space, the stem length is 3 1/2 spaces
- When notes are on a line, the stem is shortened to 3 1/4 spaces
- Beam angles usually cross no more than one stave-line
- The outer notes of the group determine the beam direction and angle.
- The beam is horizontal when the group begins and ends with the same note, there is a repeated pattern of pitches, or an inner note is closer to the beam than either of the outer notes (important). Concave is horizontal, convex is sloped

### Implemented Beaming Algorithm

`beamCreator.ts` decides the beam line; `BeamContainer` renders it and sets each stem:

- Look up each note's standard beam position (`BeamPositions`, a standard-length stem away from the notehead).
- The note closest to the beam is the anchor — its stem stays standard length, every other stem gets longer (never shorter).
- If that closest note is an inner note (concave group), or the outer notes match, the beam is horizontal at the anchor.
- Otherwise the beam slopes from the anchor toward the other outer note, with the rise clamped to one staff-space (beams shouldn't cross more than one staff line). This is what fixed the "inner notes too short" problem — steep intervals no longer drag the beam through the group.
- Inner stem heights are plain linear interpolation between the beam ends. Because every note is `flex-basis: 0`, horizontal positions are exactly proportional to flex-grow values, so the interpolation ratio is `prefixFlex / beamSpanFlex` — no trigonometry, no ResizeObserver, no measuring the DOM.
- Secondary (16th) beams sit a quarter staff-space toward the noteheads: runs of consecutive 16ths share a segment, and an isolated 16th gets a partial stub half a 16th wide pointing back toward the previous note (or forward when it starts the group). Since stem x positions are flex ratios, segment endpoints are too.
- Chords participate in beams: `BeamContainer` uses the chord's notehead nearest the beam as its effective position, and `NoteStack` runs its stem from the notehead farthest from the beam to the `stemEndValue` it receives.

Not implemented yet: the "repeated pattern of pitches goes horizontal" rule.

### Random Notes

- Accidentals now reserve horizontal space (a margin on the note container). One caveat: inside a `BeamContainer`, that margin shifts the real stem position but the beam's flex-ratio interpolation doesn't know about it, so a beamed note with an accidental can have its stem meet the beam slightly off. Rare in practice; fix would be folding margins into the flex math.
- flex-grow spacing is proportional to duration, which is legible but not engraving-grade spacing (real engraving uses a logarithmic-ish scale). Very tight 16th groups can nearly touch at default sizes.

## Resources:

- [video about musescore font](https://www.youtube.com/watch?v=XGo4PJd1lng)
- [Leland music fonts](https://github.com/MuseScoreFonts/Leland)
- [standard music font layout](https://w3c.github.io/smufl/latest/index.html)
- [musicXML wiki](https://www.w3.org/2021/06/musicxml40/)
- [Tool for viewing all font symbols](https://fontdrop.info/)
- [May need this for font conversion](https://www.fontsquirrel.com/tools/webfont-generator)
- [Subset web fonts](https://web.dev/learn/performance/optimize-web-fonts#:~:text=Note%3A%20The%20only%20time%20you,font%20formats%20other%20than%20WOFF2.)
- [Deep Controls Addon docs](https://www.npmjs.com/package/storybook-addon-deep-controls)

test 3
