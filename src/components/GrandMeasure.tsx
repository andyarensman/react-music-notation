import { CSSProperties, ReactElement, cloneElement } from "react";
import "./GrandStaff.css";
import { MeasureProps } from "./Measure";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefType, KeyRange } from "../helpers/types";
import { getOnsetBoundaries, unionBoundaries } from "./layout";

export interface GrandMeasureProps {
  upper: ReactElement<MeasureProps>;
  lower: ReactElement<MeasureProps>;
  barline?: BarlineType;
  startRepeat?: boolean;
  // Set by GrandStaff: running clef/key per staff, system-start restating,
  // and loose-system sizing
  inheritedUpperClef?: ClefType;
  inheritedLowerClef?: ClefType;
  inheritedUpperFifths?: KeyRange;
  inheritedLowerFifths?: KeyRange;
  systemStart?: boolean;
  style?: CSSProperties;
}

/*
  One measure of a grand staff: the upper and lower measures share an onset
  grid (the union of both staves' note onsets) so simultaneous notes line up,
  and one barline spans both staves.
*/
export const GrandMeasure = ({
  upper,
  lower,
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
      })}
      <div className="grand-measure-lower">
        {cloneElement(lower, {
          grid: boundaries,
          barline: perStaffBarline ? "repeatEnd" : "none",
          startRepeat,
          inheritedClef: inheritedLowerClef,
          inheritedFifths: inheritedLowerFifths,
          systemStart,
        })}
      </div>
      {!perStaffBarline && (
        <Barline type={barline ?? "regular"} placement="end" />
      )}
    </div>
  );
};
