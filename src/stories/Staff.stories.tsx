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
      <Measure clef="gClef" fifths={3} time={{ beat: 4, beatType: 4 }}>
        <Note position="line-2" noteValue="quarter" />
        <Note position="line-2" noteValue="quarter" />
        <Note position="line-4" noteValue="half" />
      </Measure>
      <Measure time={{ beat: 3, beatType: 4 }}>
        <Note position="line-4" noteValue="half" />
        <Note position="space-4" noteValue="quarter" />
      </Measure>
      <Measure time={{ beat: 4, beatType: 4 }}>
        <Note position="line-2" noteValue="quarter" />
        <Note position="line-3" noteValue="quarter" />
        <Note position="line-4" noteValue="quarter" />
        <Note position="line-5" noteValue="quarter" />
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
