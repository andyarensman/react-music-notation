import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 12 demo: grace notes and volta endings.
  - acciaccatura (slashed) and appoggiatura grace notes before notes and
    chords, spaced like accidentals
  - a repeated strain with first/second endings: the "1." bracket closes
    into the repeat barline, the "2." bracket stays open
  - the MusicXML importer maps <grace> and <ending> (second story)
*/
const meta: Meta = {
  title: "Demo/Phase 12",
};

export default meta;

const DemoScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "E", octave: 5 }}
        noteValue="quarter"
        grace={[{ pitch: { step: "D", octave: 5 }, slash: true }]}
      />
      <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="half"
        grace={[
          { pitch: { step: "A", octave: 4 } },
          { pitch: { step: "B", octave: 4 } },
        ]}
      />
    </Measure>
    <Measure>
      <BeamContainer>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
      </BeamContainer>
      <Note pitch={{ step: "E", octave: 5 }} noteValue="quarter" />
      <NoteStack
        noteValue="half"
        grace={[{ pitch: { step: "B", octave: 4 }, slash: true }]}
        pitches={[
          { pitch: { step: "C", octave: 5 } },
          { pitch: { step: "E", octave: 5 } },
        ]}
      />
    </Measure>
    {/* first ending: closed bracket into the repeat */}
    <Measure ending="1." barline="repeatEnd">
      <Note pitch={{ step: "D", octave: 5 }} noteValue="half" />
      <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
    </Measure>
    {/* second ending: open bracket, then the final measure */}
    <Measure ending={{ text: "2.", open: true }}>
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" />
      <Note pitch={{ step: "F", octave: 5 }} noteValue="half" />
    </Measure>
    <Measure barline="final">
      <Note pitch={{ step: "E", octave: 5 }} noteValue="whole" />
    </Measure>
  </Staff>
);

const GRACE_ENDING_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Violin</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>2</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <grace slash="yes"/>
        <pitch><step>F</step><octave>5</octave></pitch>
        <voice>1</voice><type>eighth</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <barline location="left"><ending number="1" type="start"/></barline>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>half</type>
      </note>
      <barline location="right">
        <ending number="1" type="stop"/>
        <repeat direction="backward"/>
      </barline>
    </measure>
    <measure number="3">
      <barline location="left"><ending number="2" type="start"/></barline>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>half</type>
      </note>
      <barline location="right">
        <ending number="2" type="discontinue"/>
        <bar-style>light-heavy</bar-style>
      </barline>
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

export const GracesAndEndings: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render({ staffSpace, containerWidth }) {
    return (
      <div
        style={
          {
            "--staff-space": `${staffSpace}px`,
            width: `${containerWidth}%`,
          } as React.CSSProperties
        }
      >
        <DemoScore />
      </div>
    );
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render({ staffSpace, containerWidth }) {
    return (
      <div
        style={
          {
            "--staff-space": `${staffSpace}px`,
            width: `${containerWidth}%`,
          } as React.CSSProperties
        }
      >
        <MusicXMLScore xml={GRACE_ENDING_XML} />
      </div>
    );
  },
};
