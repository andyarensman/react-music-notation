import type { Meta, StoryObj } from "@storybook/react";

import { Note } from "./Note";

const meta: Meta<typeof Note> = {
  component: Note,
};

export default meta;
type Story = StoryObj<typeof Note>;

export const Primary: Story = {
  args: {
    pitch: {
      step: "A",
      octave: 4,
      position: "line-3",
    },
    noteValue: "half",
  },
};
