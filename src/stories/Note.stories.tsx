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
    pitch: {
      position: "line-3",
    },
    noteValue: "half",
  },
  argTypes: {
    "pitch.position": {
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
  },
  render: function Render(args) {
    return (
      <Measure>
        <Note {...args} />
      </Measure>
    );
  },
};
