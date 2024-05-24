import type { Meta, StoryObj } from "@storybook/react";
import type { TypeWithDeepControls } from "storybook-addon-deep-controls";

import { Measure } from "./Measure";
import { Note } from "./Note";

const singleDigits = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
];

const meta: TypeWithDeepControls<Meta<typeof Measure>> = {
  component: Measure,
  parameters: {
    deepControls: { enabled: true },
  },
  argTypes: {
    "time.beat": {
      control: "select",
      options: singleDigits,
    },
    "time.beatType": {
      control: "select",
      options: singleDigits,
    },
  },
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
