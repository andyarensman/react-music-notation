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
4. Update `README.md`: add a phase block under Status, update the
   "Still out" list and the MusicXML coverage paragraph; add a usage
   section if there's new public API. Update `ROADMAP.md` (strike shipped
   items, note what's still open).
5. `npm run build` sanity check, then commit with a descriptive message.

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
