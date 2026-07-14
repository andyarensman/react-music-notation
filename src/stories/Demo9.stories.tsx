import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Score } from "../components/Score";
import { ScoreMeasure } from "../components/ScoreMeasure";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { Slur } from "../components/Slur";

/*
  Phase 9 demo: a multi-instrument score.
  - three parts (flute, violin, cello) stacked per measure via ScoreMeasure
  - all parts share the union onset grid, so different rhythms align
    vertically across every staff
  - part names in the left gutter of the first system; each system starts
    with a systemic barline and restates each part's clef/key
  - narrow the width control to watch systems re-break with all three
    staves moving together
*/
const meta: Meta = {
  title: "Demo/Phase 9",
};

export default meta;

const DemoScore = () => (
  <Score partNames={["Flute", "Violin", "Cello"]}>
    <ScoreMeasure
      parts={[
        <Measure
          clef="gClef"
          time={{ beat: 4, beatType: 4 }}
          tempo={{ text: "Andante", beatUnit: "quarter", bpm: 84 }}
        >
          <Slur>
            <BeamContainer>
              <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
              <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
              <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
              <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
            </BeamContainer>
            <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
          </Slur>
        </Measure>,
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          <Note pitch={{ step: "E", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "F", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
        </Measure>,
        <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
          <Note pitch={{ step: "C", octave: 3 }} noteValue="half" />
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "G", octave: 2 } },
              { pitch: { step: "D", octave: 3 } },
            ]}
          />
        </Measure>,
      ]}
    />

    <ScoreMeasure
      parts={[
        <Measure>
          <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="half" />
        </Measure>,
        <Measure>
          <BeamContainer>
            <Note pitch={{ step: "C", octave: 4 }} noteValue="eighth" />
            <Note pitch={{ step: "D", octave: 4 }} noteValue="eighth" />
          </BeamContainer>
          <BeamContainer>
            <Note pitch={{ step: "E", octave: 4 }} noteValue="eighth" />
            <Note pitch={{ step: "F", octave: 4 }} noteValue="eighth" />
          </BeamContainer>
          <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
        </Measure>,
        <Measure>
          <Note pitch={{ step: "F", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "E", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "G", octave: 2 }} noteValue="half" />
        </Measure>,
      ]}
    />

    <ScoreMeasure
      barline="final"
      parts={[
        <Measure>
          <Note pitch={{ step: "E", octave: 5 }} noteValue="whole" />
        </Measure>,
        <Measure>
          <Note pitch={{ step: "C", octave: 4 }} noteValue="whole" />
        </Measure>,
        <Measure>
          <NoteStack
            noteValue="whole"
            pitches={[
              { pitch: { step: "C", octave: 2 } },
              { pitch: { step: "C", octave: 3 } },
            ]}
          />
        </Measure>,
      ]}
    />
  </Score>
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
