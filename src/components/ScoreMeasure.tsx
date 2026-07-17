import { CSSProperties, ReactElement, cloneElement } from "react";
import "./Score.css";
import { MeasureProps } from "./Measure";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefType, KeyRange } from "../helpers/types";
import {
  getOnsetBoundaries,
  getOnsetMargins,
  unionBoundaries,
  unionMargins,
} from "./layout";

// Vertical distance from one part's staff to the next (their 16.125
// staff-space line boxes overlap by 4, leaving an 8 staff-space gap)
export const PART_STRIDE_SS = 12.125;

export interface ScoreMeasureProps {
  /** One `Measure` element per instrument part, top staff first. */
  parts: ReactElement<MeasureProps>[];
  /**
   * 1-based measure number for aria-labels and interaction callbacks;
   * assigned automatically by `Score` when not set.
   */
  measureNumber?: number;
  /**
   * Barline drawn across all staves at the measure's right edge. Defaults
   * to `"regular"`. `"repeatEnd"` is drawn per staff instead (its repeat
   * dots sit on each staff individually).
   */
  barline?: BarlineType;
  /** Draws a `"repeatStart"` barline at the left edge of every staff. */
  startRepeat?: boolean;
  /**
   * @internal Set by `Score`: the clef still in effect for each part from
   * earlier measures; not usually set manually.
   */
  inheritedClefs?: ClefType[];
  /**
   * @internal Set by `Score`: the key still in effect for each part from
   * earlier measures; not usually set manually.
   */
  inheritedFifths?: (KeyRange | undefined)[];
  /**
   * @internal Set by `Score` on the first measure of each system: restate
   * the running clef and key signature on every staff.
   */
  systemStart?: boolean;
  /**
   * @internal Set by `Score` for non-justified (loose) final systems; not
   * usually set manually.
   */
  style?: CSSProperties;
}

/**
 * One measure of a multi-instrument score: every part shares the union
 * onset grid so simultaneous notes align across all staves, and one barline
 * spans from the top staff to the bottom staff. Use inside a `Score`.
 *
 * @example
 * ```tsx
 * <ScoreMeasure
 *   parts={[
 *     <Measure clef="gClef">{...}</Measure>,
 *     <Measure clef="fClef">{...}</Measure>,
 *   ]}
 * />
 * ```
 */
export const ScoreMeasure = ({
  parts,
  measureNumber,
  barline,
  startRepeat,
  inheritedClefs,
  inheritedFifths,
  systemStart,
  style,
}: ScoreMeasureProps) => {
  const boundaries = parts
    .map((part) => getOnsetBoundaries(part.props.children))
    .reduce(unionBoundaries);

  // union accidental/grace/clef margins per onset across all parts, so no
  // staff's noteheads skew right of the others' at a shared onset
  const margins = parts
    .map((part, index) =>
      getOnsetMargins(
        part.props.children,
        boundaries,
        part.props.clef ?? inheritedClefs?.[index] ?? "gClef"
      )
    )
    .reduce(unionMargins);

  // Repeat-end dots belong on each staff individually
  const perStaffBarline = barline === "repeatEnd";
  const barlineHeight = `calc(var(--staff-space) * ${
    4 + (parts.length - 1) * PART_STRIDE_SS
  } + var(--staff-line-thickness))`;

  return (
    <div
      className="score-measure"
      style={
        {
          ...style,
          "--score-barline-height": barlineHeight,
        } as CSSProperties
      }
    >
      {parts.map((part, index) => (
        <div
          key={index}
          className={
            index > 0 ? "score-part score-part-following" : "score-part"
          }
        >
          {cloneElement(part, {
            grid: boundaries,
            gridMargins: margins,
            barline: perStaffBarline ? "repeatEnd" : "none",
            startRepeat,
            inheritedClef: inheritedClefs?.[index],
            inheritedFifths: inheritedFifths?.[index],
            systemStart,
            staffTrack: index,
            measureNumber: part.props.measureNumber ?? measureNumber,
          })}
        </div>
      ))}
      {!perStaffBarline && (
        <Barline type={barline ?? "regular"} placement="end" />
      )}
    </div>
  );
};
