import { Children, ReactNode, cloneElement, isValidElement } from "react";
import { ClefType } from "../helpers/types";
import "./Staff.css";

interface StaffProps {
  children?: ReactNode;
}

interface ClefAwareProps {
  clef?: ClefType;
  inheritedClef?: ClefType;
}

export const Staff = ({ children }: StaffProps) => {
  // A clef stays in effect until a later measure changes it, so measures
  // that don't restate the clef still derive pitch positions correctly
  let runningClef: ClefType = "gClef";

  const measures = Children.map(children, (child) => {
    if (!isValidElement<ClefAwareProps>(child)) {
      return child;
    }
    if (child.props.clef) {
      runningClef = child.props.clef;
      return child;
    }
    return cloneElement(child, { inheritedClef: runningClef });
  });

  return <div className="staff-container">{measures}</div>;
};
