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

const meta: Meta<typeof Measure> = {
  component: Measure,
  parameters: {
    deepControls: { enabled: true },
  },
};

export default meta;

type Story = StoryObj<typeof Measure>;

export const TraditionalTime: TypeWithDeepControls<Story> = {
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
  render: function Render(args) {
    return <Measure {...args}>{args.children}</Measure>;
  },
};

export const SymbolTime: TypeWithDeepControls<Story> = {
  args: {
    clef: "gClef",
    fifths: 5,
    time: {
      timeSymbol: "common",
    },
    children: [
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
    ],
  },
  argTypes: {
    "time.timeSymbol": {
      control: "radio",
      options: ["common", "cut"],
    },
  },
  render: function Render(args) {
    return <Measure {...args}>{args.children}</Measure>;
  },
};
