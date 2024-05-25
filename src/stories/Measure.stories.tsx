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
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
      <Note pitch={{ position: "line-4" }} noteValue="half" />,
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
