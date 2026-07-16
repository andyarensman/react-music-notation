import { describe, expect, it } from "vitest";
import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { TabNote } from "../components/TabNote";
import { Tuplet } from "../components/Tuplet";
import { Voice } from "../components/Voice";
import { extractPlaybackScore } from "./extract";

/*
  The Demo/Phase 21 extraction table, hand-verified against manual
  computation, locked in as assertions: D major (key applied without
  drawn accidentals), a tempo of quarter=60 (1s per beat), a triplet, a
  tie merged across the barline, a repeat whose first ending is skipped
  on the second pass, a grace stealing time, and a chord.
*/
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

describe("extractPlaybackScore", () => {
  it("reproduces the hand-verified timing/pitch table", () => {
    const score = extractPlaybackScore(DumpScore);
    const table = score.events.map((event) => [
      Number(event.timeSec.toFixed(3)),
      Number(event.durationSec.toFixed(3)),
      event.measureNumber,
      event.midi.join(","),
      event.grace,
    ]);
    expect(table).toEqual([
      [0, 1, 1, "74", false],
      [1, 1, 1, "78", false], // F# from the key signature
      [2, 0.667, 1, "69", false], // triplet: 2/3s each
      [2.667, 0.667, 1, "71", false],
      [3.333, 0.667, 1, "73", false], // C# from the key signature
      [4, 4, 2, "76", false], // tied halves merged
      [8, 1, 1, "74", false], // repeat pass 2
      [9, 1, 1, "78", false],
      [10, 0.667, 1, "69", false],
      [10.667, 0.667, 1, "71", false],
      [11.333, 0.667, 1, "73", false],
      [11.93, 0.07, 3, "76", true], // grace steals time before the chord
      [12, 4, 3, "74,78", false], // volta 1 skipped; chord in the 2nd ending
    ]);
    expect(score.durationSec).toBeCloseTo(16, 5);
  });

  it("honors repeats=false", () => {
    const score = extractPlaybackScore(DumpScore, { repeats: false });
    // all three measures once: 4 + 4 + 4 beats at 1s
    expect(score.durationSec).toBeCloseTo(12, 5);
    expect(
      score.events.filter((event) => event.measureNumber === 2).length
    ).toBe(1);
  });

  it("maps tablature through standard tuning and percussion to unpitched", () => {
    const score = extractPlaybackScore(
      <Staff>
        <Measure clef="tab" time={{ beat: 4, beatType: 4 }}>
          <TabNote noteValue="half" frets={[{ string: 6, fret: 3 }]} />
          <TabNote
            noteValue="half"
            frets={[
              { string: 1, fret: 0 },
              { string: 2, fret: 1 },
            ]}
          />
        </Measure>
        <Measure clef="percussion" barline="final">
          <Note position="space-above-1" noteValue="whole" />
        </Measure>
      </Staff>,
      { bpm: 120 }
    );
    expect(score.events.map((event) => event.midi)).toEqual([
      [43], // E2(40) + 3
      [60, 64], // B3(59)+1, E4(64)+0
      [], // percussion: unpitched
    ]);
    expect(score.durationSec).toBeCloseTo(4, 5); // 8 beats at 0.5s
  });

  it("keeps voices parallel and ties within their own voice", () => {
    const score = extractPlaybackScore(
      <Staff>
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }} barline="final">
          <Voice stem="upStem">
            <Note pitch={{ step: "E", octave: 5 }} noteValue="whole" />
          </Voice>
          <Voice stem="downStem">
            <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
            <Note pitch={{ step: "A", octave: 4 }} noteValue="half" />
          </Voice>
        </Measure>
      </Staff>,
      { bpm: 60 }
    );
    const byVoice = Object.fromEntries(
      score.events.map((event) => [
        `${event.voiceKey}@${event.timeSec}`,
        event.midi[0],
      ])
    );
    expect(byVoice).toEqual({
      "0:0@0": 76,
      "0:1@0": 72,
      "0:1@2": 69,
    });
  });
});
