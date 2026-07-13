import { Children, ReactNode, cloneElement, isValidElement } from "react";
import "./GrandStaff.css";
import "../global.css";
import { braceGlyph } from "../helpers/glyphs";
import { ClefType } from "../helpers/types";
import { GrandMeasureProps } from "./GrandMeasure";

interface GrandStaffProps {
  children?: ReactNode;
}

/*
  A piano-style pair of staves. Tracks a running clef per staff (like Staff
  does for one) and draws the brace. Known limitation: when measures wrap,
  only the first system gets the brace — re-bracing each wrapped row needs
  real system layout.
*/
export const GrandStaff = ({ children }: GrandStaffProps) => {
  let upperClef: ClefType = "gClef";
  let lowerClef: ClefType = "fClef";

  const measures = Children.map(children, (child) => {
    if (!isValidElement<GrandMeasureProps>(child)) {
      return child;
    }
    const declaredUpper = child.props.upper?.props.clef;
    const declaredLower = child.props.lower?.props.clef;
    if (declaredUpper) upperClef = declaredUpper;
    if (declaredLower) lowerClef = declaredLower;
    return cloneElement(child, {
      inheritedUpperClef: upperClef,
      inheritedLowerClef: lowerClef,
    });
  });

  return (
    <div className="grand-staff-container">
      <div className="grand-brace">
        <span className="leland grand-brace-glyph">{braceGlyph}</span>
      </div>
      {measures}
    </div>
  );
};
