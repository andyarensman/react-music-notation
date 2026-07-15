import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { MusicXMLScore } from "../musicxml";

/*
  Phase 10 demo: MusicXML import.
  Both scores below are real score-partwise MusicXML documents rendered by
  <MusicXMLScore> from react-music-notation/musicxml. The importer maps
  keys/times/clefs, beams, tuplets, slurs, ties, chords, voices, dynamics,
  wedges, tempo marks, articulations, and barlines — and reports everything
  it has to skip (the fermata in the melody shows up in the warnings list).
*/
const meta: Meta = {
  title: "Demo/Phase 10",
};

export default meta;

const MELODY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Flute</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>12</divisions>
        <key><fifths>2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <direction placement="above">
        <direction-type><words>Allegro</words></direction-type>
        <direction-type>
          <metronome><beat-unit>quarter</beat-unit><per-minute>112</per-minute></metronome>
        </direction-type>
      </direction>
      <direction placement="below">
        <direction-type><dynamics><p/></dynamics></direction-type>
      </direction>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>6</duration><voice>1</voice><type>eighth</type>
        <beam number="1">begin</beam>
        <notations><slur type="start" number="1"/></notations>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>6</duration><voice>1</voice><type>eighth</type>
        <beam number="1">continue</beam>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>5</octave></pitch>
        <duration>6</duration><voice>1</voice><type>eighth</type>
        <beam number="1">continue</beam>
      </note>
      <note>
        <pitch><step>G</step><octave>5</octave></pitch>
        <duration>6</duration><voice>1</voice><type>eighth</type>
        <beam number="1">end</beam>
        <notations><slur type="stop" number="1"/></notations>
      </note>
      <note>
        <pitch><step>A</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>quarter</type>
        <time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>
        <notations><tuplet type="start"/></notations>
      </note>
      <note>
        <pitch><step>G</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>quarter</type>
        <time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>quarter</type>
        <time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>
        <notations><tuplet type="stop"/></notations>
      </note>
    </measure>
    <measure number="2">
      <direction placement="below">
        <direction-type><wedge type="crescendo"/></direction-type>
      </direction>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>12</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>12</duration><voice>1</voice><type>quarter</type>
      </note>
      <direction placement="below">
        <direction-type><wedge type="stop"/></direction-type>
      </direction>
      <direction placement="below">
        <direction-type><dynamics><f/></dynamics></direction-type>
      </direction>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>5</octave></pitch>
        <duration>12</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>5</octave></pitch>
        <duration>12</duration><voice>1</voice><type>quarter</type>
        <notations><articulations><accent/></articulations></notations>
      </note>
      <barline location="right"><bar-style>light-light</bar-style></barline>
    </measure>
    <measure number="3">
      <note>
        <pitch><step>A</step><octave>5</octave></pitch>
        <duration>24</duration><voice>1</voice><type>half</type>
        <tie type="start"/><notations><tied type="start"/></notations>
      </note>
      <note>
        <pitch><step>A</step><octave>5</octave></pitch>
        <duration>24</duration><voice>1</voice><type>half</type>
        <tie type="stop"/>
        <notations><tied type="stop"/><fermata/></notations>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

const PIANO_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <staves>2</staves>
        <clef number="1"><sign>G</sign><line>2</line></clef>
        <clef number="2"><sign>F</sign><line>4</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>4</duration><voice>1</voice><type>quarter</type><staff>1</staff>
      </note>
      <backup><duration>16</duration></backup>
      <note>
        <pitch><step>C</step><octave>3</octave></pitch>
        <duration>8</duration><voice>2</voice><type>half</type><staff>2</staff>
      </note>
      <note>
        <chord/>
        <pitch><step>G</step><octave>3</octave></pitch>
        <duration>8</duration><voice>2</voice><type>half</type><staff>2</staff>
      </note>
      <note>
        <pitch><step>G</step><octave>2</octave></pitch>
        <duration>8</duration><voice>2</voice><type>half</type><staff>2</staff>
      </note>
      <note>
        <chord/>
        <pitch><step>D</step><octave>3</octave></pitch>
        <duration>8</duration><voice>2</voice><type>half</type><staff>2</staff>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>16</duration><voice>1</voice><type>whole</type><staff>1</staff>
      </note>
      <backup><duration>16</duration></backup>
      <note>
        <pitch><step>C</step><octave>2</octave></pitch>
        <duration>16</duration><voice>2</voice><type>whole</type><staff>2</staff>
      </note>
      <note>
        <chord/>
        <pitch><step>C</step><octave>3</octave></pitch>
        <duration>16</duration><voice>2</voice><type>whole</type><staff>2</staff>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

const ImportedScore = ({ xml }: { xml: string }) => {
  const [warnings, setWarnings] = useState<string[]>([]);
  return (
    <div>
      <MusicXMLScore xml={xml} onWarnings={setWarnings} />
      {warnings.length > 0 && (
        <div
          style={{
            marginTop: "2rem",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#8a6d00",
          }}
        >
          <strong>Importer skipped:</strong>
          <ul>
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

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

export const Melody: StoryObj<DemoArgs> = {
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
        <ImportedScore xml={MELODY_XML} />
      </div>
    );
  },
};

export const Piano: StoryObj<DemoArgs> = {
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
        <ImportedScore xml={PIANO_XML} />
      </div>
    );
  },
};
