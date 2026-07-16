interface NoteDetails {
  upStem: string;
  downStem: string;
  noStem: string;
  rest: string;
  NoFlagUpStem?: string;
  NoFlagDownStem?: string;
}

export interface NoteGlyphs {
  wholeNote: NoteDetails;
  halfNote: NoteDetails;
  quarterNote: NoteDetails;
  eighthNote: NoteDetails;
  sixteenthNote: NoteDetails;
  thirtySecondNote: NoteDetails;
}

export const noteGlyphs: NoteGlyphs = {
  wholeNote: {
    upStem: "\uE1D2",
    downStem: "\uE1D2",
    noStem: "\uE1D2",
    rest: "\uE4E3",
  },
  halfNote: {
    upStem: "\uE1D3",
    downStem: "\uE1D4",
    noStem: "\uE0A3",
    rest: "\uE4E4",
  },
  quarterNote: {
    upStem: "\uE1D5",
    downStem: "\uE1D6",
    noStem: "\uE0A4",
    rest: "\uE4E5",
  },
  eighthNote: {
    upStem: "\uE1D7",
    downStem: "\uE1D8",
    noStem: "\uE0A4",
    NoFlagUpStem: "\uE1D5",
    NoFlagDownStem: "\uE1D6",
    rest: "\uE4E6",
  },
  sixteenthNote: {
    upStem: "\uE1D9",
    downStem: "\uE1DA",
    noStem: "\uE0A4",
    NoFlagUpStem: "\uE1D5",
    NoFlagDownStem: "\uE1D6",
    rest: "\uE4E7",
  },
  thirtySecondNote: {
    upStem: "\uE1DB",
    downStem: "\uE1DC",
    noStem: "\uE0A4",
    NoFlagUpStem: "\uE1D5",
    NoFlagDownStem: "\uE1D6",
    rest: "\uE4E8",
  },
};
export const dottedGlyph = {
  dotted: "\uE1E7",
};

// Standalone flags for chord stems (single-note glyphs have flags built in)
export const flagGlyphs: Record<
  "eighth" | "16th" | "32nd",
  { upStem: string; downStem: string }
> = {
  eighth: {
    upStem: "\uE240",
    downStem: "\uE241",
  },
  "16th": {
    upStem: "\uE242",
    downStem: "\uE243",
  },
  "32nd": {
    upStem: "\uE244",
    downStem: "\uE245",
  },
};

// Spans a grand staff's two staves; scaled via font-size (see GrandStaff.css)
export const braceGlyph = "";

// Combined grace-note glyphs (small note + stem + flag, pre-scaled to cue size).
// NOTE: Leland deviates from the SMuFL codepoint order here — it groups the
// glyphs by slash instead of stem direction, so U+E561 is the stem-DOWN
// acciaccatura and U+E562 the stem-up appoggiatura (verified from the
// font's ink bounds). The keys below keep SMuFL semantics; the values map
// to what Leland actually draws.
export const graceNoteGlyphs = {
  acciaccaturaUp: "\ue560",
  appoggiaturaUp: "\ue562",
  acciaccaturaDown: "\ue561",
  appoggiaturaDown: "\ue563",
};

// Octave-shift labels. NOTE: Leland/SMuFL keep the explicit vb/mb
// ligatures at E51C/E51D (ottavaBassaVb, quindicesimaBassaMb) - the
// plain bassa codepoints E512/E513/E516 draw "8va"/"8ba"/"15ma" instead
// (verified by rendering; see the add-glyphs skill).
export const ottavaGlyphs = {
  "8va": "\ue511",
  "8vb": "\ue51c",
  "15ma": "\ue515",
  "15mb": "\ue51d",
};

// Tuplet number digits (SMuFL tuplet0-tuplet9)
export const tupletGlyphs: Record<number, string> = {
  0: "\uE880",
  1: "\uE881",
  2: "\uE882",
  3: "\uE883",
  4: "\uE884",
  5: "\uE885",
  6: "\uE886",
  7: "\uE887",
  8: "\uE888",
  9: "\uE889",
};

// Text-sized note glyphs for metronome marks (SMuFL metNote* range)
export const metronomeGlyphs = {
  whole: "\uECA2",
  half: "\uECA3",
  quarter: "\uECA5",
  eighth: "\uECA7",
  "16th": "\uECA9",
  "32nd": "\uECAB",
  dot: "\uECB7",
};

export const clefGlyphs = {
  gClef: "\uE050",
  fClef: "\uE062",
  cClef: "\uE05C",
  percussion: "\uE069",
  tab: "\uE06E",
};

/*
  Alternative noteheads for percussion and effects, drawn with a separate
  stem (the combined note glyphs only exist for standard heads). Leland
  lacks the X/circle-X/triangle half and whole variants, so those fall
  back to the black form \u2014 half/whole X heads are rare in kit writing.
*/
export const altNoteheadGlyphs: Record<
  "x" | "circleX" | "diamond" | "triangle",
  { black: string; half: string; whole: string }
> = {
  x: { black: "\uE0A9", half: "\uE0A9", whole: "\uE0A9" },
  circleX: { black: "\uE0B3", half: "\uE0B3", whole: "\uE0B3" },
  diamond: { black: "\uE0DB", half: "\uE0D9", whole: "\uE0D8" },
  triangle: { black: "\uE0BE", half: "\uE0BE", whole: "\uE0BE" },
};

interface TimeSignatureNumberGlyphs {
  [key: number]: string;
}

export const timeSignatureNumberGlyphs: TimeSignatureNumberGlyphs = {
  0: "\uE080",
  1: "\uE081",
  2: "\uE082",
  3: "\uE083",
  4: "\uE084",
  5: "\uE085",
  6: "\uE086",
  7: "\uE087",
  8: "\uE088",
  9: "\uE089",
};

export const timeSignatureSymbolGlyphs = {
  common: "\uE08A",
  cut: "\uE08B",
};

export const accidentalGlyphs = {
  sharp: "\uE262",
  flat: "\uE260",
  natural: "\uE261",
  doubleSharp: "\uE263",
  doubleFlat: "\uE264",
};

export const dynamicGlyphs = {
  p: "\uE520",
  m: "\uE521",
  f: "\uE522",
  r: "\uE523",
  s: "\uE524",
  z: "\uE525",
  n: "\uE526",
  p6: "\uE527",
  p5: "\uE528",
  p4: "\uE529",
  p3: "\uE52A",
  pp: "\uE52B",
  mp: "\uE52C",
  mf: "\uE52D",
  pf: "\uE52E",
  ff: "\uE52F",
  f3: "\uE530",
  f4: "\uE531",
  f5: "\uE532",
  f6: "\uE533",
  fp: "\uE534",
  fz: "\uE535",
  sf: "\uE536",
  sfp: "\uE537",
  sfpp: "\uE538",
  sfz: "\uE539",
  sfzp: "\uE53A",
  sffz: "\uE53B",
  rf: "\uE53C",
  rfz: "\uE53D",
};

export const articulationGlyphs = {
  accent: {
    above: "\uE4A0",
    below: "\uE4A1",
  },
  staccato: {
    above: "\uE4A2",
    below: "\uE4A3",
  },
  tenuto: {
    above: "\uE4A4",
    below: "\uE4A5",
  },
  staccatissimo: {
    above: "\uE4A6",
    below: "\uE4A7",
  },
  marcato: {
    above: "\uE4AC",
    below: "\uE4AD",
  },
  marcatoStaccato: {
    above: "\uE4AE",
    below: "\uE4AF",
  },
  accentStaccato: {
    above: "\uE4B0",
    below: "\uE4B1",
  },
  tenutoStaccato: {
    above: "\uE4B2",
    below: "\uE4B3",
  },
  accentTenuto: {
    above: "\uE4B4",
    below: "\uE4B5",
  },
};
