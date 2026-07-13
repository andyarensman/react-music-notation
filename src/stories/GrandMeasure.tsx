import { ReactElement, cloneElement } from "react";
import "./GrandStaff.css";
import { MeasureProps } from "./Measure";
import { Barline, BarlineType } from "./MeasureMeta/Barline";
import { ClefType } from "../helpers/types";
import { getOnsetBoundaries, unionBoundaries } from "./layout";

export interface GrandMeasureProps {
  upper: ReactElement<MeasureProps>;
  lower: ReactElement<MeasureProps>;
  barline?: BarlineType;
  startRepeat?: boolean;
  // Set by GrandStaff, one running clef per staff
  inheritedUpperClef?: ClefType;
  inheritedLowerClef?: ClefType;
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
}: GrandMeasureProps) => {
  const boundaries = unionBoundaries(
    getOnsetBoundaries(upper.props.children),
    getOnsetBoundaries(lower.props.children)
  );

  // Repeat-end dots belong on each staff individually; every other type is
  // drawn once across both staves
  const perStaffBarline = barline === "repeatEnd";

  return (
    <div className="grand-measure">
      {cloneElement(upper, {
        grid: boundaries,
        barline: perStaffBarline ? "repeatEnd" : "none",
        startRepeat,
        inheritedClef: inheritedUpperClef,
      })}
      <div className="grand-measure-lower">
        {cloneElement(lower, {
          grid: boundaries,
          barline: perStaffBarline ? "repeatEnd" : "none",
          startRepeat,
          inheritedClef: inheritedLowerClef,
        })}
      </div>
      {!perStaffBarline && (
        <Barline type={barline ?? "regular"} placement="end" />
      )}
    </div>
  );
};
