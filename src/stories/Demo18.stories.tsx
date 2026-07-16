import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { TabNote } from "../components/TabNote";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 18 demo: guitar tablature.
  - clef="tab" draws the TAB lettering on a six-line staff (barlines span
    all six string lines; the measure keeps its normal height)
  - TabNote prints fret numbers on their string lines and takes part in
    the same duration-proportional spacing as ordinary notes, so tab
    measures break into systems like any others
  - rhythm-less tab (no stems yet); MusicXML <string>/<fret> under a TAB
    clef import automatically
*/
const meta: Meta = {
  title: "Demo/Phase 18",
};

export default meta;

// An E-minor arpeggio phrase and an open-position E minor chord
const TabScore = () => (
  <Staff>
    <Measure clef="tab" time={{ beat: 4, beatType: 4 }}>
      <TabNote noteValue="quarter" frets={[{ string: 6, fret: 0 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 5, fret: 2 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 4, fret: 2 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 3, fret: 0 }]} />
    </Measure>
    <Measure>
      <TabNote noteValue="eighth" frets={[{ string: 2, fret: 0 }]} />
      <TabNote noteValue="eighth" frets={[{ string: 1, fret: 0 }]} />
      <TabNote noteValue="eighth" frets={[{ string: 2, fret: 0 }]} />
      <TabNote noteValue="eighth" frets={[{ string: 3, fret: 0 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 4, fret: 2 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 5, fret: 2 }]} />
    </Measure>
    <Measure barline="final">
      <TabNote noteValue="quarter" frets={[{ string: 6, fret: 12 }]} />
      <TabNote noteValue="quarter" frets={[{ string: 5, fret: 10 }]} />
      <TabNote
        noteValue="half"
        frets={[
          { string: 6, fret: 0 },
          { string: 5, fret: 2 },
          { string: 4, fret: 2 },
          { string: 3, fret: 0 },
          { string: 2, fret: 0 },
          { string: 1, fret: 0 },
        ]}
      />
    </Measure>
  </Staff>
);

const TAB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Guitar</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>TAB</sign><line>5</line></clef>
      </attributes>
      <note>
        <pitch><step>G</step><octave>2</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notations><technical><string>6</string><fret>3</fret></technical></notations>
      </note>
      <note>
        <pitch><step>B</step><octave>2</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notations><technical><string>5</string><fret>2</fret></technical></notations>
      </note>
      <note>
        <pitch><step>D</step><octave>3</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notations><technical><string>4</string><fret>0</fret></technical></notations>
      </note>
      <note>
        <pitch><step>G</step><octave>3</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notations><technical><string>3</string><fret>0</fret></technical></notations>
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

export const Tablature: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<TabScore />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={TAB_XML} />, args);
  },
};
