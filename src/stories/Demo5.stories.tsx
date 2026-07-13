import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";
import { GrandStaff } from "./GrandStaff";
import { GrandMeasure } from "./GrandMeasure";

/*
  Phase 5 demo: real system layout.
  - Staff/GrandStaff break measures into systems from the measured container
    width instead of blind flex-wrap
  - every system restates the running clef and key signature (watch the
    single-staff piece switch from treble to bass mid-piece: later systems
    restate the bass clef)
  - every grand system gets its own brace
  - a mostly-empty final system keeps its natural width instead of
    stretching its measures across the page
  Narrow the containerWidth control to watch systems re-break live.
*/
const meta: Meta = {
  title: "Demo/Phase 5",
};

export default meta;

const SingleStaffPiece = () => (
  <Staff>
    <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
      <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
      <BeamContainer>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
    </Measure>
    <Measure>
      <BeamContainer>
        <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "G", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "A", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "F", octave: 5 }} noteValue="half" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" />
    </Measure>
    {/* Mid-piece clef change: systems from here restate the bass clef */}
    <Measure clef="fClef">
      <Note pitch={{ step: "D", octave: 3 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 3 }} noteValue="quarter" />
      <Note pitch={{ step: "F", octave: 3 }} noteValue="quarter" />
      <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
    </Measure>
    <Measure>
      <BeamContainer>
        <Note pitch={{ step: "A", octave: 3 }} noteValue="eighth" />
        <Note pitch={{ step: "G", octave: 3 }} noteValue="eighth" />
      </BeamContainer>
      <BeamContainer>
        <Note pitch={{ step: "F", octave: 3 }} noteValue="eighth" />
        <Note pitch={{ step: "E", octave: 3 }} noteValue="eighth" />
      </BeamContainer>
      <Note pitch={{ step: "D", octave: 3 }} noteValue="half" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "G", octave: 3 }} noteValue="half" tie="start" />
      <Note pitch={{ step: "G", octave: 3 }} noteValue="half" tie="stop" />
    </Measure>
    <Measure barline="final">
      <Note pitch={{ step: "D", octave: 3 }} noteValue="whole" />
    </Measure>
  </Staff>
);

const GrandStaffPiece = () => (
  <GrandStaff>
    <GrandMeasure
      upper={
        <Measure clef="gClef" fifths={1} time={{ beat: 4, beatType: 4 }}>
          <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        </Measure>
      }
      lower={
        <Measure clef="fClef" fifths={1} time={{ beat: 4, beatType: 4 }}>
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "G", octave: 2 } },
              { pitch: { step: "D", octave: 3 } },
            ]}
          />
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "C", octave: 3 } },
              { pitch: { step: "G", octave: 3 } },
            ]}
          />
        </Measure>
      }
    />
    <GrandMeasure
      upper={
        <Measure>
          <Note pitch={{ step: "D", octave: 5 }} noteValue="half" />
          <Note pitch={{ step: "B", octave: 4 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "G", octave: 2 }} noteValue="quarter" />
          <Note pitch={{ step: "A", octave: 2 }} noteValue="quarter" />
          <Note pitch={{ step: "B", octave: 2 }} noteValue="quarter" />
          <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
        </Measure>
      }
    />
    <GrandMeasure
      upper={
        <Measure>
          <BeamContainer>
            <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          </BeamContainer>
          <BeamContainer>
            <Note pitch={{ step: "B", octave: 4 }} noteValue="eighth" />
            <Note pitch={{ step: "A", octave: 4 }} noteValue="eighth" />
          </BeamContainer>
          <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "D", octave: 3 }} noteValue="half" />
          <Note pitch={{ step: "G", octave: 2 }} noteValue="half" />
        </Measure>
      }
    />
    <GrandMeasure
      upper={
        <Measure>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
          <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
          <Note pitch={{ step: "A", octave: 4 }} noteValue="half" />
        </Measure>
      }
      lower={
        <Measure>
          <Note pitch={{ step: "C", octave: 3 }} noteValue="half" />
          <Note pitch={{ step: "D", octave: 3 }} noteValue="half" />
        </Measure>
      }
    />
    <GrandMeasure
      barline="final"
      upper={
        <Measure>
          <Note pitch={{ step: "G", octave: 4 }} noteValue="whole" />
        </Measure>
      }
      lower={
        <Measure>
          <NoteStack
            noteValue="whole"
            pitches={[
              { pitch: { step: "G", octave: 2 } },
              { pitch: { step: "G", octave: 3 } },
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
    containerWidth: 60,
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
        <SingleStaffPiece />
        <div style={{ height: "3rem" }} />
        <GrandStaffPiece />
      </div>
    );
  },
};
