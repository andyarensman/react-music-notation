import { Children, ReactNode } from "react";
import "./Tuplet.css";
import { tupletGlyphs } from "../helpers/glyphs";
import { getEventFlex, getLastLeafFlex } from "./layout";

interface TupletProps {
  /**
   * `[actual, normal]`: e.g. `[3, 2]` plays three notes in the time of two
   * (a triplet). Children's durations scale by `normal / actual`.
   */
  ratio: [number, number];
  /** Which side the bracket-and-number sits on. Defaults to `"above"` (or `"below"` in a down-stem voice). */
  position?: "above" | "below";
  /**
   * @internal Injected by `Voice`: the bracket defaults to the voice's
   * outer side; not usually set manually.
   */
  stem?: "upStem" | "downStem";
  /** The tuplet's events: notes, chords, or a `BeamContainer`. */
  children?: ReactNode;
}

/*
  Scales its children's durations by the tuplet ratio and draws the
  bracket-and-number on the chosen side. Children keep their natural flex
  relative to each other; the container's flex-grow applies the ratio.
*/
const TupletComponent = ({ ratio, position, stem, children }: TupletProps) => {
  const side = position ?? (stem === "downStem" ? "below" : "above");
  const [actual, normal] = ratio;
  const naturalFlex = Children.toArray(children).reduce(
    (sum: number, child) => sum + getEventFlex(child),
    0
  );
  const flexGrow = (naturalFlex * normal) / actual;
  const number = String(actual)
    .split("")
    .map((digit) => tupletGlyphs[Number(digit)])
    .join("");
  // Gould p. 195: the bracket runs from the first notehead's left edge to
  // the FINAL notehead's right edge — not to the end of the last note's
  // rhythmic slot
  const spanPercentage =
    naturalFlex > 0
      ? ((naturalFlex - getLastLeafFlex(children)) / naturalFlex) * 100
      : 0;

  return (
    <div className="tuplet-container" style={{ flexGrow, display: "flex" }}>
      {children}
      <div
        className={`tuplet-bracket tuplet-${side}`}
        style={{
          width: `calc(${spanPercentage}% + var(--staff-space) * 1)`,
        }}
      >
        <div className="tuplet-bracket-line"></div>
        <div className="leland tuplet-number">{number}</div>
        <div className="tuplet-bracket-line"></div>
      </div>
    </div>
  );
};

/**
 * An irregular division (triplet, quintuplet, ...): scales its children's
 * durations by the tuplet `ratio` and draws the square bracket with the
 * tuplet numeral, ending at the final notehead's right edge per engraving
 * convention (Gould p. 195).
 *
 * @example
 * ```tsx
 * <Tuplet ratio={[3, 2]}>
 *   <Note pitch={{ step: "A", octave: 4 }} noteValue="quarter" />
 *   <Note pitch={{ step: "B", octave: 4 }} noteValue="quarter" />
 *   <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
 * </Tuplet>
 * ```
 */
export const Tuplet = Object.assign(TupletComponent, {
  musicRole: "tuplet" as const,
});
