import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";

/*
  Phase 23 demo: margin-exact beam geometry.
  Anything that pushes a note sideways inside a beamed group — an
  accidental, a grace note, a chord's accidental column, a mid-measure
  clef — used to nudge that stem off the beam's proportional math.
  Beams are now drawn as per-interval segments whose positions include
  the margins exactly, so every stem meets the beam precisely:
  - m1: a rising (sloped) beam with a sharp mid-group
  - m2: 16ths with an accidental-heavy chord and a grace mid-group
  - m3: dotted-8th + 16th stubs where the 16th carries an accidental
*/
const meta: Meta = {
  title: "Demo/Phase 23",
};

export default meta;

const BeamSpacingScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <BeamContainer>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        <Note
          pitch={{ step: "F", octave: 5, alter: "sharp" }}
          noteValue="eighth"
        />
        <Note pitch={{ step: "A", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "B", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
    </Measure>
    <Measure>
      <BeamContainer>
        <Note pitch={{ step: "D", octave: 5 }} noteValue="16th" />
        <NoteStack
          noteValue="16th"
          pitches={[
            { pitch: { step: "C", octave: 5, alter: "sharp" } },
            { pitch: { step: "D", octave: 5, alter: "flat" } },
          ]}
        />
        <Note
          pitch={{ step: "B", octave: 4 }}
          noteValue="16th"
          grace={[{ pitch: { step: "A", octave: 4 }, slash: true }]}
        />
        <Note pitch={{ step: "A", octave: 4 }} noteValue="16th" />
      </BeamContainer>
      <Note rest noteValue="quarter" />
      <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
    </Measure>
    <Measure barline="final">
      <BeamContainer>
        <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" dotted={1} />
        <Note
          pitch={{ step: "F", octave: 5, alter: "sharp" }}
          noteValue="16th"
        />
      </BeamContainer>
      <BeamContainer>
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" dotted={1} />
        <Note
          pitch={{ step: "C", octave: 5, alter: "sharp" }}
          noteValue="16th"
        />
      </BeamContainer>
      <Note pitch={{ step: "D", octave: 5 }} noteValue="half" />
    </Measure>
  </Staff>
);

interface DemoArgs {
  staffSpace: number;
  containerWidth: number;
}

const demoArgTypes = {
  staffSpace: {
    control: { type: "range", min: 4, max: 16, step: 1 },
    description: "The --staff-space size knob, in px",
  },
  containerWidth: {
    control: { type: "range", min: 25, max: 100, step: 5 },
    description: "Container width % — systems re-break to fit",
  },
} as const;

export const BeamSpacing: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
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
        <BeamSpacingScore />
      </div>
    );
  },
};
