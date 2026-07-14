import type { Meta, StoryObj } from "@storybook/react";

import { Tuplet } from "../components/Tuplet";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { BeamContainer } from "../components/BeamContainer";

const meta: Meta<typeof Tuplet> = {
  component: Tuplet,
};

export default meta;
type Story = StoryObj<typeof Tuplet>;

// An eighth-note triplet (beamed), a quarter-note triplet (bracketed), and
// a straight quarter to fill the 4/4 measure
export const Triplets: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Tuplet ratio={[3, 2]}>
        <BeamContainer>
          <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
        </BeamContainer>
      </Tuplet>
      <Tuplet ratio={[3, 2]}>
        <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      </Tuplet>
      <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
    </Measure>
  ),
};

// The bracket can sit below the notes instead
export const BelowPosition: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 2, beatType: 4 }}>
      <Tuplet ratio={[3, 2]} position="below">
        <Note pitch={{ step: "E", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "F", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
      </Tuplet>
    </Measure>
  ),
};
