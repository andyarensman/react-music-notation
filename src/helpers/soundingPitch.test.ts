import { describe, expect, it } from "vitest";
import {
  AccidentalContext,
  keySignatureAlterations,
  midiOf,
} from "./soundingPitch";

describe("keySignatureAlterations", () => {
  it("maps sharp keys in fifths order (F C G D A E B)", () => {
    expect(keySignatureAlterations(0).size).toBe(0);
    const dMajor = keySignatureAlterations(2);
    expect([...dMajor.entries()].sort()).toEqual([
      ["C", 1],
      ["F", 1],
    ]);
    expect(keySignatureAlterations(7).size).toBe(7);
  });

  it("maps flat keys in fourths order (B E A D G C F)", () => {
    const eFlatMajor = keySignatureAlterations(-3);
    expect([...eFlatMajor.entries()].sort()).toEqual([
      ["A", -1],
      ["B", -1],
      ["E", -1],
    ]);
  });
});

describe("AccidentalContext", () => {
  it("applies the key signature when nothing is written", () => {
    const ctx = new AccidentalContext(2); // D major
    expect(ctx.resolve({ step: "F", octave: 5 })).toBe(1);
    expect(ctx.resolve({ step: "G", octave: 5 })).toBe(0);
  });

  it("carries a drawn accidental through the measure, same step+octave only", () => {
    const ctx = new AccidentalContext(0);
    expect(ctx.resolve({ step: "G", octave: 4, alter: "sharp" })).toBe(1);
    expect(ctx.resolve({ step: "G", octave: 4 })).toBe(1); // carried
    expect(ctx.resolve({ step: "G", octave: 5 })).toBe(0); // other octave
    ctx.startMeasure();
    expect(ctx.resolve({ step: "G", octave: 4 })).toBe(0); // barline clears
  });

  it("explicit soundingAlter wins over everything", () => {
    const ctx = new AccidentalContext(2);
    expect(ctx.resolve({ step: "F", octave: 5, soundingAlter: 0 })).toBe(0);
  });

  it("reconcile infers the drawn glyph from context", () => {
    const ctx = new AccidentalContext(2); // D major: F#, C#
    // key covers it: no glyph
    expect(ctx.reconcile("F", 5, { soundingAlter: 1 })).toEqual({
      glyph: undefined,
      soundingAlter: 1,
    });
    // contradicts the key: natural inferred
    expect(ctx.reconcile("C", 5, { soundingAlter: 0 })).toEqual({
      glyph: "natural",
      soundingAlter: 0,
    });
    // carried: the next C5 natural needs no glyph
    expect(ctx.reconcile("C", 5, { soundingAlter: 0 })).toEqual({
      glyph: undefined,
      soundingAlter: 0,
    });
  });

  it("reconcile infers sounding from a drawn glyph, and carry follows", () => {
    const ctx = new AccidentalContext(0);
    expect(ctx.reconcile("G", 4, { glyph: "sharp" })).toEqual({
      glyph: "sharp",
      soundingAlter: 1,
    });
    expect(ctx.reconcile("G", 4, {})).toEqual({
      glyph: undefined,
      soundingAlter: 1, // carried
    });
  });

  it("setKey clears measure state and applies the new signature", () => {
    const ctx = new AccidentalContext(0);
    ctx.resolve({ step: "F", octave: 4, alter: "sharp" });
    ctx.setKey(-1); // F major: Bb
    expect(ctx.resolve({ step: "F", octave: 4 })).toBe(0);
    expect(ctx.resolve({ step: "B", octave: 4 })).toBe(-1);
  });
});

describe("midiOf", () => {
  it("maps pitches to MIDI numbers with alteration", () => {
    expect(midiOf({ step: "C", octave: 4 }, 0)).toBe(60);
    expect(midiOf({ step: "A", octave: 4 }, 0)).toBe(69);
    expect(midiOf({ step: "F", octave: 5 }, 1)).toBe(78);
    expect(midiOf({ step: "B", octave: 3 }, -1)).toBe(58);
    expect(midiOf({ step: "C" }, 0)).toBeNull();
  });
});
