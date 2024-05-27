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
};
export const dottedGlyph = {
  dotted: "\uE1E7",
};

export const clefGlyphs = {
  gClef: "\uE050",
  fClef: "\uE062",
  cClef: "\uE05C",
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
