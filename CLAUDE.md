# CLAUDE.md — react-music-notation

React component library for music notation (CSS/DOM engraving, no canvas).
Read `README.md` for the API and architecture, `ROADMAP.md` for what's done
and what's next. This file holds the working conventions and gotchas that
are NOT derivable from the code.

## Phase workflow

Development proceeds in numbered phases, one commit per phase on a feature
branch:

1. Implement the feature(s).
2. Add a Storybook demo: `src/stories/Demo<N>.stories.tsx`, title
   `"Demo/Phase <N>"`. Every phase gets its own demo showing everything the
   phase added. Include the standard `staffSpace` / `containerWidth` arg
   controls (copy from the previous demo).
3. **Verify visually before committing** — use the `visual-verify` skill
   (`.claude/skills/visual-verify/`). `tsc` passing is not verification;
   engraving bugs are only visible in screenshots.
4. Run the test suites: `npm test` (unit tests for the pure cores) and
   `npm run test:visual` (Playwright screenshots of every story in
   Chromium/Firefox/WebKit against committed baselines). New or
   intentionally changed stories need `npm run test:visual:update` —
   review the new baselines before committing them. Add unit tests when
   touching the pure logic (helpers, soundingPitch, extraction, layout).
5. Update `README.md`: add a phase block under Status, update the
   "Still out" list and the MusicXML coverage paragraph; add a usage
   section if there's new public API. Update `ROADMAP.md` (strike shipped
   items, note what's still open) and `QUALITY.md` if a quality gap
   opened or closed.
6. `npm run build` sanity check, then commit with a descriptive message.

Documentation-only tasks (README restructures, TSDoc) can be delegated to
a smaller model via the Agent tool — verify its output before committing.

## Architecture invariants (do not break)

- Everything scales from the `--staff-space` CSS variable (ss). Glyph
  font-size = 4×ss; one pitch step = ss/2. The Leland glyph line box is
  16.125×ss tall. Never hard-code pixels; write `calc(var(--staff-space) * X)`.
- `pitchPositionOrder` in `src/helpers/helpers.ts` (25 positions,
  `line-above-4` … `line-below-4`) is the single source of truth for
  vertical placement. Stem/beam endpoint tables are GENERATED from it —
  extend the order, never hand-edit the generated tables.
- Stem/beam SVGs use viewBox `0 0 100 129`, `preserveAspectRatio="none"`,
  1 ss = 8 viewBox units, middle line at y=64.
- Horizontal rhythm spacing is duration-proportional flex (`flex-grow`,
  `flex-basis: 0`). Anything zero-duration (accidentals, grace notes,
  lyrics overhang) must be handled with margins/min-width floors, never by
  adding flex width — that would corrupt beam geometry and the onset grid.
- Cross-staff alignment uses the onset grid (`src/components/layout.tsx`).
  Slur/hairpin wrappers are timing-transparent; tuplets are opaque. New
  wrapper components must declare a `musicRole` static and be classified
  in `layout.tsx`.
- Engraving decisions follow Gould, *Behind Bars* (see References below),
  not intuition. When placement looks wrong, check the book first.
- Beamed groups use margin-exact geometry (Phase 23): every source of
  leading margin on a beamed event (accidental columns, graces,
  mid-measure clefs) must go through the shared helpers in `layout.tsx`
  (`leadingMarginSs`/`stackAccidentalMargin`) so stems and beam segments
  compute identical x positions. A new margin source added anywhere else
  detaches stems from beams.
- Ties/slurs are drawn by `CurveOverlay` from `data-*` attributes that
  notes publish (anchors/obstacles in staff-spaces below staff top,
  measured at the container). A new component with noteheads only
  participates in curves if it publishes the same attributes; anything
  that moves noteheads must keep them truthful.
- Mid-measure clefs are render-time `ClefContext` providers created by
  the `decorate` hook of `placeEventsOnGrid` — the layout walkers must
  stay unaware of them. New walkers must not special-case clef changes.
- Colors: every mark paints `currentColor`; roots read
  `var(--rmn-ink, #000)`; masking backgrounds use `var(--rmn-paper, white)`.
  Never hard-code a color in component CSS — it breaks dark mode.
  `.measure-container` has `isolation: isolate` because the staff lines
  sit at `z-index: -1`; without it any ancestor background hides them.
- Every visual component forwards a ref and merges `className`/`style`
  onto its container, with layout-critical inline values spread AFTER
  the user's style. Keep that contract for new components (use
  `mergeRefs` when the component also measures itself).
- The importer never draws accidentals from `<alter>` alone —
  `AccidentalContext` (key signature + measure carry) decides what's
  drawn vs what's sounding. Playback timing derives from the same flex
  units as layout (flex/4 = quarter notes): changing `getNoteFlex`
  semantics changes playback.
- Corpus warnings (`tests/corpus/__snapshots__/`) may only change when
  the importer deliberately learns or loses an element — a surprise
  diff there is a regression.

## Environment gotchas (Windows / PowerShell 5.1 / OneDrive)

- PowerShell 5.1: no `&&` / `||`. Embedded double quotes in
  `git commit -m "..."` explode into pathspec errors — run git commits
  through the Bash tool with a heredoc instead.
- The repo lives in OneDrive: cleaning `storybook-static/` in-place can
  hit EPERM. Always build Storybook to the session scratchpad with `-o`.
- UTF-8: PowerShell regex/`Get-Content` rewrites of source files mangle
  em-dashes and PUA glyph characters (mojibake). For scripted edits of
  source files use `py` with `io.open(..., encoding='utf-8')` or
  `[System.IO.File]::ReadAllText/WriteAllText` with UTF8. Console output
  from `py` can also mojibake (cp1252) — write to a file when it matters.
- React falsy-zero: `{fifths && <X/>}` renders a literal `0` — write
  `{!!fifths && <X/>}`.

## Music glyphs (SMuFL / Leland)

Adding or editing glyphs in `src/helpers/glyphs.ts` has burned us twice —
follow the `add-glyphs` skill (`.claude/skills/add-glyphs/`). Short
version: always store glyphs as `"\uXXXX"` escapes (never paste literal
PUA characters — the Edit tool has silently stripped them before), verify
the font actually draws what SMuFL says (Leland deviates: its grace-note
glyphs at E560–E563 are grouped by slash, not stem direction), and dump
codepoints with `py` after editing to confirm nothing was eaten.

## References

- `references/` (git-ignored): Gould *Behind Bars* and the MPA engraving
  booklet as PDFs. Too big for the Read tool — extract text with
  `py` + `pypdf`. Behind Bars: PDF page ≈ book page + 19.
- MusicXML 4.0 element reference:
  https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/
- The coverage audit of both references lives in `ROADMAP.md`.
