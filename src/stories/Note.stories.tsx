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
        "line-above-4",
        "space-above-4",
        "line-above-3",
        "space-above-3",
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
        "space-below-3",
        "line-below-3",
        "space-below-4",
        "line-below-4",
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

// Grace notes: slashed acciaccaturas and plain appoggiaturas, spaced like
// accidentals ahead of the host note (and ahead of its accidental)
export const GraceNotes: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "E", octave: 5 }}
        noteValue="quarter"
        grace={[{ pitch: { step: "D", octave: 5 }, slash: true }]}
      />
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="quarter"
        grace={[
          { pitch: { step: "A", octave: 4 } },
          { pitch: { step: "B", octave: 4 } },
        ]}
      />
      <Note
        pitch={{ step: "F", octave: 5, alter: "sharp" }}
        noteValue="half"
        grace={[{ pitch: { step: "E", octave: 5 }, slash: true }]}
      />
    </Measure>
  ),
};

// Lyrics: one entry per verse; syllabic "begin"/"middle" draws the hyphen
export const Lyrics: Story = {
  render: () => (
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "C", octave: 5 }}
        noteValue="quarter"
        lyrics={[{ text: "Glo", syllabic: "begin" }, "Sing"]}
      />
      <Note
        pitch={{ step: "D", octave: 5 }}
        noteValue="quarter"
        lyrics={[{ text: "ri", syllabic: "middle" }, "with"]}
      />
      <Note
        pitch={{ step: "E", octave: 5 }}
        noteValue="half"
        lyrics={[{ text: "a", syllabic: "end" }, "joy"]}
      />
    </Measure>
  ),
};

// The full renderable range: four ledger lines above and below the staff
export const LedgerRange: Story = {
  render: () => (
    <Measure clef="gClef">
      <Note position="line-above-4" noteValue="quarter" />
      <Note position="line-above-3" noteValue="quarter" />
      <Note position="line-above-2" noteValue="quarter" />
      <Note position="line-above-1" noteValue="quarter" />
      <Note position="line-3" noteValue="quarter" />
      <Note position="line-below-1" noteValue="quarter" />
      <Note position="line-below-2" noteValue="quarter" />
      <Note position="line-below-3" noteValue="quarter" />
      <Note position="line-below-4" noteValue="whole" />
    </Measure>
  ),
};
