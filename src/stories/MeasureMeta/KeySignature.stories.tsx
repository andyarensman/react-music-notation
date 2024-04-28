import type { Meta, StoryObj } from "@storybook/react";

import { KeySignature } from "./KeySignature";

const meta: Meta<typeof KeySignature> = {
  title: "Measure Meta/Key Signature",
  component: KeySignature,
};

export default meta;
type Story = StoryObj<typeof KeySignature>;

export const Primary: Story = {
  render: () => <KeySignature />,
};
