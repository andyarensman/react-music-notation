import type { Meta, StoryObj } from "@storybook/react";

import { GrandStaff } from "./GrandStaff";
import { GrandMeasure } from "./GrandMeasure";
import { Measure } from "./Measure";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";

const meta: Meta<typeof GrandStaff> = {
  component: GrandStaff,
};

export default meta;
type Story = StoryObj<typeof GrandStaff>;

export const Primary: Story = {
  render: () => (
    <GrandStaff>
      <GrandMeasure
        upper={
          <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
            <Note pitch={{ step: "E", octave: 4 }} noteValue="quarter" />
            <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
          </Measure>
        }
        lower={
          <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
            <NoteStack
              noteValue="half"
              pitches={[
                { pitch: { step: "C", octave: 3 } },
                { pitch: { step: "G", octave: 3 } },
              ]}
            />
            <NoteStack
              noteValue="half"
              pitches={[
                { pitch: { step: "G", octave: 2 } },
                { pitch: { step: "E", octave: 3 } },
              ]}
            />
          </Measure>
        }
      />
      <GrandMeasure
        barline="final"
        upper={
          <Measure>
            <Note pitch={{ step: "C", octave: 5 }} noteValue="whole" />
          </Measure>
        }
        lower={
          <Measure>
            <NoteStack
              noteValue="whole"
              pitches={[
                { pitch: { step: "C", octave: 2 } },
                { pitch: { step: "C", octave: 3 } },
              ]}
            />
          </Measure>
        }
      />
    </GrandStaff>
  ),
};
