import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { BeamContainer } from "./BeamContainer";

/*
  Kitchen-sink demo of the MVP feature set:
  - all three clefs with key signatures placed per clef
  - numeric time signatures
  - note values whole through 16th, rests, dotted notes
  - accidentals
  - ledger lines up to two above/below the staff
  - beamed eighths and sixteenths (sloped, clamped, and horizontal beams)
  - the whole score scales via --staff-space and reflows via flex wrapping
*/
const meta: Meta = {
  title: "Demo/Phase 1",
};

export default meta;

const DemoScore = () => (
  <Staff>
    {/* Treble, D major: dotted note, a flagged eighth, and a descending
        beamed run whose slant gets clamped to one staff-space */}
    <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
      <Note position="line-4" noteValue="quarter" dotted={1} />
      <Note position="space-3" noteValue="eighth" />
      <BeamContainer stem="upStem">
        <Note position="space-2" noteValue="eighth" />
        <Note position="line-2" noteValue="eighth" />
        <Note position="space-1" noteValue="eighth" />
        <Note position="line-1" noteValue="eighth" />
      </BeamContainer>
    </Measure>

    {/* Ledger lines below the staff, plus a rest */}
    <Measure>
      <Note position="line-below-1" noteValue="quarter" />
      <Note position="space-below-2" noteValue="quarter" />
      <Note position="line-below-2" noteValue="quarter" />
      <Note rest noteValue="quarter" />
    </Measure>

    {/* An accidental, then beamed sixteenths (double beam) climbing onto
        ledger lines above, and a half note */}
    <Measure>
      <Note
        position="space-above-1"
        noteValue="quarter"
        pitch={{ step: "G", alter: "sharp", octave: 5 }}
      />
      <BeamContainer stem="downStem">
        <Note position="space-above-1" noteValue="16th" />
        <Note position="line-above-1" noteValue="16th" />
        <Note position="space-above-2" noteValue="16th" />
        <Note position="line-above-2" noteValue="16th" />
      </BeamContainer>
      <Note position="space-4" noteValue="half" />
    </Measure>

    {/* Bass clef, E-flat major */}
    <Measure clef="fClef" fifths={-3} time={{ beat: 4, beatType: 4 }}>
      <Note position="line-3" noteValue="quarter" />
      <BeamContainer stem="upStem">
        <Note position="space-2" noteValue="eighth" />
        <Note position="line-2" noteValue="eighth" />
        <Note position="space-2" noteValue="eighth" />
        <Note position="line-3" noteValue="eighth" />
      </BeamContainer>
      <Note position="line-1" noteValue="quarter" />
    </Measure>

    {/* Alto clef, A major, whole note */}
    <Measure clef="cClef" fifths={3} time={{ beat: 4, beatType: 4 }}>
      <Note position="line-3" noteValue="whole" />
    </Measure>

    {/* Dotted rest-and-note rhythms with a horizontal beam (inner note
        closest to the beam keeps it flat) */}
    <Measure>
      <Note rest noteValue="quarter" dotted={1} />
      <Note position="space-3" noteValue="eighth" />
      <BeamContainer stem="downStem">
        <Note position="line-4" noteValue="eighth" />
        <Note position="space-3" noteValue="eighth" />
        <Note position="line-4" noteValue="eighth" />
        <Note position="line-5" noteValue="eighth" />
      </BeamContainer>
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

export const SizeComparison: StoryObj = {
  render: function Render() {
    return (
      <>
        {[6, 8, 12].map((staffSpace) => (
          <div
            key={staffSpace}
            style={{ "--staff-space": `${staffSpace}px` } as React.CSSProperties}
          >
            <DemoScore />
          </div>
        ))}
      </>
    );
  },
};
