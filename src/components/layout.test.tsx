import { describe, expect, it } from "vitest";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";
import { Slur } from "./Slur";
import { Tuplet } from "./Tuplet";
import { Voice } from "./Voice";
import {
  clefSequence,
  getEventFlex,
  getOnsetBoundaries,
  getVoiceCollisionShifts,
  gridTemplateFromBoundaries,
  lastClefChange,
  unionBoundaries,
} from "./layout";

describe("event flex and onsets", () => {
  it("sums beam groups, scales tuplets, sees through slurs", () => {
    expect(
      getEventFlex(
        <BeamContainer>
          <Note position="line-3" noteValue="eighth" />
          <Note position="line-3" noteValue="eighth" />
        </BeamContainer>
      )
    ).toBe(4);
    expect(
      getEventFlex(
        <Tuplet ratio={[3, 2]}>
          <Note position="line-3" noteValue="quarter" />
          <Note position="line-3" noteValue="quarter" />
          <Note position="line-3" noteValue="quarter" />
        </Tuplet>
      )
    ).toBe(8);
    const boundaries = getOnsetBoundaries([
      <Slur key="slur">
        <Note position="line-3" noteValue="quarter" />
        <Note position="line-3" noteValue="quarter" />
      </Slur>,
      <Note key="half" position="line-3" noteValue="half" />,
    ]);
    expect(boundaries).toEqual([0, 4, 8, 16]);
  });

  it("unions voice onsets and formats grid templates", () => {
    expect(unionBoundaries([0, 4, 8], [0, 6, 8])).toEqual([0, 4, 6, 8]);
    expect(gridTemplateFromBoundaries([0, 4, 6, 8])).toBe("4fr 2fr 2fr");
  });
});

describe("two-voice collision shifts", () => {
  const measure = (
    upper: JSX.Element[],
    lower: JSX.Element[]
  ): JSX.Element[] => [
    <Voice key="u" stem="upStem">
      {upper}
    </Voice>,
    <Voice key="d" stem="downStem">
      {lower}
    </Voice>,
  ];

  it("shifts seconds and mixed-value unisons, merges same-value unisons", () => {
    const shifts = getVoiceCollisionShifts(
      measure(
        [
          <Note key="1" pitch={{ step: "D", octave: 5 }} noteValue="quarter" />,
          <Note key="2" pitch={{ step: "G", octave: 4 }} noteValue="quarter" />,
          <Note key="3" pitch={{ step: "B", octave: 4 }} noteValue="half" />,
        ],
        [
          <Note key="1" pitch={{ step: "C", octave: 5 }} noteValue="quarter" />,
          <Note key="2" pitch={{ step: "G", octave: 4 }} noteValue="quarter" />,
          <Note key="3" pitch={{ step: "B", octave: 4 }} noteValue="whole" />,
        ]
      ),
      "gClef"
    );
    expect(shifts.get(0)).toBe(1.2); // second
    expect(shifts.has(4)).toBe(false); // same-value unison merges
    expect(shifts.get(8)).toBe(1.2); // half vs whole unison separates
  });

  it("widens the shift for whole and dotted up-voice notes", () => {
    const shifts = getVoiceCollisionShifts(
      measure(
        [
          <Note key="1" pitch={{ step: "B", octave: 4 }} noteValue="whole" />,
        ],
        [
          <Note key="1" pitch={{ step: "A", octave: 4 }} noteValue="whole" />,
        ]
      ),
      "gClef"
    );
    expect(shifts.get(0)).toBe(1.75);
  });
});

describe("mid-measure clef tracking", () => {
  const children = [
    <Note key="1" position="space-2" noteValue="quarter" />,
    <Note key="2" position="line-1" noteValue="quarter" clefChange="gClef" />,
    <BeamContainer key="3">
      <Note position="line-2" noteValue="eighth" clefChange="fClef" />
      <Note position="line-2" noteValue="eighth" />
    </BeamContainer>,
    <Note key="4" position="line-3" noteValue="half" />,
  ];

  it("computes the governing clef per direct child", () => {
    expect(clefSequence(children, "cClef")).toEqual([
      "cClef",
      "gClef",
      "fClef",
      "fClef",
    ]);
  });

  it("reports the running clef after the measure", () => {
    expect(lastClefChange(children)).toBe("fClef");
    expect(lastClefChange([children[0]])).toBeUndefined();
  });
});

describe("chords participate like notes", () => {
  it("NoteStack flex matches its noteValue", () => {
    expect(
      getEventFlex(
        <NoteStack
          noteValue="half"
          pitches={[{ pitch: { step: "C", octave: 5 } }]}
        />
      )
    ).toBe(8);
  });
});
