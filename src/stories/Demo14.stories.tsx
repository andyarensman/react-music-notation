import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { Voice } from "../components/Voice";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 14 demo: two-voice collision handling (Gould, "Two voices on one
  stave"). When simultaneous notes sit a second apart or in unison, the
  down-stem voice's note shifts right of the up-stem note:
  - m1: a second (shift), then a same-value unison (superimposed heads +
    two stems read as the engravers' shared notehead — no shift)
  - m2: a mixed-value unison (half vs quarter: heads can't merge, shift)
  - m3: a whole-note unison (wholes never merge; wider shift)
  - m4: a dotted up-voice note (the shift also clears the dot)
  - m5: chords a second apart, then chords sharing a unison
*/
const meta: Meta = {
  title: "Demo/Phase 14",
};

export default meta;

const CollisionScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Voice stem="upStem">
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "E", octave: 5 }} noteValue="half" />
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
      </Voice>
    </Measure>
    <Measure>
      <Voice stem="upStem">
        <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="half" />
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "F", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 4 }} noteValue="half" />
      </Voice>
    </Measure>
    <Measure>
      <Voice stem="upStem">
        <Note pitch={{ step: "B", octave: 4 }} noteValue="whole" />
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "B", octave: 4 }} noteValue="whole" />
      </Voice>
    </Measure>
    <Measure>
      <Voice stem="upStem">
        <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" dotted={1} />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
      </Voice>
      <Voice stem="downStem">
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" dotted={1} />
        <Note pitch={{ step: "E", octave: 4 }} noteValue="eighth" />
        <Note pitch={{ step: "F", octave: 4 }} noteValue="half" />
      </Voice>
    </Measure>
    <Measure barline="final">
      <Voice stem="upStem">
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "C", octave: 5 } },
            { pitch: { step: "E", octave: 5 } },
          ]}
        />
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "G", octave: 4 } },
            { pitch: { step: "C", octave: 5 } },
          ]}
        />
      </Voice>
      <Voice stem="downStem">
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "B", octave: 4 } },
            { pitch: { step: "D", octave: 5 } },
          ]}
        />
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "E", octave: 4 } },
            { pitch: { step: "G", octave: 4 } },
          ]}
        />
      </Voice>
    </Measure>
  </Staff>
);

const TWO_VOICE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Choir</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>half</type>
      </note>
      <backup><duration>8</duration></backup>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>2</duration><voice>2</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>2</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>4</duration><voice>2</voice><type>half</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

interface DemoArgs {
  staffSpace: number;
  containerWidth: number;
}

const demoArgTypes = {
  staffSpace: {
    control: { type: "range", min: 4, max: 16, step: 1 },
    description: "The --staff-space size knob, in px",
  },
  containerWidth: {
    control: { type: "range", min: 25, max: 100, step: 5 },
    description: "Container width % — systems re-break to fit",
  },
} as const;

const wrap = (
  content: React.ReactNode,
  { staffSpace, containerWidth }: DemoArgs
) => (
  <div
    style={
      {
        "--staff-space": `${staffSpace}px`,
        width: `${containerWidth}%`,
      } as React.CSSProperties
    }
  >
    {content}
  </div>
);

export const VoiceCollisions: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<CollisionScore />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={TWO_VOICE_XML} />, args);
  },
};
