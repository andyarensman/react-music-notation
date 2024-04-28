import type { Meta, StoryObj } from "@storybook/react";

import { TimeSignature } from "./TimeSignature";

const meta: Meta<typeof TimeSignature> = {
  title: "Measure Meta/Time Signature",
  component: TimeSignature,
};

export default meta;
type Story = StoryObj<typeof TimeSignature>;

export const Primary: Story = {
  render: () => <TimeSignature />,
};
