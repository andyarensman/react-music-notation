import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { GrandStaff } from "../components/GrandStaff";
import { GrandMeasure } from "../components/GrandMeasure";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { Voice } from "../components/Voice";
import { BeamContainer } from "../components/BeamContainer";

/*
  Phase 4 demo: a four-part chorale (SATB) on the grand staff.
  - two independent voices per staff (soprano/alto up/down on the treble
    staff, tenor/bass up/down on the bass staff), all four aligned on the
    shared onset grid
  - ties (soprano and bass hold notes across beats; curves flip to the side
    opposite the stem)
  - beams inside a voice inherit the voice's stem direction
*/
const meta: Meta = {
  title: "Demo/Phase 4",
};

export default meta;

const DemoScore = () => (
  <GrandStaff>
    <GrandMeasure
      upper={
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          <Voice stem="upStem">
            <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 5 }} noteValue="quarter" />
          </Voice>
          <Voice stem="downStem">
            <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
            <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
            <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
          </Voice>
        </Measure>
      }
      lower={
        <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
          <Voice stem="upStem">
            <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "F", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
          </Voice>
          <Voice stem="downStem">
            <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 2 }} noteValue="quarter" />
            <Note pitch={{ step: "A", octave: 2 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 2 }} noteValue="quarter" />
          </Voice>
        </Measure>
      }
    />

    {/* Soprano and bass hold tied notes while alto moves in beamed eighths */}
    <GrandMeasure
      upper={
        <Measure>
          <Voice stem="upStem">
            <Note
              pitch={{ step: "G", octave: 5 }}
              noteValue="half"
              tie="start"
            />
            <Note pitch={{ step: "G", octave: 5 }} noteValue="half" tie="stop" />
          </Voice>
          <Voice stem="downStem">
            <BeamContainer>
              <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
              <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
            </BeamContainer>
            <BeamContainer>
              <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
              <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
            </BeamContainer>
            <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
          </Voice>
        </Measure>
      }
      lower={
        <Measure>
          <Voice stem="upStem">
            <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "A", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "B", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "A", octave: 3 }} noteValue="quarter" />
          </Voice>
          <Voice stem="downStem">
            <Note
              pitch={{ step: "C", octave: 3 }}
              noteValue="half"
              tie="start"
            />
            <Note pitch={{ step: "C", octave: 3 }} noteValue="half" tie="stop" />
          </Voice>
        </Measure>
      }
    />

    {/* Final chord, one whole note per voice */}
    <GrandMeasure
      barline="final"
      upper={
        <Measure>
          <Voice stem="upStem">
            <Note pitch={{ step: "E", octave: 5 }} noteValue="whole" />
          </Voice>
          <Voice stem="downStem">
            <Note pitch={{ step: "C", octave: 5 }} noteValue="whole" />
          </Voice>
        </Measure>
      }
      lower={
        <Measure>
          <Voice stem="upStem">
            <Note pitch={{ step: "G", octave: 3 }} noteValue="whole" />
          </Voice>
          <Voice stem="downStem">
            <Note pitch={{ step: "C", octave: 3 }} noteValue="whole" />
          </Voice>
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
