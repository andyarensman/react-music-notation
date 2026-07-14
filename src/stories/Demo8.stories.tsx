import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { BeamContainer } from "../components/BeamContainer";
import { Tuplet } from "../components/Tuplet";
import { Slur } from "../components/Slur";
import { Hairpin } from "../components/Hairpin";

/*
  Phase 8 demo: the "real music" pack.
  - tempo marking with metronome equation above the first measure
  - slurs (over a beamed group, and over plain quarters)
  - a crescendo hairpin between dynamics
  - eighth-note and quarter-note triplets (beamed and bracketed)
  - expression text ("dolce")
*/
const meta: Meta = {
  title: "Demo/Phase 8",
};

export default meta;

const DemoScore = () => (
  <Staff>
    <Measure
      clef="gClef"
      time={{ beat: 4, beatType: 4 }}
      tempo={{ text: "Allegro", beatUnit: "quarter", bpm: 120 }}
    >
      <Slur>
        <BeamContainer>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
        </BeamContainer>
        <Note pitch={{ step: "G", octave: 5 }} noteValue="quarter" />
      </Slur>
      <Note
        pitch={{ step: "E", octave: 5 }}
        noteValue="quarter"
        articulation="staccato"
      />
    </Measure>

    <Measure>
      <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" dynamic="p" />
      <Hairpin type="crescendo">
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
      </Hairpin>
    </Measure>

    <Measure>
      <Tuplet ratio={[3, 2]}>
        <BeamContainer>
          <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        </BeamContainer>
      </Tuplet>
      <Tuplet ratio={[3, 2]}>
        <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      </Tuplet>
      <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" dynamic="f" />
    </Measure>

    <Measure barline="final">
      <Slur>
        <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      </Slur>
      <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" text="dolce" />
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
