import type { Meta, StoryObj } from "@storybook/react";

import { NoteStack } from "../components/NoteStack";
import { Measure } from "../components/Measure";
import { TypeWithDeepControls } from "storybook-addon-deep-controls";

const meta: Meta<typeof NoteStack> = {
  component: NoteStack,
  parameters: {
    deepControls: { enabled: true },
  },
};

export default meta;
type Story = StoryObj<typeof NoteStack>;

export const Primary: TypeWithDeepControls<Story> = {
  args: {
    noteValue: "half",
    pitches: [
      { position: "line-1" },
      { position: "line-2", pitch: { alter: "sharp" } },
      { position: "line-3" },
      { position: "space-4" },
    ],
  },
  argTypes: {
    noteValue: {
      control: "select",
      options: ["whole", "half", "quarter", "eighth", "16th"],
    },
    stem: {
      control: "select",
      options: [undefined, "upStem", "downStem"],
    },
    dotted: {
      control: "select",
      options: [undefined, 1],
    },
  },
  render: function Render(args) {
    return (
      <Measure>
        <NoteStack {...args} />
      </Measure>
    );
  },
};

// Adjacent seconds flip to the far side of the stem
export const Seconds: Story = {
  render: () => (
    <Measure clef="gClef">
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "C", octave: 4 } },
          { pitch: { step: "D", octave: 4 } },
          { pitch: { step: "A", octave: 4 } },
        ]}
      />
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "B", octave: 4 } },
          { pitch: { step: "C", octave: 5 } },
          { pitch: { step: "D", octave: 5 } },
        ]}
      />
      <NoteStack
        noteValue="whole"
        pitches={[
          { pitch: { step: "D", octave: 4 } },
          { pitch: { step: "E", octave: 4 } },
        ]}
      />
    </Measure>
  ),
};

// Accidentals stack into columns so they never collide
export const Accidentals: Story = {
  render: () => (
    <Measure clef="gClef">
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "C", octave: 4, alter: "sharp" } },
          { pitch: { step: "E", octave: 4, alter: "flat" } },
          { pitch: { step: "G", octave: 4, alter: "sharp" } },
        ]}
      />
      <NoteStack
        noteValue="half"
        pitches={[
          { pitch: { step: "C", octave: 4, alter: "sharp" } },
          { pitch: { step: "D", octave: 4, alter: "flat" } },
        ]}
      />
    </Measure>
  ),
};

// Unbeamed eighth/16th chords draw their own flag glyph
export const Flagged: Story = {
  render: () => (
    <Measure clef="gClef">
      <NoteStack
        noteValue="eighth"
        pitches={[
          { pitch: { step: "C", octave: 4 } },
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
        ]}
      />
      <NoteStack
        noteValue="16th"
        pitches={[
          { pitch: { step: "B", octave: 4 } },
          { pitch: { step: "D", octave: 5 } },
        ]}
      />
      <NoteStack
        noteValue="quarter"
        dotted={1}
        pitches={[
          { pitch: { step: "E", octave: 4 } },
          { pitch: { step: "G", octave: 4 } },
        ]}
      />
    </Measure>
  ),
};
