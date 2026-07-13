import { createContext } from "react";
import { ClefType } from "../helpers/types";

/*
  The clef in effect for the current measure, used to derive staff positions
  from pitches. Provided by Measure; Staff keeps it correct across measures
  that don't restate their clef.
*/
export const ClefContext = createContext<ClefType>("gClef");
