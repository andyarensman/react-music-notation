import type { Meta, StoryObj } from "@storybook/react";

import { Barline } from "../../components/MeasureMeta/Barline";
import { Staff } from "../../components/Staff";
import { Measure } from "../../components/Measure";
import { Note } from "../../components/Note";

const meta: Meta<typeof Barline> = {
  title: "Measure Meta/Barline",
  component: Barline,
};

export default meta;
type Story = StoryObj<typeof Barline>;

export const Types: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure barline="double">
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure startRepeat>
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure barline="repeatEnd">
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure barline="final">
        <Note position="line-3" noteValue="whole" />
      </Measure>
    </Staff>
  ),
};
