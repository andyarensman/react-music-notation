import type { Meta, StoryObj } from "@storybook/react";

import { Measure } from "./Measure";

const meta: Meta<typeof Measure> = {
  component: Measure,
};

export default meta;
type Story = StoryObj<typeof Measure>;

export const Primary: Story = {
  render: () => <Measure />,
};
