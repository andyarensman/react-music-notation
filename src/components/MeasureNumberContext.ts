import { createContext } from "react";

/*
  The enclosing measure's 1-based number, for interaction callbacks and
  the measure's aria-label. Staff/GrandStaff/Score assign numbers in
  source order when measures don't set `measureNumber` themselves.
*/
export const MeasureNumberContext = createContext<number | undefined>(
  undefined
);
