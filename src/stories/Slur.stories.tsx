import type { Meta, StoryObj } from "@storybook/react";

import { Slur } from "../components/Slur";
import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { BeamContainer } from "../components/BeamContainer";

const meta: Meta<typeof Slur> = {
  component: Slur,
};

export default meta;
type Story = StoryObj<typeof Slur>;

// Above when stems point down, below when every stem points up
export const Directions: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Slur>
        <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      </Slur>
      <Slur>
        <Note pitch={{ step: "E", octave: 4 }} noteValue="eighth" />
        <Note pitch={{ step: "F", octave: 4 }} noteValue="eighth" />
      </Slur>
    </Measure>
  ),
};

// A slur that crosses a barline uses marker props instead of the wrapper:
// slur={{ start }} on the first note, slur={{ end }} on the last — the
// enclosing Staff draws the curve (splitting it at system breaks)
export const CrossMeasure: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        <Note
          pitch={{ step: "E", octave: 5 }}
          noteValue="quarter"
          slur={{ start: true }}
        />
        <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
      </Measure>
      <Measure barline="final">
        <Note pitch={{ step: "F", octave: 5 }} noteValue="half" />
        <Note
          pitch={{ step: "E", octave: 5 }}
          noteValue="half"
          slur={{ end: true }}
        />
      </Measure>
    </Staff>
  ),
};

// Slurring a beamed group: the slur takes the beam's stem direction into
// account and sits at the noteheads
export const OverBeams: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Slur>
        <BeamContainer>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
        </BeamContainer>
        <Note pitch={{ step: "G", octave: 5 }} noteValue="quarter" />
      </Slur>
      <Note rest noteValue="quarter" />
    </Measure>
  ),
};
