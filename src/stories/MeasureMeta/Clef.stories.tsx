import type { Meta, StoryObj } from "@storybook/react";

import { Clef } from "./Clef";

const meta: Meta<typeof Clef> = {
  title: "Measure Meta/Clef",
  component: Clef,
};

export default meta;
type Story = StoryObj<typeof Clef>;

export const Primary: Story = {
  render: () => <Clef clef="gClef" />,
};
