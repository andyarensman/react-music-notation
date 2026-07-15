---
name: visual-verify
description: Visually verify notation rendering with headless-Chrome screenshots of the Storybook build. Use before committing any change that affects rendering — tsc passing is not verification for engraving. Triggers - verify, screenshot, check rendering, does it look right.
---

# Visual verification of notation rendering

Engraving bugs (overlapping glyphs, wrong stem directions, misplaced
brackets) are invisible to the type checker and unit tests. Every
rendering change must be screenshot-verified before commit.

## Procedure

1. **Typecheck first** (cheap): `npx tsc --noEmit`

2. **Build Storybook to the scratchpad** — never to the repo
   (OneDrive EPERM on cleaning `storybook-static/`):

   ```powershell
   npx storybook build -o "<scratchpad>\sb"
   ```

3. **Serve on a FRESH port** (orphaned servers from earlier sessions cause
   EADDRINUSE; if a port is taken, pick another — don't fight it). Run in
   the background:

   ```powershell
   npx http-server "<scratchpad>\sb" -p <port> --silent
   ```

4. **Screenshot the story iframe directly** (not the Storybook chrome).
   The story id is the kebab-cased title + `--` + kebab-cased export name,
   e.g. title `Demo/Phase 12`, export `GracesAndEndings` →
   `demo-phase-12--graces-and-endings`:

   ```powershell
   & "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless --disable-gpu `
     --force-device-scale-factor=2 --window-size=1280,720 --virtual-time-budget=8000 `
     --screenshot="<scratchpad>\shot.png" `
     "http://127.0.0.1:<port>/iframe.html?id=<story-id>&viewMode=story"
   ```

5. **Read the PNG with the Read tool** and actually look at it. Compare
   against the intent and against Behind Bars conventions.

6. **Zoom-crop anything suspicious** — full-page screenshots hide
   collisions. Reusable crop helper (source rect in image pixels; the
   screenshot is 2× DPR, so 1 CSS px = 2 image px):

   ```powershell
   Add-Type -AssemblyName System.Drawing
   function Crop($src, $dst, $x, $y, $w, $h, $scale) {
     $img = [System.Drawing.Image]::FromFile($src)
     $bmp = New-Object System.Drawing.Bitmap ([int]($w*$scale)), ([int]($h*$scale))
     $g = [System.Drawing.Graphics]::FromImage($bmp)
     $g.InterpolationMode = 'NearestNeighbor'
     $g.DrawImage($img, (New-Object System.Drawing.Rectangle 0,0,$bmp.Width,$bmp.Height),
                  (New-Object System.Drawing.Rectangle $x,$y,$w,$h), 'Pixel')
     $bmp.Save($dst); $g.Dispose(); $bmp.Dispose(); $img.Dispose()
   }
   Crop "<scratchpad>\shot.png" "<scratchpad>\crop.png" 380 120 250 180 4
   ```

7. **Fix → rebuild → re-screenshot** until clean. Re-serve on another
   fresh port after rebuilding if the old server died.

## What to look for

- Glyph collisions: accidentals/graces vs noteheads, slurs vs beams,
  tuplet brackets vs stems, lyric hyphens vs syllables.
- Stem directions and beam slopes after any change near stem/beam math.
- System breaking: resize via the `containerWidth` story arg; check that
  restated clefs/keys appear at system starts and the loose final system.
- Both story variants when a feature has a direct-prop story AND a
  MusicXML import story — the importer path can fail independently.
