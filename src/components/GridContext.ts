import { createContext } from "react";

/*
  Onset grid for the current measure, provided by Measure when it contains
  Voice layers: the onset boundaries (in flex units) plus the union leading
  margins (staff-spaces) per column. Each Voice lays its events out on this
  shared grid so voices align with each other — and, inside a grand
  measure, with the other staff.
*/
export interface OnsetGrid {
  boundaries: number[];
  margins: number[];
}

export const GridContext = createContext<OnsetGrid | null>(null);
