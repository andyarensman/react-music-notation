import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";

/*
  Phase 6 demo: breadth and polish.
  - articulations on the notehead side (staccato, tenuto, accent, marcato)
    for single notes and chords
  - dynamics below the staff (p, mf, f, ...)
  - 32nd notes: triple beams, mixed 8th/16th/32nd groups with per-level
    partial beams, and standalone 32nd flags on chords
*/
const meta: Meta = {
  title: "Demo/Phase 6",
};

export default meta;

const DemoScore = () => (
  <Staff>
    {/* Articulated quarters under a piano marking */}
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "C", octave: 5 }}
        noteValue="quarter"
        articulation="staccato"
        dynamic="p"
      />
      <Note
        pitch={{ step: "C", octave: 5 }}
        noteValue="quarter"
        articulation="staccato"
      />
      <Note
        pitch={{ step: "D", octave: 5 }}
        noteValue="quarter"
        articulation="tenuto"
      />
      <Note
        pitch={{ step: "E", octave: 5 }}
        noteValue="quarter"
        articulation="accent"
      />
    </Measure>

    {/* A 32nd-note run under a triple beam, a mixed 8th + 32nds group, and
        a marcato half note */}
    <Measure>
      <BeamContainer stem="upStem">
        <Note pitch={{ step: "C", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "E", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "G", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "E", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="32nd" />
      </BeamContainer>
      <BeamContainer stem="upStem">
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "E", octave: 5 }} noteValue="32nd" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="16th" />
      </BeamContainer>
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="half"
        articulation="marcato"
        dynamic="mf"
      />
    </Measure>

    {/* Articulated chord, a flagged 32nd chord, and an accented ending */}
    <Measure barline="final">
      <NoteStack
        noteValue="quarter"
        articulation="staccato"
        dynamic="f"
        pitches={[
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
        ]}
      />
      <NoteStack
        noteValue="32nd"
        pitches={[
          { pitch: { step: "F", octave: 4 } },
          { pitch: { step: "A", octave: 4 } },
        ]}
      />
      <Note rest noteValue="32nd" />
      <Note rest noteValue="quarter" />
      <Note
        pitch={{ step: "D", octave: 5 }}
        noteValue="quarter"
        articulation="tenutoStaccato"
      />
      <NoteStack
        noteValue="quarter"
        articulation="accentStaccato"
        dynamic="ff"
        pitches={[
          { pitch: { step: "C", octave: 5 } },
          { pitch: { step: "E", octave: 5 } },
        ]}
      />
    </Measure>
  </Staff>
);

interface DemoArgs {
  staffSpace: number;
  containerWidth: number;
}

export const KitchenSink: StoryObj<DemoArgs> = {
  args: {
    staffSpace: 8,
    containerWidth: 100,
  },
  argTypes: {
    staffSpace: {
      control: { type: "range", min: 4, max: 16, step: 1 },
      description: "The --staff-space size knob, in px",
    },
    containerWidth: {
      control: { type: "range", min: 25, max: 100, step: 5 },
      description: "Container width % — systems re-break to fit",
    },
  },
  render: function Render({ staffSpace, containerWidth }) {
    return (
      <div
        style={
          {
            "--staff-space": `${staffSpace}px`,
            width: `${containerWidth}%`,
          } as React.CSSProperties
        }
      >
        <DemoScore />
      </div>
    );
  },
};
