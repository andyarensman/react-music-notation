import type { Meta, StoryObj } from "@storybook/react";
import type { TypeWithDeepControls } from "storybook-addon-deep-controls";

import { Measure } from "./Measure";
import { Note } from "./Note";

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
      beat: 4,
      beatType: 4,
    },
    children: [
      <Note
        position="space-1"
        noteValue="16th"
        stem="upStem"
        beam={{ amount: 2, status: "start" }}
      />,
      <Note
        position="space-1"
        noteValue="16th"
        stem="upStem"
        beam={{ amount: 1, status: "end" }}
      />,
      <Note
        position="space-1"
        noteValue="eighth"
        stem="upStem"
        beam={{ amount: 1, status: "start" }}
      />,
      <Note
        position="space-2"
        noteValue="eighth"
        stem="upStem"
        beam={{ amount: 1, status: "end" }}
      />,
      <Note position="line-3" noteValue="quarter" />,
      <Note position="line-3" noteValue="half" />,
    ],
  },
  argTypes: {
    "time.beat": {
      control: "number",
    },
    "time.beatType": {
      control: "number",
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
      <Note position="line-4" noteValue="half" />,
      <Note position="line-4" noteValue="half" />,
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
