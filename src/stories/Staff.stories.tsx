import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";

const meta: Meta<typeof Staff> = {
  component: Staff,
};

export default meta;
type Story = StoryObj<typeof Staff>;

export const Primary: Story = {
  render: () => <Staff />,
};
