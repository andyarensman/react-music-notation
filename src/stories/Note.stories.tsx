import type { Meta, StoryObj } from "@storybook/react";

import { Note } from "../components/Note";
import { Measure } from "../components/Measure";
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
        "line-above-2",
        "space-above-2",
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
        "space-below-2",
        "line-below-2",
      ],
    },
    noteValue: {
      control: "select",
      options: ["whole", "half", "quarter", "eighth", "16th", "32nd"],
    },
    dotted: {
      control: "select",
      options: [undefined, 1],
    },
    articulation: {
      control: "select",
      options: [
        undefined,
        "accent",
        "staccato",
        "tenuto",
        "staccatissimo",
        "marcato",
        "marcatoStaccato",
        "accentStaccato",
        "tenutoStaccato",
        "accentTenuto",
      ],
    },
    dynamic: {
      control: "select",
      options: [
        undefined,
        "pp",
        "p",
        "mp",
        "mf",
        "f",
        "ff",
        "fp",
        "sf",
        "sfz",
        "rf",
        "rfz",
      ],
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
