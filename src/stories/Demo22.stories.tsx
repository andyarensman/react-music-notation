import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 22 demo: mid-measure clef changes.
  clefChange on a note draws a small clef before it and re-resolves that
  note and everything after it against the new clef — through the rest
  of the measure AND into following measures (the running clef carries),
  until the next clef. The cello-register line below starts in bass,
  climbs, switches to treble mid-measure, and stays in treble for m2
  (which restates nothing).
*/
const meta: Meta = {
  title: "Demo/Phase 22",
};

export default meta;

const CelloLine = () => (
  <Staff>
    <Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
      <Note pitch={{ step: "G", octave: 3 }} noteValue="quarter" />
      {/* treble takes over here */}
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        clefChange="gClef"
      />
      <Note pitch={{ step: "G", octave: 4 }} noteValue="quarter" />
    </Measure>
    <Measure>
      {/* still treble: inherited from the mid-measure change */}
      <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
      {/* and back to bass mid-measure */}
      <Note
        pitch={{ step: "G", octave: 3 }}
        noteValue="half"
        clefChange="fClef"
      />
    </Measure>
    <Measure barline="final">
      <Note pitch={{ step: "C", octave: 3 }} noteValue="whole" />
    </Measure>
  </Staff>
);

const MID_CLEF_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Cello</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>3</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>3</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <attributes>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>whole</type>
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

export const MidMeasureClefs: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<CelloLine />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={MID_CLEF_XML} />, args);
  },
};
