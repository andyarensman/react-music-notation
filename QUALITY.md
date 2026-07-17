# QUALITY.md — what "great" means for this package

The product bar we hold ourselves to, and an honest ledger of where we
are against it. Update this when a gap closes (strike it) or a new one
is found (add it). Sibling of `ROADMAP.md` (features); this file is
about **quality and product scope**.

## What makes a great npm package

- Installs and works with zero friction: correct `exports` map
  (ESM + CJS + types per subpath), one CSS import with the font inlined,
  React as a peer dependency, `sideEffects` declared. ✅ have
- Full TSDoc on the public API (IDE hover docs). ✅ have
- A README that teaches the mental model, not just the props. ✅ have
- Semver discipline: a CHANGELOG, release notes, versioning policy
  (changesets or similar). ⚠️ CHANGELOG.md exists (full 0.1.0 history);
  changesets/release automation still to adopt before first publish
- CI that actually protects: typecheck + build ✅, automated tests ❌
  (see Testing below)
- Documented bundle cost and SSR behavior. ✅ README documents sizes
  and the SSR contract (components render in pure Node — guarded by
  tests/corpus/ssr.test.tsx; parseMusicXML needs a DOMParser polyfill
  server-side; playback is browser-only)

## What makes a great component library

- Composability: components nest like the domain nests. ✅ core thesis
- Every automatic decision overridable (stems, tie sides, slur
  directions, placements, positions). ✅ have
- Accessibility by default (labels, roles, keyboard). ✅ have (Phase 16)
- Escape hatches: `ref` forwarding, `className`/`style` passthrough on
  every component. ✅ have — `Note`, `NoteStack`, `TabNote`, `Measure`,
  `Staff`, `GrandStaff`, `Score` all forward refs and merge
  `className`/`style` (layout-critical inline values win the merge)
- Theming surface: CSS custom properties for ink color, selection/hover
  colors. ✅ have — all marks paint `currentColor`; roots read
  `--rmn-ink`; `--rmn-paper/-hover/-selected/-focus` cover masks and
  interaction states (see the Theming stories). Verified pixel-identical
  by default against all pre-theming baselines. Fonts stay fixed (the
  engraving is metrically derived from Leland — a font knob would be a lie)
- Custom content attachment (fingerings, editorial marks as children of
  a note). ❌ missing
- Internals available to power users. ✅ `ClefContext`/`OttavaContext`
  exported, plus `mergeRefs`
- Docs site with live, readable code per feature (the Storybook-as-wiki
  reorganization in ROADMAP.md). ❌ pending

## What makes a great notation library (vs VexFlow / OSMD / abcjs)

Our moat — protect these:

- **Notes are DOM**: addressable, stylable, focusable, screen-readable
  elements. This is why interactivity and the playback cursor were
  cheap. Nobody else has it.
- **Declarative JSX authoring** — others are imperative APIs or
  file-renderers only.
- **Responsive reflow**: systems re-break on container resize.
- **Bundled playback** with score-synced cursor, zero dependencies.
- **Engraving discipline**: decisions cite Gould, not intuition.

Where incumbents beat us today:

- **Robustness on wild MusicXML.** OSMD chews through arbitrary
  MuseScore/Finale exports; our importer had only ever eaten files we
  wrote for it. ✅ now guarded: `tests/corpus/` feeds 12 real-world
  files (Bach, Beethoven, Schumann, Joplin, OSMD's feature-soup tests)
  through parse + renderToStaticMarkup on every `npm test` — no throws,
  plausible note counts, skip-warnings snapshotted so importer behavior
  can't drift silently. OSMD still renders more of what's *in* those
  files (pedals, fermatas, ornaments, 3rd voice, multi-staff parts)
- Print/page layout, `.mxl` unzipping, transposition. ❌ (ROADMAP)

## Testing & verification (the big gap)

Development verification has been headless-Chrome screenshots reviewed
by eye (see `.claude/skills/visual-verify/`). Right process for
building; zero protection once anyone else touches the code.

- Unit tests for the pure cores (position math, key/accidental
  inference, playback extraction, repeat expansion, layout walkers).
  ✅ vitest (`npm test`); the hand-verified playback table is now
  assertions
- Automated visual regression across engines. ✅ Playwright
  (`npm run test:visual`): every Storybook story screenshotted in
  Chromium + Firefox + WebKit against committed baselines
  - Playwright ships WebKit for Windows — no Mac needed for routine
    runs. Caveat: text rasterization differs slightly from real macOS
    Safari; an occasional manual spot-check on Safari proper is a
    nice-to-have.
  - ⚠️ Baselines are OS-specific (font rasterization differs per OS).
    Ours are generated on Windows; CI on Linux cannot diff against
    them, so CI runs unit tests + builds only. Path forward: generate
    Linux baselines via a one-time CI artifact run, or run the visual
    job in a pinned container.
- Verification lesson (mid-measure clef bug): zoom-verify every NEW
  glyph against its reference geometry, and beware CSS-cascade
  overrides — a screenshot glance doesn't catch a stylesheet-order
  fight.

## Other known product gaps

- **Cross-browser correctness**: before the Playwright harness, all 23
  phases were verified in Chrome only. The geometry model rests on font
  line-box math and `calc(% + px)`; engine differences are exactly
  where it would break.
- **Performance is unmeasured**: each note is ~5–10 DOM nodes; a
  200-measure score is thousands. Probably fine; needs a benchmark
  before we claim it.
- Community scaffolding for an OSS package: CONTRIBUTING.md, issue
  templates, license headers. Post-publish.
