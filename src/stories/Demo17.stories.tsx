import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { Voice } from "../components/Voice";
import { BeamContainer } from "../components/BeamContainer";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 17 demo: percussion notation.
  - the percussion clef; unpitched writing places notes with `position`
    (or MusicXML display-step/octave, which map like treble)
  - alternative noteheads: x (hi-hat/cymbals), circle-x (open hi-hat),
    diamond (ride bell/harmonics), triangle — drawn with separate stems,
    beamed or flagged like any note
  - a drum-kit groove: two voices, hi-hat x-heads up-stem over kick and
    snare down-stem
*/
const meta: Meta = {
  title: "Demo/Phase 17",
};

export default meta;

// hi-hat above the top line, snare in space 3, kick in space 1
const HI_HAT = "space-above-1" as const;
const SNARE = "space-3" as const;
const KICK = "space-1" as const;

const DrumKitScore = () => (
  <Staff>
    <Measure clef="percussion" time={{ beat: 4, beatType: 4 }}>
      <Voice stem="upStem">
        <BeamContainer>
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
        </BeamContainer>
        <BeamContainer>
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
        </BeamContainer>
        <BeamContainer>
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
          <Note position={HI_HAT} notehead="x" noteValue="eighth" />
        </BeamContainer>
        <Note position={HI_HAT} notehead="circleX" noteValue="quarter" />
      </Voice>
      <Voice stem="downStem">
        <Note position={KICK} noteValue="quarter" />
        <Note position={SNARE} noteValue="quarter" />
        <Note position={KICK} noteValue="quarter" />
        <Note position={SNARE} noteValue="quarter" />
      </Voice>
    </Measure>
    <Measure barline="final">
      <Note position={SNARE} noteValue="quarter" />
      <Note position="line-3" notehead="diamond" noteValue="quarter" />
      <Note position="space-4" notehead="triangle" noteValue="quarter" />
      <NoteStack
        noteValue="quarter"
        pitches={[
          { position: KICK },
          { position: HI_HAT, notehead: "x" },
        ]}
      />
    </Measure>
  </Staff>
);

// Alternative heads across durations (halves/wholes fall back to the black
// form except diamonds, which Leland covers fully)
const NoteheadsScore = () => (
  <Staff>
    <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
      <Note pitch={{ step: "B", octave: 4 }} notehead="x" noteValue="quarter" />
      <Note pitch={{ step: "B", octave: 4 }} notehead="x" noteValue="eighth" />
      <Note
        pitch={{ step: "B", octave: 4 }}
        notehead="circleX"
        noteValue="quarter"
      />
      <Note
        pitch={{ step: "D", octave: 5 }}
        notehead="triangle"
        noteValue="quarter"
      />
      <Note
        pitch={{ step: "G", octave: 4 }}
        notehead="diamond"
        noteValue="eighth"
      />
    </Measure>
    <Measure barline="final">
      <Note
        pitch={{ step: "G", octave: 4 }}
        notehead="diamond"
        noteValue="quarter"
      />
      <Note
        pitch={{ step: "B", octave: 4 }}
        notehead="diamond"
        noteValue="half"
      />
      <Note
        pitch={{ step: "D", octave: 5 }}
        notehead="diamond"
        noteValue="whole"
      />
    </Measure>
  </Staff>
);

const DRUM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Drum Set</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>percussion</sign></clef>
      </attributes>
      <note>
        <unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched>
        <duration>1</duration><voice>1</voice><type>eighth</type>
        <notehead>x</notehead>
        <beam number="1">begin</beam>
      </note>
      <note>
        <unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched>
        <duration>1</duration><voice>1</voice><type>eighth</type>
        <notehead>x</notehead>
        <beam number="1">end</beam>
      </note>
      <note>
        <unpitched><display-step>C</display-step><display-octave>5</display-octave></unpitched>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <unpitched><display-step>G</display-step><display-octave>5</display-octave></unpitched>
        <duration>2</duration><voice>1</voice><type>quarter</type>
        <notehead>circle-x</notehead>
      </note>
      <note>
        <unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched>
        <duration>2</duration><voice>1</voice><type>quarter</type>
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

export const DrumKit: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<DrumKitScore />, args);
  },
};

export const AlternativeNoteheads: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<NoteheadsScore />, args);
  },
};

export const FromMusicXML: StoryObj<DemoArgs> = {
  args: { staffSpace: 8, containerWidth: 100 },
  argTypes: demoArgTypes,
  render: function Render(args) {
    return wrap(<MusicXMLScore xml={DRUM_XML} />, args);
  },
};
