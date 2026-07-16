import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GrandStaff } from "../components/GrandStaff";
import { GrandMeasure } from "../components/GrandMeasure";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { BeamContainer } from "../components/BeamContainer";

/*
  Phase 19 demo: cross-staff beaming (piano writing between the hands).
  A crossStaff note keeps its rhythmic slot in its host measure but
  displays on the other staff: its pitch resolves against the other
  staff's clef and the head/ledgers draw a staff-stride away. Inside a
  BeamContainer, mixed groups share one horizontal beam between the
  staves, stems reaching it from both sides.
  - m1: rising arpeggios hosted in the bass, crossing up into the treble
  - m2: a descending group hosted in the treble, crossing down
*/
const meta: Meta = {
  title: "Demo/Phase 19",
};

export default meta;

const CrossStaffScore = () => (
  <GrandStaff>
    <GrandMeasure
      upper={
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          <Note rest noteValue="whole" />
        </Measure>
      }
      lower={
        <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
          <BeamContainer>
            <Note pitch={{ step: "C", octave: 3 }} noteValue="16th" />
            <Note pitch={{ step: "G", octave: 3 }} noteValue="16th" />
            <Note pitch={{ step: "E", octave: 4 }} noteValue="16th" crossStaff />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="16th" crossStaff />
          </BeamContainer>
          <BeamContainer>
            <Note pitch={{ step: "D", octave: 3 }} noteValue="16th" />
            <Note pitch={{ step: "A", octave: 3 }} noteValue="16th" />
            <Note pitch={{ step: "F", octave: 4 }} noteValue="16th" crossStaff />
            <Note pitch={{ step: "D", octave: 5 }} noteValue="16th" crossStaff />
          </BeamContainer>
          <Note rest noteValue="half" />
        </Measure>
      }
    />
    <GrandMeasure
      barline="final"
      upper={
        <Measure>
          <BeamContainer>
            <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "A", octave: 3 }} noteValue="eighth" crossStaff />
            <Note pitch={{ step: "F", octave: 3 }} noteValue="eighth" crossStaff />
          </BeamContainer>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note rest noteValue="whole" />
        </Measure>
      }
    />
  </GrandStaff>
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

export const CrossStaffBeams: StoryObj<DemoArgs> = {
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
        <CrossStaffScore />
      </div>
    );
  },
};
