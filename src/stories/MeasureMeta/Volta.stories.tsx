import type { Meta, StoryObj } from "@storybook/react";

import { Volta } from "../../components/MeasureMeta/Volta";
import { Staff } from "../../components/Staff";
import { Measure } from "../../components/Measure";
import { Note } from "../../components/Note";

const meta: Meta<typeof Volta> = {
  title: "Measure Meta/Volta",
  component: Volta,
};

export default meta;
type Story = StoryObj<typeof Volta>;

// The standard repeat structure: a closed "1." bracket into the repeat
// barline, then an open "2." bracket over the continuation
export const FirstAndSecondEnding: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }} startRepeat>
        <Note position="space-3" noteValue="half" />
        <Note position="line-3" noteValue="half" />
      </Measure>
      <Measure ending="1." barline="repeatEnd">
        <Note position="space-2" noteValue="half" />
        <Note position="line-2" noteValue="half" />
      </Measure>
      <Measure ending={{ text: "2.", open: true }}>
        <Note position="space-2" noteValue="half" />
        <Note position="space-3" noteValue="half" />
      </Measure>
      <Measure barline="final">
        <Note position="line-3" noteValue="whole" />
      </Measure>
    </Staff>
  ),
};

// One ending spanning several measures: the label goes on the first
// measure (kept open on the right), middle measures continue the line,
// and the last measure closes the hook
export const MultiMeasureEnding: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Note position="space-3" noteValue="whole" />
      </Measure>
      <Measure ending={{ text: "1.", open: true }}>
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure ending={{ continues: true, open: true }}>
        <Note position="space-2" noteValue="whole" />
      </Measure>
      <Measure ending={{ continues: true }} barline="repeatEnd">
        <Note position="line-2" noteValue="whole" />
      </Measure>
    </Staff>
  ),
};

// A "1. 2." bracket (repeat both times) followed by a "3." — the label
// string carries whatever text the ending needs
export const CombinedNumbers: Story = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }} startRepeat>
        <Note position="line-3" noteValue="whole" />
      </Measure>
      <Measure ending="1. 2." barline="repeatEnd">
        <Note position="space-2" noteValue="whole" />
      </Measure>
      <Measure ending={{ text: "3.", open: true }}>
        <Note position="space-3" noteValue="whole" />
      </Measure>
      <Measure barline="final">
        <Note position="line-3" noteValue="whole" />
      </Measure>
    </Staff>
  ),
};
