import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { Tuplet } from "../components/Tuplet";
import {
  extractPlaybackScore,
  usePlayback,
  PlaybackEvent,
} from "../playback";
import { NoteProps } from "../helpers/types";

/*
  Phase 21 demo: playback (react-music-notation/playback).
  - extractPlaybackScore walks the same element tree you render into a
    timed event list: tempo marks, repeats + voltas, ties (merged),
    tuplets, grace notes, key signatures with accidental carry
  - usePlayback schedules it on the built-in Web Audio synth and reports
    each event as it sounds — here wired to `selected` for a cursor
  - the ExtractionDump story prints the raw events for a score with a
    repeat, a volta pair, a tuplet, a cross-measure tie, and a grace
*/
const meta: Meta = {
  title: "Demo/Phase 21",
};

export default meta;

/* ------------------------------ Player ------------------------------ */

type Spec = Partial<NoteProps> & { noteValue: NoteProps["noteValue"] };

const MELODY: Spec[][] = [
  [
    { pitch: { step: "D", octave: 5 }, noteValue: "quarter" },
    { pitch: { step: "E", octave: 5 }, noteValue: "quarter" },
    { pitch: { step: "F", octave: 5 }, noteValue: "quarter" },
    {
      pitch: { step: "G", octave: 5 },
      noteValue: "quarter",
      grace: [{ pitch: { step: "F", octave: 5 }, slash: true }],
    },
  ],
  [
    { pitch: { step: "A", octave: 5 }, noteValue: "half", tie: "start" },
    { pitch: { step: "A", octave: 5 }, noteValue: "half", tie: "stop" },
  ],
  [
    { pitch: { step: "B", octave: 5 }, noteValue: "quarter" },
    { pitch: { step: "G", octave: 5 }, noteValue: "quarter" },
    { pitch: { step: "F", octave: 5 }, noteValue: "half" },
  ],
];

const buildMelody = (active: number[]) => {
  let index = 0;
  return (
    <Staff>
      {MELODY.map((specs, measureIndex) => (
        <Measure
          key={measureIndex}
          clef={measureIndex === 0 ? "gClef" : undefined}
          fifths={measureIndex === 0 ? 2 : undefined}
          time={measureIndex === 0 ? { beat: 4, beatType: 4 } : undefined}
          tempo={measureIndex === 0 ? { beatUnit: "quarter", bpm: 100 } : undefined}
          barline={measureIndex === MELODY.length - 1 ? "final" : undefined}
        >
          {specs.map((spec) => {
            const noteIndex = index++;
            return (
              <Note
                key={noteIndex}
                {...(spec as NoteProps)}
                selected={active.includes(noteIndex)}
              />
            );
          })}
        </Measure>
      ))}
    </Staff>
  );
};

const Player = () => {
  const [active, setActive] = useState<number[]>([]);
  const [status, setStatus] = useState("ready");
  const score = useMemo(() => extractPlaybackScore(buildMelody([])), []);
  const { play, stop, isPlaying } = usePlayback(score, {
    onEvent: (event) => {
      setActive(event?.noteIndices ?? []);
      setStatus(
        event
          ? `measure ${event.measureNumber} · midi [${event.midi.join(", ")}] · ${event.durationSec.toFixed(2)}s`
          : "ready"
      );
    },
  });
  return (
    <div>
      {buildMelody(active)}
      <div style={{ fontFamily: "system-ui, sans-serif", fontSize: 14, marginTop: 12 }}>
        <button onClick={isPlaying ? stop : play} style={{ padding: "4px 16px" }}>
          {isPlaying ? "Stop" : "Play"}
        </button>
        <span style={{ marginLeft: 12 }}>{status}</span>
        <span style={{ marginLeft: 12, opacity: 0.6 }}>
          {score.events.length} events · {score.durationSec.toFixed(1)}s
        </span>
      </div>
    </div>
  );
};

export const Player_: StoryObj = {
  name: "Player",
  render: function Render() {
    return <Player />;
  },
};

/* -------------------------- Extraction dump ------------------------- */

// bpm 60 (quarter = 1s) for hand-checkable numbers; a repeat with 1st/2nd
// endings, a triplet, a tie merged across the barline, and a grace note
const DumpScore = (
  <Staff>
    <Measure
      clef="gClef"
      fifths={2}
      time={{ beat: 4, beatType: 4 }}
      tempo={{ beatUnit: "quarter", bpm: 60 }}
      startRepeat
    >
      <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
      <Note pitch={{ step: "F", octave: 5 }} noteValue="quarter" />
      <Tuplet ratio={[3, 2]}>
        <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
      </Tuplet>
    </Measure>
    <Measure ending="1." barline="repeatEnd">
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" tie="start" />
      <Note pitch={{ step: "E", octave: 5 }} noteValue="half" tie="stop" />
    </Measure>
    <Measure ending={{ text: "2.", open: true }} barline="final">
      <NoteStack
        noteValue="whole"
        grace={[{ pitch: { step: "E", octave: 5 } }]}
        pitches={[
          { pitch: { step: "D", octave: 5 } },
          { pitch: { step: "F", octave: 5 } },
        ]}
      />
    </Measure>
  </Staff>
);

const ExtractionDump = () => {
  const score = useMemo(() => extractPlaybackScore(DumpScore), []);
  const line = (event: PlaybackEvent, index: number) =>
    `#${index} t=${event.timeSec.toFixed(3)} d=${event.durationSec.toFixed(3)} m${event.measureNumber} midi=[${event.midi.join(",")}]${event.grace ? " grace" : ""}`;
  return (
    <div>
      {DumpScore}
      <pre
        data-testid="playback-dump"
        style={{ fontSize: 13, lineHeight: 1.5 }}
      >
        {`total=${score.durationSec.toFixed(3)}s events=${score.events.length}\n`}
        {score.events.map(line).join("\n")}
      </pre>
    </div>
  );
};

export const ExtractionDump_: StoryObj = {
  name: "ExtractionDump",
  render: function Render() {
    return <ExtractionDump />;
  },
};
