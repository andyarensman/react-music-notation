import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GrandStaff } from "../components/GrandStaff";
import { GrandMeasure } from "../components/GrandMeasure";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { Voice } from "../components/Voice";

/*
  Phase 24 demo: margin-exact onset grid (the cross-staff margin skew).
  Accidentals, grace notes, and mid-measure clefs give a note a fixed
  leading margin. On a shared onset grid that margin used to come out of
  the note's own column, pushing its notehead right of the other staff's
  simultaneous notehead. The grid now carries a fixed margin track per
  onset (the union of what any staff needs) and pads narrower events up
  to it, so simultaneous noteheads align exactly:
  - m1: RH accidentals against plain LH quarters
  - m2: an accidental-column chord + grace notes against LH quarters
  - m3: a mid-measure clef change on the LH under plain RH quarters
  - m4: two RH voices, the lower voice carrying the accidentals
*/
const meta: Meta = {
  title: "Demo/Phase 24",
};

export default meta;

const MarginSkewScore = () => (
  <GrandStaff>
    <GrandMeasure
      upper={
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
          <Note
            pitch={{ step: "F", octave: 5, alter: "sharp" }}
            noteValue="quarter"
          />
          <Note
            pitch={{ step: "E", octave: 5, alter: "flat" }}
            noteValue="quarter"
          />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        </Measure>
      }
      lower={
        <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
          <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "D", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "E", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "F", octave: 3 }} noteValue="quarter" />
        </Measure>
      }
    />
    <GrandMeasure
      upper={
        <Measure>
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "C", octave: 5, alter: "sharp" } },
              { pitch: { step: "E", octave: 5, alter: "flat" } },
              { pitch: { step: "G", octave: 5 } },
            ]}
          />
          <Note
            pitch={{ step: "B", octave: 4 }}
            noteValue="half"
            grace={[{ pitch: { step: "A", octave: 4 }, slash: true }]}
          />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "A", octave: 2 }} noteValue="quarter" />
          <Note pitch={{ step: "B", octave: 2 }} noteValue="quarter" />
          <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
          <Note pitch={{ step: "D", octave: 3 }} noteValue="quarter" />
        </Measure>
      }
    />
    <GrandMeasure
      upper={
        <Measure>
          <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
          <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "G", octave: 2 }} noteValue="quarter" />
          <Note
            pitch={{ step: "B", octave: 3 }}
            noteValue="quarter"
            clefChange="gClef"
          />
          <Note
            pitch={{ step: "C", octave: 3 }}
            noteValue="half"
            clefChange="fClef"
          />
        </Measure>
      }
    />
    <GrandMeasure
      barline="final"
      upper={
        <Measure>
          <Voice stem="upStem">
            <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
            <Note pitch={{ step: "F", octave: 5 }} noteValue="half" />
          </Voice>
          <Voice stem="downStem">
            <Note
              pitch={{ step: "B", octave: 4, alter: "flat" }}
              noteValue="quarter"
            />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
            <Note
              pitch={{ step: "D", octave: 5, alter: "sharp" }}
              noteValue="half"
            />
          </Voice>
        </Measure>
      }
      lower={
        <Measure>
          <BeamContainer stem="downStem">
            <Note pitch={{ step: "C", octave: 3 }} noteValue="eighth" />
            <Note pitch={{ step: "G", octave: 3 }} noteValue="eighth" />
            <Note pitch={{ step: "C", octave: 3 }} noteValue="eighth" />
            <Note pitch={{ step: "G", octave: 3 }} noteValue="eighth" />
          </BeamContainer>
          <Note pitch={{ step: "C", octave: 3 }} noteValue="half" />
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

export const MarginExactGrid: StoryObj<DemoArgs> = {
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
        <MarginSkewScore />
      </div>
    );
  },
};
