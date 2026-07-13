import type { Meta, StoryObj } from "@storybook/react";

import { Voice } from "./Voice";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { BeamContainer } from "./BeamContainer";

const meta: Meta<typeof Voice> = {
  component: Voice,
};

export default meta;
type Story = StoryObj<typeof Voice>;

// Two rhythmically independent voices on one staff: stems forced up/down,
// events aligned on the measure's shared onset grid
export const TwoVoices: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Voice stem="upStem">
        <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        <BeamContainer>
          <Note pitch={{ step: "E", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "G", octave: 5 }} noteValue="eighth" />
          <Note pitch={{ step: "F", octave: 5 }} noteValue="eighth" />
        </BeamContainer>
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="half" />
      </Voice>
    </Measure>
  ),
};

// Rests default high in the up voice and low in the down voice
export const VoiceRests: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Voice stem="upStem">
        <Note rest noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "F", octave: 5 }} noteValue="half" />
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        <Note rest noteValue="quarter" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="half" />
      </Voice>
    </Measure>
  ),
};
