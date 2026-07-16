import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { MusicXMLScore } from "../musicxml";

/*
  Phase 20 demo: sounding pitch vs drawn accidental.
  MusicXML separates <alter> (sounding, on every altered note) from
  <accidental> (the drawn glyph). The importer now keeps them separate
  and reconciles against the key signature and the measure's earlier
  accidentals — so a D-major score no longer sprouts a sharp on every
  F#/C#, carried accidentals aren't re-drawn, and a plain <alter>0</alter>
  on a key-signature step earns an inferred natural.

  Expected glyphs below: ONLY a natural on m1's last note (C, sounding
  natural against the key's C#) and ONE sharp on m2's first G.
*/
const meta: Meta = {
  title: "Demo/Phase 20",
};

export default meta;

const D_MAJOR_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Violin</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><alter>1</alter><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><alter>0</alter><octave>5</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>G</step><alter>1</alter><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <accidental>sharp</accidental>
      </note>
      <note>
        <pitch><step>G</step><alter>1</alter><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
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

export const SoundingVsDrawn: StoryObj<DemoArgs> = {
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
        <MusicXMLScore xml={D_MAJOR_XML} />
      </div>
    );
  },
};
