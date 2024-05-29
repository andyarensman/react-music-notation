import type { Meta, StoryObj } from "@storybook/react";

import { NoteStack } from "./NoteStack";
import { Measure } from "./Measure";
import { TypeWithDeepControls } from "storybook-addon-deep-controls";

const meta: Meta<typeof NoteStack> = {
  component: NoteStack,
  parameters: {
    deepControls: { enabled: true },
  },
};

export default meta;
type Story = StoryObj<typeof NoteStack>;

export const Primary: TypeWithDeepControls<Story> = {
  args: {
    noteValue: "half",
    pitches: [
      { position: "line-1" },
      { position: "line-2" },
      { position: "line-3" },
      { position: "space-4" },
    ],
  },
  argTypes: {
    noteValue: {
      control: "select",
      options: ["whole", "half", "quarter", "eighth", "16th"],
    },
  },
  render: function Render(args) {
    return (
      <Measure>
        <NoteStack {...args} />
      </Measure>
    );
  },
};
