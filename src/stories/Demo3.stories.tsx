import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GrandStaff } from "./GrandStaff";
import { GrandMeasure } from "./GrandMeasure";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";

/*
  Phase 3 demo: the grand staff.
  - two staves with a brace and system barlines spanning both
  - each grand measure lays both staves on a shared onset grid, so notes that
    sound together sit at the same x even with different rhythms per hand
  - running clefs tracked per staff across measures
*/
const meta: Meta = {
  title: "Demo/Phase 3",
};

export default meta;

const DemoScore = () => (
  <GrandStaff>
    {/* Eighth-note melody over sustained half chords: the second chord lands
        exactly under the second beam group */}
    <GrandMeasure
      upper={
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          <BeamContainer stem="upStem">
            <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          </BeamContainer>
          <BeamContainer stem="upStem">
            <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "G", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
          </BeamContainer>
        </Measure>
      }
      lower={
        <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "C", octave: 3 } },
              { pitch: { step: "G", octave: 3 } },
            ]}
          />
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "G", octave: 2 } },
              { pitch: { step: "D", octave: 3 } },
            ]}
          />
        </Measure>
      }
    />

    {/* Dotted rhythms against a walking bass: the quarters land on beats 1,
        2, 3, 4 while the melody subdivides beats 1 and 2 */}
    <GrandMeasure
      upper={
        <Measure>
          <BeamContainer stem="downStem">
            <Note pitch={{ step: "G", octave: 5 }} noteValue="eighth" dotted={1} />
            <Note pitch={{ step: "F", octave: 5 }} noteValue="16th" />
          </BeamContainer>
          <BeamContainer stem="downStem">
            <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" dotted={1} />
            <Note pitch={{ step: "D", octave: 5 }} noteValue="16th" />
          </BeamContainer>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "D", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "E", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
        </Measure>
      }
    />

    {/* Final chord */}
    <GrandMeasure
      barline="final"
      upper={
        <Measure>
          <NoteStack
            noteValue="whole"
            pitches={[
              { pitch: { step: "E", octave: 4 } },
              { pitch: { step: "G", octave: 4 } },
              { pitch: { step: "C", octave: 5 } },
            ]}
          />
        </Measure>
      }
      lower={
        <Measure>
          <NoteStack
            noteValue="whole"
            pitches={[
              { pitch: { step: "C", octave: 2 } },
              { pitch: { step: "C", octave: 3 } },
            ]}
          />
        </Measure>
      }
    />
  </GrandStaff>
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
      description: "Container width % — grand measures reflow to fit",
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
