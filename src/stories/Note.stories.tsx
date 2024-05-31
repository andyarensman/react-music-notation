import type { Meta, StoryObj } from "@storybook/react";

import { Note } from "./Note";
import { Measure } from "./Measure";
import { TypeWithDeepControls } from "storybook-addon-deep-controls";

const meta: Meta<typeof Note> = {
  component: Note,
  parameters: {
    deepControls: { enabled: true },
  },
};

export default meta;
type Story = StoryObj<typeof Note>;

export const Primary: TypeWithDeepControls<Story> = {
  args: {
    position: "line-3",
    noteValue: "half",
    rest: false,
  },
  argTypes: {
    position: {
      control: "select",
      options: [
        "line-above-1",
        "space-above-1",
        "line-5",
        "space-4",
        "line-4",
        "space-3",
        "line-3",
        "space-2",
        "line-2",
        "space-1",
        "line-1",
        "space-below-1",
        "line-below-1",
      ],
    },
    noteValue: {
      control: "select",
      options: ["whole", "half", "quarter", "eighth", "16th"],
    },
    "pitch.alter": {
      control: "select",
      options: ["sharp", "flat", "natural", "doubleSharp", "doubleFlat"],
    },
  },
  render: function Render(args) {
    return (
      <Measure>
        <Note {...args} />
      </Measure>
    );
  },
};
