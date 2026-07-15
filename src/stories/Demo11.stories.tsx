import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 11 demo: lyrics.
  - syllables centered under their noteheads, one line per verse
  - hyphens between the parts of split words (syllabic begin/middle)
  - long syllables widen their note's slot so neighboring lyrics never
    collide (the spacing engine reads the same estimate)
  - the MusicXML importer maps <lyric> elements (second story)
*/
const meta: Meta = {
  title: "Demo/Phase 11",
};

export default meta;

const SongScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "Sing", syllabic: "begin" }, { text: "Voi", syllabic: "begin" }]}
      />
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "ing", syllabic: "end" }, { text: "ces", syllabic: "end" }]}
      />
      <Note
        pitch={{ step: "F", octave: 4 }}
        noteValue="quarter"
        lyrics={["in", { text: "car", syllabic: "begin" }]}
      />
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="quarter"
        lyrics={["the", { text: "ry", syllabic: "end" }]}
      />
    </Measure>
    <Measure>
      <Note
        pitch={{ step: "G", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "mor", syllabic: "begin" }, "soft"]}
      />
      <Note
        pitch={{ step: "F", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "ning", syllabic: "end" }, "and"]}
      />
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        lyrics={["light", "clear"]}
      />
      <Note
        pitch={{ step: "D", octave: 4 }}
        noteValue="quarter"
        lyrics={["we", { text: "a", syllabic: "begin" }]}
      />
    </Measure>
    <Measure>
      <Note
        pitch={{ step: "C", octave: 4 }}
        noteValue="quarter"
        lyrics={["rise", { text: "cross", syllabic: "end" }]}
      />
      <Note
        pitch={{ step: "C", octave: 4 }}
        noteValue="quarter"
        lyrics={["to", "the"]}
      />
      <Note
        pitch={{ step: "D", octave: 4 }}
        noteValue="quarter"
        lyrics={["greet", { text: "qui", syllabic: "begin" }]}
      />
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        lyrics={["the", { text: "et", syllabic: "end" }]}
      />
    </Measure>
    <Measure barline="final">
      <Note
        pitch={{ step: "E", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "gold", syllabic: "begin" }, { text: "si", syllabic: "begin" }]}
      />
      <Note
        pitch={{ step: "D", octave: 4 }}
        noteValue="quarter"
        lyrics={[{ text: "en", syllabic: "end" }, { text: "lent", syllabic: "end" }]}
      />
      <Note
        pitch={{ step: "D", octave: 4 }}
        noteValue="half"
        lyrics={["day.", "vale."]}
      />
    </Measure>
  </Staff>
);

const LYRIC_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Soprano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type>
        <lyric number="1"><syllabic>begin</syllabic><text>Glo</text></lyric>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type>
        <lyric number="1"><syllabic>middle</syllabic><text>ri</text></lyric>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>8</duration><voice>1</voice><type>half</type>
        <lyric number="1"><syllabic>end</syllabic><text>a</text></lyric>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>half</type>
        <lyric number="1"><syllabic>single</syllabic><text>shines</text></lyric>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>8</duration><voice>1</voice><type>half</type>
        <lyric number="1"><syllabic>single</syllabic><text>bright.</text></lyric>
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

export const TwoVerses: StoryObj<DemoArgs> = {
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
        <SongScore />
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
        <MusicXMLScore xml={LYRIC_XML} />
      </div>
    );
  },
};
