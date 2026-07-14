import type { Meta, StoryObj } from "@storybook/react";

import { Score } from "../components/Score";
import { ScoreMeasure } from "../components/ScoreMeasure";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";

const meta: Meta<typeof Score> = {
  component: Score,
};

export default meta;
type Story = StoryObj<typeof Score>;

// Two single-staff instruments sharing an onset grid and barlines
export const Duet: Story = {
  render: () => (
    <Score partNames={["Violin", "Cello"]}>
      <ScoreMeasure
        parts={[
          <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
            <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
          </Measure>,
          <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
            <Note pitch={{ step: "C", octave: 3 }} noteValue="half" />
            <Note pitch={{ step: "G", octave: 2 }} noteValue="half" />
          </Measure>,
        ]}
      />
      <ScoreMeasure
        barline="final"
        parts={[
          <Measure>
            <Note pitch={{ step: "C", octave: 5 }} noteValue="whole" />
          </Measure>,
          <Measure>
            <Note pitch={{ step: "C", octave: 3 }} noteValue="whole" />
          </Measure>,
        ]}
      />
    </Score>
  ),
};
