import { createContext } from "react";
import { ClefType } from "../helpers/types";

/*
  Cross-staff support inside a grand measure. Each staff's Measure is
  wrapped in a provider describing where a `crossStaff` note goes:
  directionSign +1 = the other staff lies one staff-stride BELOW (this is
  the upper staff), -1 = above; otherClef resolves the note's pitch on
  the staff it displays on. null outside grand measures (crossStaff is
  ignored there).
*/
export interface CrossStaffInfo {
  directionSign: 1 | -1;
  otherClef: ClefType;
}

export const CrossStaffContext = createContext<CrossStaffInfo | null>(null);

// One staff-stride (the vertical distance between a grand measure's two
// staves) in stem-viewBox units: 12.125 staff-spaces x 8 units
export const STAFF_STRIDE_VB = 97;
