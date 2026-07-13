import type { Meta, StoryObj } from "@storybook/react";

import { KeySignature } from "../../components/MeasureMeta/KeySignature";
import { Measure } from "../../components/Measure";

const meta: Meta<typeof KeySignature> = {
  title: "Measure Meta/Key Signature",
  component: KeySignature,
};

export default meta;
type Story = StoryObj<typeof KeySignature>;

export const Primary: Story = {
  args: {
    fifths: 3,
    clef: "gClef",
  },
  argTypes: {
    fifths: {
      control: { type: "range", min: -7, max: 7, step: 1 },
    },
    clef: {
      control: "select",
      options: ["gClef", "fClef", "cClef"],
    },
  },
  render: function Render({ fifths, clef }) {
    return <Measure clef={clef} fifths={fifths} />;
  },
};
