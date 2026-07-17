import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Note } from "./Note";
import { NoteStack } from "./NoteStack";
import { BeamContainer } from "./BeamContainer";
import { Slur } from "./Slur";
import { Tuplet } from "./Tuplet";
import { Voice } from "./Voice";
import { GrandMeasure } from "./GrandMeasure";
import { Measure } from "./Measure";
import {
  clefSequence,
  eventLeadingMargin,
  getEventFlex,
  getOnsetBoundaries,
  getOnsetMargins,
  getVoiceCollisionShifts,
  gridTemplateFromBoundaries,
  lastClefChange,
  unionBoundaries,
  unionMargins,
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
    // every interval is a [margin][duration] track pair
    expect(gridTemplateFromBoundaries([0, 4, 6, 8])).toBe(
      "0px 4fr 0px 2fr 0px 2fr"
    );
    expect(gridTemplateFromBoundaries([0, 4, 8], [1.5, 0])).toBe(
      "calc(var(--staff-space) * 1.5) 4fr 0px 4fr"
    );
  });
});

describe("onset margins (grid margin skew)", () => {
  it("records accidental margins at the event's onset", () => {
    const children = [
      <Note key="1" pitch={{ step: "C", octave: 5 }} noteValue="quarter" />,
      <Note
        key="2"
        pitch={{ step: "F", octave: 5, alter: "sharp" }}
        noteValue="quarter"
      />,
      <Note key="3" pitch={{ step: "G", octave: 5 }} noteValue="half" />,
    ];
    expect(getOnsetMargins(children, [0, 4, 8, 16], "gClef")).toEqual([
      0, 1.5, 0,
    ]);
  });

  it("sees the first note of beam groups and through slur wrappers", () => {
    const children = [
      <BeamContainer key="1">
        <Note
          pitch={{ step: "B", octave: 4, alter: "flat" }}
          noteValue="eighth"
        />
        <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
      </BeamContainer>,
      <Slur key="2">
        <Note pitch={{ step: "D", octave: 5 }} noteValue="quarter" />
        <Note
          pitch={{ step: "E", octave: 5, alter: "flat" }}
          noteValue="quarter"
        />
      </Slur>,
    ];
    expect(getOnsetMargins(children, [0, 2, 4, 8, 12], "gClef")).toEqual([
      1.5, 0, 0, 1.5,
    ]);
  });

  it("unions margins across voices with the voice's stems", () => {
    const children = [
      <Voice key="u" stem="upStem">
        <Note pitch={{ step: "E", octave: 5 }} noteValue="half" />
      </Voice>,
      <Voice key="d" stem="downStem">
        <Note
          pitch={{ step: "C", octave: 5, alter: "sharp" }}
          noteValue="quarter"
        />
        <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
      </Voice>,
    ];
    expect(getOnsetMargins(children, [0, 4, 8], "gClef")).toEqual([1.5, 0]);
  });

  it("unionMargins takes the per-column max", () => {
    expect(unionMargins([1.5, 0, 0], [0, 2.5, 0])).toEqual([1.5, 2.5, 0]);
  });

  it("renders margin tracks and pads the margin-free staff up to them", () => {
    const markup = renderToStaticMarkup(
      <GrandMeasure
        upper={
          <Measure clef="gClef">
            <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
            <Note
              pitch={{ step: "F", octave: 5, alter: "sharp" }}
              noteValue="quarter"
            />
            <Note pitch={{ step: "G", octave: 5 }} noteValue="half" />
          </Measure>
        }
        lower={
          <Measure clef="fClef">
            <Note pitch={{ step: "C", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "D", octave: 3 }} noteValue="quarter" />
            <Note pitch={{ step: "E", octave: 3 }} noteValue="half" />
          </Measure>
        }
      />
    );
    // the F#'s 1.5ss margin becomes a fixed track before onset 4's column
    expect(markup).toContain(
      "grid-template-columns:0px 4fr calc(var(--staff-space) * 1.5) 4fr 0px 8fr"
    );
    // the lower staff's D3 (no accidental) pads up to the shared margin
    expect(markup).toContain(
      "padding-left:calc(var(--staff-space) * 1.5)"
    );
  });

  it("eventLeadingMargin matches chord accidental-column math", () => {
    const margin = eventLeadingMargin("gClef")(
      <NoteStack
        noteValue="quarter"
        pitches={[
          { pitch: { step: "C", octave: 5, alter: "sharp" } },
          { pitch: { step: "E", octave: 5, alter: "flat" } },
        ]}
      />
    );
    // two accidentals stack into two columns: 1.5 + 1 * 1.1
    expect(margin).toBe(2.6);
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
