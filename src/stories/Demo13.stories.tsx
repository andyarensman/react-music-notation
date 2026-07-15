import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { BeamContainer } from "../components/BeamContainer";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 13 demo: slurs and ties across barlines and system breaks.
  - tie="start" on the last note of a measure now reaches the first note
    of the next measure; at a system break it splits into an outgoing and
    an incoming half-curve
  - slur markers (slur={{ start }} / slur={{ end }}) draw a slur between
    notes in different measures, one curve segment per system
  - the MusicXML importer routes cross-measure <slur> and <tie> boundaries
    onto the same machinery
*/
const meta: Meta = {
  title: "Demo/Phase 13",
};

export default meta;

const CrossMeasureScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
      {/* tied across the barline */}
      <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="start" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="stop" />
      {/* a slur that leaves this measure... */}
      <Note
        pitch={{ step: "F", octave: 5 }}
        noteValue="quarter"
        slur={{ start: true }}
      />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
    </Measure>
    <Measure barline="final">
      <BeamContainer>
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      {/* ...and lands here */}
      <Note
        pitch={{ step: "B", octave: 4 }}
        noteValue="half"
        slur={{ end: true }}
      />
    </Measure>
  </Staff>
);

// Narrow container: four measures break into two systems, with a tie and
// a slur both crossing the system break
const AcrossSystemsScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="half"
        slur={{ start: true }}
      />
      <Note pitch={{ step: "B", octave: 4 }} noteValue="half" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" tie="start" />
    </Measure>
    <Measure>
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" tie="stop" />
      <Note pitch={{ step: "D", octave: 5 }} noteValue="half" />
    </Measure>
    <Measure barline="final">
      <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
      <Note
        pitch={{ step: "B", octave: 4 }}
        noteValue="half"
        slur={{ end: true }}
      />
    </Measure>
  </Staff>
);

const CROSS_MEASURE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Flute</part-name></score-part>
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
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>half</type>
        <tie type="start"/>
        <notations><tied type="start"/></notations>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <tie type="stop"/>
        <notations><tied type="stop"/></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>half</type>
        <notations><slur type="stop" number="1"/></notations>
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

export const CrossMeasure: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<CrossMeasureScore />, args);
  },
};

export const AcrossSystems: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 45 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<AcrossSystemsScore />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={CROSS_MEASURE_XML} />, args);
  },
};
