import { CSSProperties, ReactElement, cloneElement } from "react";
import "./GrandStaff.css";
import { MeasureProps } from "./Measure";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefType, KeyRange } from "../helpers/types";
import { getOnsetBoundaries, unionBoundaries } from "./layout";

export interface GrandMeasureProps {
  /** The treble/upper staff's `Measure` element. */
  upper: ReactElement<MeasureProps>;
  /** The bass/lower staff's `Measure` element. */
  lower: ReactElement<MeasureProps>;
  /**
   * 1-based measure number for aria-labels and interaction callbacks;
   * assigned automatically by `GrandStaff` when not set.
   */
  measureNumber?: number;
  /**
   * Barline drawn across both staves at the measure's right edge. Defaults
   * to `"regular"`. `"repeatEnd"` is drawn per staff instead (its repeat
   * dots sit on each staff individually); every other type spans both
   * staves as one barline.
   */
  barline?: BarlineType;
  /** Draws a `"repeatStart"` barline at the left edge of both staves. */
  startRepeat?: boolean;
  /**
   * @internal Set by `GrandStaff`: the clef still in effect for the upper
   * staff from earlier measures; not usually set manually.
   */
  inheritedUpperClef?: ClefType;
  /**
   * @internal Set by `GrandStaff`: the clef still in effect for the lower
   * staff from earlier measures; not usually set manually.
   */
  inheritedLowerClef?: ClefType;
  /**
   * @internal Set by `GrandStaff`: the key still in effect for the upper
   * staff from earlier measures; not usually set manually.
   */
  inheritedUpperFifths?: KeyRange;
  /**
   * @internal Set by `GrandStaff`: the key still in effect for the lower
   * staff from earlier measures; not usually set manually.
   */
  inheritedLowerFifths?: KeyRange;
  /**
   * @internal Set by `GrandStaff` on the first measure of each system:
   * restate the running clef and key signature on both staves.
   */
  systemStart?: boolean;
  /**
   * @internal Set by `GrandStaff` for non-justified (loose) final systems;
   * not usually set manually.
   */
  style?: CSSProperties;
}

/**
 * One measure of a grand staff (piano-style pair of staves): the `upper` and
 * `lower` measures share an onset grid — the union of both staves' note
 * onsets — so simultaneous notes line up vertically, and one barline spans
 * both staves. Use inside a `GrandStaff`.
 *
 * @example
 * ```tsx
 * <GrandMeasure
 *   upper={<Measure clef="gClef">{"..."}</Measure>}
 *   lower={<Measure clef="fClef">{"..."}</Measure>}
 * />
 * ```
 */
export const GrandMeasure = ({
  upper,
  lower,
  measureNumber,
  barline,
  startRepeat,
  inheritedUpperClef,
  inheritedLowerClef,
  inheritedUpperFifths,
  inheritedLowerFifths,
  systemStart,
  style,
}: GrandMeasureProps) => {
  const boundaries = unionBoundaries(
    getOnsetBoundaries(upper.props.children),
    getOnsetBoundaries(lower.props.children)
  );

  // Repeat-end dots belong on each staff individually; every other type is
  // drawn once across both staves
  const perStaffBarline = barline === "repeatEnd";

  return (
    <div className="grand-measure" style={style}>
      {cloneElement(upper, {
        grid: boundaries,
        barline: perStaffBarline ? "repeatEnd" : "none",
        startRepeat,
        inheritedClef: inheritedUpperClef,
        inheritedFifths: inheritedUpperFifths,
        systemStart,
        staffTrack: 0,
        measureNumber: upper.props.measureNumber ?? measureNumber,
      })}
      <div className="grand-measure-lower">
        {cloneElement(lower, {
          grid: boundaries,
          barline: perStaffBarline ? "repeatEnd" : "none",
          startRepeat,
          inheritedClef: inheritedLowerClef,
          inheritedFifths: inheritedLowerFifths,
          systemStart,
          staffTrack: 1,
          measureNumber: lower.props.measureNumber ?? measureNumber,
        })}
      </div>
      {!perStaffBarline && (
        <Barline type={barline ?? "regular"} placement="end" />
      )}
    </div>
  );
};
