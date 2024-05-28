import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "./Staff";
import { Measure } from "./Measure";
import { Note } from "./Note";

const meta: Meta<typeof Staff> = {
  component: Staff,
};

export default meta;
type Story = StoryObj<typeof Staff>;

export const Primary: Story = {
  render: (args) => (
    <Staff>
      <Measure clef="gClef" fifths={3}>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure>
        <Note position="line-4" noteValue="half" />
        <Note position="line-4" noteValue="half" />
      </Measure>
    </Staff>
  ),
};
