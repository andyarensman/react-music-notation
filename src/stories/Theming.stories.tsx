import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { TabNote } from "../components/TabNote";
import { Slur } from "../components/Slur";

/*
  Theming and escape hatches.

  Every mark the library draws — noteheads, stems, beams, staff lines,
  barlines, slurs, tuplets, tab digits — inherits `currentColor`, and the
  root containers read `color: var(--rmn-ink, #000)`. Consumers theme a
  score by setting CSS variables on any ancestor:

    --rmn-ink       every notation mark (default #000)
    --rmn-paper     background masks, e.g. tab fret digits (default white)
    --rmn-hover     hover color for interactive notes (default #1a6ee0)
    --rmn-selected  color of `selected` notes (default #c2410c)
    --rmn-focus     keyboard focus ring (default #4d90fe)

  For one-off styling, every component also accepts className/style and
  forwards a ref to its container element.
*/
const meta: Meta = {
  title: "Theming",
};

export default meta;

const SAMPLE = (
  <Staff>
    <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
      <BeamContainer>
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "G", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      <NoteStack
        noteValue="half"
        pitches={[
          { pitch: { step: "D", octave: 5 } },
          { pitch: { step: "F", octave: 5 } },
          { pitch: { step: "A", octave: 5 } },
        ]}
      />
    </Measure>
    <Measure barline="final">
      <Slur>
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
      </Slur>
    </Measure>
  </Staff>
);

/**
 * Dark mode: set `--rmn-ink` and `--rmn-paper` on a wrapper (plus the
 * wrapper's own background). The tab measure proves `--rmn-paper` — its
 * fret digits mask the string lines with the paper color, which would
 * flash white boxes on a dark page if it were hard-coded.
 */
export const DarkMode: StoryObj = {
  render: () => (
    <div
      style={
        {
          "--rmn-ink": "#e8e6e3",
          "--rmn-paper": "#1b1b1f",
          background: "#1b1b1f",
          padding: 24,
        } as React.CSSProperties
      }
    >
      {SAMPLE}
      <Staff>
        <Measure clef="tab" time={{ beat: 4, beatType: 4 }} barline="final">
          <TabNote noteValue="quarter" frets={[{ string: 5, fret: 3 }]} />
          <TabNote
            noteValue="quarter"
            frets={[
              { string: 4, fret: 0 },
              { string: 3, fret: 2 },
            ]}
          />
          <TabNote noteValue="half" frets={[{ string: 2, fret: 1 }]} />
        </Measure>
      </Staff>
    </div>
  ),
};

/**
 * Brand colors: ink doesn't have to be black, and `--rmn-selected`
 * restyles the built-in `selected` state without touching any CSS.
 */
export const BrandInk: StoryObj = {
  render: () => (
    <div
      style={
        {
          "--rmn-ink": "#1e3a5f",
          "--rmn-selected": "#0d9488",
          background: "#f6f1e7",
          padding: 24,
        } as React.CSSProperties
      }
    >
      <Staff>
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }} barline="final">
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
          <Note
            pitch={{ step: "E", octave: 5 }}
            noteValue="quarter"
            selected
            onClick={() => {}}
          />
          <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
        </Measure>
      </Staff>
    </div>
  ),
};

/**
 * Escape hatches: every component takes `className`/`style` on its
 * container (and forwards a `ref` to it). Because all marks inherit
 * `currentColor`, coloring one note is just `style={{ color }}` — here an
 * "error" note is painted red and a custom class dims another to 40%.
 */
export const PerNoteStyling: StoryObj = {
  render: () => (
    <>
      <style>{`.rmn-demo-ghost { opacity: 0.4; }`}</style>
      <Staff>
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }} barline="final">
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
          <Note
            pitch={{ step: "D", octave: 5 }}
            noteValue="quarter"
            style={{ color: "#c1121f" }}
          />
          <Note
            pitch={{ step: "E", octave: 5 }}
            noteValue="quarter"
            className="rmn-demo-ghost"
          />
          <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
        </Measure>
      </Staff>
    </>
  ),
};
