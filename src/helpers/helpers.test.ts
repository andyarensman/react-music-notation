import { describe, expect, it } from "vitest";
import {
  derivePosition,
  getDefaultStem,
  getLedgerLines,
  getNoteFlex,
  leadingMarginSs,
  resolvePosition,
  resolveStack,
  stackAccidentalMargin,
  stackFlips,
  StemPositions,
} from "./helpers";
import { PitchPosition, StackedNote } from "./types";

const plainResolve = (note: StackedNote): PitchPosition =>
  resolvePosition(note, "gClef");

describe("derivePosition", () => {
  it("places reference pitches per clef", () => {
    expect(derivePosition({ step: "B", octave: 4 }, "gClef")).toBe("line-3");
    expect(derivePosition({ step: "G", octave: 4 }, "gClef")).toBe("line-2");
    expect(derivePosition({ step: "D", octave: 3 }, "fClef")).toBe("line-3");
    expect(derivePosition({ step: "F", octave: 3 }, "fClef")).toBe("line-4");
    expect(derivePosition({ step: "C", octave: 4 }, "cClef")).toBe("line-3");
    // percussion uses the treble mapping (MusicXML display-step rule)
    expect(derivePosition({ step: "B", octave: 4 }, "percussion")).toBe(
      "line-3"
    );
  });

  it("clamps out-of-range pitches to the outermost positions", () => {
    expect(derivePosition({ step: "C", octave: 9 }, "gClef")).toBe(
      "line-above-4"
    );
    expect(derivePosition({ step: "C", octave: 0 }, "gClef")).toBe(
      "line-below-4"
    );
  });
});

describe("flex durations", () => {
  it("scales from whole=16 with dotting x1.5", () => {
    expect(getNoteFlex({ noteValue: "whole" })).toBe(16);
    expect(getNoteFlex({ noteValue: "quarter" })).toBe(4);
    expect(getNoteFlex({ noteValue: "quarter", dotted: 1 })).toBe(6);
    expect(getNoteFlex({ noteValue: "32nd" })).toBe(0.5);
  });
});

describe("stem defaults and geometry", () => {
  it("middle line and above stem down, below stems up", () => {
    expect(getDefaultStem("line-3")).toBe("downStem");
    expect(getDefaultStem("space-3")).toBe("downStem");
    expect(getDefaultStem("space-2")).toBe("upStem");
  });

  it("StemPositions are generated 4 units per step around 64", () => {
    expect(StemPositions["line-3"]).toBe(64);
    expect(StemPositions["line-5"]).toBe(48);
    expect(StemPositions["space-below-1"]).toBe(84);
  });
});

describe("ledger lines", () => {
  it("adds one per full space beyond the staff", () => {
    expect(getLedgerLines("space-above-1")).toEqual([]);
    expect(getLedgerLines("line-above-1")).toEqual(["above-1"]);
    expect(getLedgerLines("line-above-2")).toEqual(["above-1", "above-2"]);
    expect(getLedgerLines("line-below-1")).toEqual(["below-1"]);
  });
});

describe("stack layout (shared with BeamContainer)", () => {
  const cMajorTriad: StackedNote[] = [
    { pitch: { step: "C", octave: 5 } },
    { pitch: { step: "E", octave: 5 } },
    { pitch: { step: "G", octave: 5 } },
  ];
  const second: StackedNote[] = [
    { pitch: { step: "C", octave: 5 } },
    { pitch: { step: "D", octave: 5 } },
  ];

  it("resolves and sorts top-of-staff first", () => {
    const notes = resolveStack(cMajorTriad, plainResolve);
    expect(notes.map((n) => n.pitch?.step)).toEqual(["G", "E", "C"]);
  });

  it("flips the upper note of a second on an up-stem walk", () => {
    const notes = resolveStack(second, plainResolve);
    const { flipped, anyRightFlip, anyLeftFlip } = stackFlips(notes, true);
    // sorted top-first: D5 then C5; walking bottom-up flips D5
    expect(flipped).toEqual([true, false]);
    expect(anyRightFlip).toBe(true);
    expect(anyLeftFlip).toBe(false);
  });

  it("computes accidental margins with columns and flip clearance", () => {
    const chord: StackedNote[] = [
      { pitch: { step: "C", octave: 5, alter: "sharp" } },
      { pitch: { step: "D", octave: 5, alter: "flat" } },
    ];
    const notes = resolveStack(chord, plainResolve);
    const noFlip = stackAccidentalMargin(notes, false);
    expect(noFlip.margin).toBeGreaterThan(1.5); // two columns
    const flip = stackAccidentalMargin(notes, true);
    expect(flip.margin).toBeCloseTo(noFlip.margin + 1.15, 5);
  });
});

describe("leadingMarginSs", () => {
  it("matches Note's margin model", () => {
    expect(leadingMarginSs({}, plainResolve, true)).toBe(0);
    expect(
      leadingMarginSs(
        { pitch: { step: "F", octave: 5, alter: "sharp" } },
        plainResolve,
        true
      )
    ).toBe(1.5);
    expect(
      leadingMarginSs(
        { pitch: { step: "F", octave: 5, alter: "doubleFlat" } },
        plainResolve,
        true
      )
    ).toBe(1.75);
    expect(
      leadingMarginSs(
        { pitch: { step: "F", octave: 5 }, grace: [{}, {}] },
        plainResolve,
        true
      )
    ).toBeCloseTo(2 * 1.7 + 0.8, 5);
    expect(
      leadingMarginSs({ clefChange: "gClef", rest: true }, plainResolve, true)
    ).toBe(3.4);
  });
});
