import type { Meta, StoryObj } from "@storybook/react";

import { Measure } from "./Measure";
import { Note } from "./Note";

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
    children: [
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
    ],
  },
  render: function Render(args) {
    return <Measure {...args}>{args.children}</Measure>;
  },
};
