import type { Meta, StoryObj } from "@storybook/react";

import { Measure } from "./Measure";

const meta: Meta<typeof Measure> = {
  component: Measure,
};

export default meta;
type Story = StoryObj<typeof Measure>;

export const Primary: Story = {
  args: {
    clef: "gClef",
    fifths: 5,
    time: {
      beat: "four",
      beatType: "four",
    },
  },
};
