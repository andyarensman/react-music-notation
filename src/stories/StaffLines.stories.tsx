import type { Meta, StoryObj } from "@storybook/react";

import { StaffLines } from "./StaffLines";

const meta: Meta<typeof StaffLines> = {
  component: StaffLines,
};

export default meta;
type Story = StoryObj<typeof StaffLines>;

export const Primary: Story = {
  render: () => <StaffLines />,
};
