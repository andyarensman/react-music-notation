import { createContext } from "react";

/*
  Onset boundaries (in flex units) for the current measure, provided by
  Measure when it contains Voice layers. Each Voice lays its events out on
  this shared grid so voices align with each other — and, inside a grand
  measure, with the other staff.
*/
export const GridContext = createContext<number[] | null>(null);
