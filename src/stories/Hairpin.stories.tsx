import type { Meta, StoryObj } from "@storybook/react";

import { Hairpin } from "../components/Hairpin";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";

const meta: Meta<typeof Hairpin> = {
  component: Hairpin,
};

export default meta;
type Story = StoryObj<typeof Hairpin>;

export const CrescendoDiminuendo: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Hairpin type="crescendo">
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" dynamic="p" />
        <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
      </Hairpin>
      <Hairpin type="diminuendo">
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" dynamic="f" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
      </Hairpin>
    </Measure>
  ),
};
