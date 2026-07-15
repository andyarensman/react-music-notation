import type { Meta, StoryObj } from "@storybook/react";

import { Ottava } from "../components/Ottava";
import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";

const meta: Meta<typeof Ottava> = {
  component: Ottava,
};

export default meta;
type Story = StoryObj<typeof Ottava>;

// The four octave lines. Pitches are written at their sounding octave;
// the wrapper re-octaves the staff positions beneath the line.
export const Types: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Ottava type="8va">
          <Note pitch={{ step: "C", octave: 6 }} noteValue="half" />
          <Note pitch={{ step: "E", octave: 6 }} noteValue="half" />
        </Ottava>
      </Measure>
      <Measure>
        <Ottava type="15ma">
          <Note pitch={{ step: "C", octave: 7 }} noteValue="half" />
          <Note pitch={{ step: "E", octave: 7 }} noteValue="half" />
        </Ottava>
      </Measure>
      <Measure clef="fClef">
        <Ottava type="8vb">
          <Note pitch={{ step: "E", octave: 2 }} noteValue="half" />
          <Note pitch={{ step: "C", octave: 2 }} noteValue="half" />
        </Ottava>
      </Measure>
      <Measure barline="final">
        <Ottava type="15mb">
          <Note pitch={{ step: "E", octave: 1 }} noteValue="half" />
          <Note pitch={{ step: "C", octave: 1 }} noteValue="half" />
        </Ottava>
      </Measure>
    </Staff>
  ),
};
