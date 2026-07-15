import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { Ottava } from "../components/Ottava";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 15 demo: octave lines (8va/8vb/15ma). Notes keep their SOUNDING
  pitch; the Ottava wrapper draws them an octave (or two) closer to the
  staff and adds the dashed line with its label and closing hook.
  - m1: a high passage loco, drowning in ledger lines
  - m2: the same passage under 8va — same pitches, readable positions
  - m3: a 15ma chord passage (two octaves down on the staff)
  - m4: 8vb below a bass-clef measure
*/
const meta: Meta = {
  title: "Demo/Phase 15",
};

export default meta;

const OttavaScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "C", octave: 6 }} noteValue="quarter" />
      <Note pitch={{ step: "D", octave: 6 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 6 }} noteValue="half" />
    </Measure>
    <Measure>
      <Ottava type="8va">
        <Note pitch={{ step: "C", octave: 6 }} noteValue="quarter" />
        <Note pitch={{ step: "D", octave: 6 }} noteValue="quarter" />
        <Note pitch={{ step: "E", octave: 6 }} noteValue="half" />
      </Ottava>
    </Measure>
    <Measure>
      <Note pitch={{ step: "G", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
      <Ottava type="15ma">
        <NoteStack
          noteValue="half"
          pitches={[
            { pitch: { step: "C", octave: 7 } },
            { pitch: { step: "E", octave: 7 } },
          ]}
        />
      </Ottava>
    </Measure>
    <Measure clef="fClef" barline="final">
      <Ottava type="8vb">
        <Note pitch={{ step: "C", octave: 2 }} noteValue="quarter" />
        <Note pitch={{ step: "G", octave: 2 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 2 }} noteValue="half" />
      </Ottava>
    </Measure>
  </Staff>
);

const OTTAVA_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piccolo</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction>
        <direction-type><octave-shift type="down" size="8"/></direction-type>
      </direction>
      <note>
        <pitch><step>A</step><octave>6</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>6</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <direction>
        <direction-type><octave-shift type="stop" size="8"/></direction-type>
      </direction>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>half</type>
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

export const OctaveLines: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<OttavaScore />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={OTTAVA_XML} />, args);
  },
};
