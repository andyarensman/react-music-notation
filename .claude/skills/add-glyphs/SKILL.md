---
name: add-glyphs
description: Safely add or edit SMuFL music glyphs in src/helpers/glyphs.ts (notes, rests, accidentals, ornaments, etc.). Use whenever touching glyphs.ts or picking codepoints for the Leland font. Triggers - new glyph, SMuFL, codepoint, ornament glyph, U+Exxx.
---

# Adding SMuFL glyphs (Leland font)

Two incidents motivate this skill: (1) the Edit tool silently stripped
literal PUA characters from glyphs.ts, shipping empty strings; (2) Leland
deviates from the SMuFL spec for some ranges, so the spec codepoint drew
the wrong glyph. Follow all four steps.

## 1. Find the codepoint

Look up the glyph name in the SMuFL spec (https://w3c.github.io/smufl/latest/ —
or search the glyph name, e.g. "graceNoteAcciaccaturaStemUp smufl").

## 2. Verify against the actual font — never trust the spec blindly

Leland (`src/fonts/Leland.otf`) does not always follow SMuFL ordering.
Known deviation: grace-note glyphs E560–E563 are grouped by slash rather
than stem direction (E561 = stem-DOWN acciaccatura, E562 = stem-up
appoggiatura). Check existence and sanity-check the shape via ink bounds
(`py -m pip install fonttools` if needed):

```python
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
f = TTFont('src/fonts/Leland.otf')
gs, cmap = f.getGlyphSet(), f.getBestCmap()
for cp in range(0xE560, 0xE564):
    name = cmap.get(cp)
    pen = BoundsPen(gs); gs[name].draw(pen)
    print(hex(cp), name, pen.bounds, 'advance', gs[name].width)
```

Reading bounds (UPM = 1000, 1 staff space = 250 units, y=0 is the
notehead baseline): ink mostly ABOVE baseline (yMax large) = stem-up
variant; mostly below = stem-down. The advance width tells you how much
horizontal room to reserve (advance / 250 = width in staff spaces).

## 3. Write escapes, never literals

Add entries to `src/helpers/glyphs.ts` as `"\uXXXX"` escape sequences.
NEVER paste literal PUA characters — they render invisibly in diffs and
the Edit tool has corrupted them before. If an existing table already
contains literals (some do), do not touch those lines with the Edit tool;
rewrite them with a `py` script using
`io.open(path, encoding='utf-8')` / `str.replace`, writing with
`newline='\n'`.

## 4. Verify after editing

Dump the codepoints back out and diff against intent:

```python
import io, re
t = io.open('src/helpers/glyphs.ts', encoding='utf-8').read()
i = t.index('<tableName>')
for line in t[i:i+400].splitlines():
    m = re.search(r'(\w+): "(.*)"', line)
    if m: print(m.group(1), m.group(2).encode('unicode_escape').decode())
```

Escaped entries print as `\\uXXXX` (double backslash); a single backslash
means the file holds a literal character. Also confirm no neighboring
lines were eaten (a past Edit deleted an adjacent `export const` line).

Then render the glyph in a story and screenshot it (see the
`visual-verify` skill) — bounds don't reveal slashes or fine shape.
