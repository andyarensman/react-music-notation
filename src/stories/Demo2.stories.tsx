import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";

/*
  Phase 2 demo:
  - chords (NoteStack): shared stems, flipped seconds, accidental columns,
    flag glyphs on unbeamed eighth/16th chords, beamed chords
  - pitch -> position derivation: every note below is written as a pitch;
    positions come from the measure's clef, which Staff carries across
    measures that don't restate it
  - accidentals reserve horizontal space instead of overlapping
  - barline types: regular, double, repeats, final
  - mixed beam groups: 8ths and 16ths share a beam with partial stubs
*/
const meta: Meta = {
  title: "Demo/Phase 2",
};

export default meta;

const DemoScore = () => (
  <Staff>
    {/* Flagged eighth chord, a flipped-second cluster, and a half chord */}
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <NoteStack
        noteValue="eighth"
        pitches={[
          { pitch: { step: "C", octave: 4 } },
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
        ]}
      />
      <Note rest noteValue="eighth" />
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "C", octave: 4 } },
          { pitch: { step: "D", octave: 4 } },
          { pitch: { step: "A", octave: 4 } },
        ]}
      />
      <NoteStack
        noteValue="half"
        pitches={[
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
          { pitch: { step: "C", octave: 5 } },
        ]}
      />
    </Measure>

    {/* Mixed beam groups: dotted-8th + 16th, and 8th + two 16ths */}
    <Measure barline="double">
      <BeamContainer stem="upStem">
        <Note pitch={{ step: "E", octave: 4 }} noteValue="eighth" dotted={1} />
        <Note pitch={{ step: "F", octave: 4 }} noteValue="16th" />
      </BeamContainer>
      <BeamContainer stem="upStem">
        <Note pitch={{ step: "G", octave: 4 }} noteValue="eighth" />
        <Note pitch={{ step: "A", octave: 4 }} noteValue="16th" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="16th" />
      </BeamContainer>
      <Note pitch={{ step: "F", octave: 4 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 4 }} noteValue="quarter" />
    </Measure>

    {/* Bass clef inside a repeat: accidentals get reserved space, including
        two accidental columns on a flipped-second chord */}
    <Measure clef="fClef" time={{ beat: 4, beatType: 4 }} startRepeat>
      <BeamContainer stem="downStem">
        <Note pitch={{ step: "C", octave: 3 }} noteValue="16th" />
        <Note pitch={{ step: "D", octave: 3 }} noteValue="16th" />
        <Note pitch={{ step: "E", octave: 3 }} noteValue="16th" />
        <Note pitch={{ step: "F", octave: 3 }} noteValue="16th" />
      </BeamContainer>
      <Note
        pitch={{ step: "G", octave: 3, alter: "flat" }}
        noteValue="quarter"
      />
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "C", octave: 3, alter: "sharp" } },
          { pitch: { step: "D", octave: 3, alter: "flat" } },
        ]}
      />
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "G", octave: 2 } },
          { pitch: { step: "D", octave: 3 } },
          { pitch: { step: "B", octave: 3 } },
        ]}
      />
    </Measure>

    {/* Beamed chords, and a chord sharing a mixed beam with 16ths */}
    <Measure barline="repeatEnd">
      <BeamContainer stem="downStem">
        <NoteStack
          noteValue="eighth"
          pitches={[
            { pitch: { step: "D", octave: 3 } },
            { pitch: { step: "F", octave: 3 } },
          ]}
        />
        <NoteStack
          noteValue="eighth"
          pitches={[
            { pitch: { step: "D", octave: 3 } },
            { pitch: { step: "F", octave: 3 } },
          ]}
        />
        <NoteStack
          noteValue="eighth"
          pitches={[
            { pitch: { step: "C", octave: 3 } },
            { pitch: { step: "E", octave: 3 } },
          ]}
        />
        <NoteStack
          noteValue="eighth"
          pitches={[
            { pitch: { step: "C", octave: 3 } },
            { pitch: { step: "E", octave: 3 } },
          ]}
        />
      </BeamContainer>
      <BeamContainer stem="downStem">
        <NoteStack
          noteValue="eighth"
          pitches={[
            { pitch: { step: "E", octave: 3 } },
            { pitch: { step: "G", octave: 3 } },
          ]}
        />
        <Note pitch={{ step: "D", octave: 3 }} noteValue="16th" />
        <Note pitch={{ step: "C", octave: 3 }} noteValue="16th" />
      </BeamContainer>
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "G", octave: 2 } },
          { pitch: { step: "D", octave: 3 } },
        ]}
      />
    </Measure>

    {/* Alto clef: pitch derivation follows the new clef */}
    <Measure clef="cClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "B", octave: 3 }} noteValue="quarter" />
      <Note pitch={{ step: "C", octave: 4 }} noteValue="quarter" />
      <NoteStack
        noteValue="half"
        pitches={[
          { pitch: { step: "C", octave: 4 } },
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
        ]}
      />
    </Measure>

    {/* Stemless whole-note second (still flips), inheriting the alto clef */}
    <Measure barline="final">
      <NoteStack
        noteValue="whole"
        pitches={[
          { pitch: { step: "D", octave: 4 } },
          { pitch: { step: "E", octave: 4 } },
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
      description: "Container width % — measures reflow to fit",
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
