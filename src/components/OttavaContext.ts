import { createContext } from "react";

/*
  Octaves added to a pitch's written octave before resolving its staff
  position: an 8va passage renders its (sounding) pitches one octave
  lower on the staff (-1), an 8vb passage one octave higher (+1),
  15ma/15mb two. Provided by Ottava; 0 everywhere else. Explicit
  `position` props are never shifted.
*/
export const OttavaContext = createContext(0);
