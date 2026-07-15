import { ReactElement, ReactNode } from "react";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { Tuplet } from "../components/Tuplet";
import { Slur } from "../components/Slur";
import { Hairpin } from "../components/Hairpin";
import { Voice } from "../components/Voice";
import { Staff } from "../components/Staff";
import { GrandStaff } from "../components/GrandStaff";
import { GrandMeasure } from "../components/GrandMeasure";
import { Score } from "../components/Score";
import { ScoreMeasure } from "../components/ScoreMeasure";
import { BarlineType } from "../components/MeasureMeta/Barline";
import { TempoProps } from "../components/MeasureMeta/Tempo";
import { EndingProps } from "../components/MeasureMeta/Volta";
import { Ottava, OttavaType } from "../components/Ottava";
import {
  ArticulationType,
  ClefType,
  DynamicType,
  GraceNote,
  KeyRange,
  Lyric,
  NoteProps,
  Pitch,
  SlurMarker,
  StackedNote,
} from "../helpers/types";

/*
  MusicXML 4.0 importer (score-partwise). Maps the subset this library can
  render onto its components and reports everything it had to skip. See the
  README for the coverage list.
*/

export interface MusicXMLResult {
  /** The rendered score: a Staff, GrandStaff, or Score element. */
  element: ReactElement;
  /** Human-readable notes about everything the importer skipped. */
  warnings: string[];
}

type NoteValue = NoteProps["noteValue"];

const NOTE_TYPES: Record<string, NoteValue> = {
  whole: "whole",
  half: "half",
  quarter: "quarter",
  eighth: "eighth",
  "16th": "16th",
  "32nd": "32nd",
};

const ALTER_TO_ACCIDENTAL: Record<string, Pitch["alter"]> = {
  "1": "sharp",
  "-1": "flat",
  "2": "doubleSharp",
  "-2": "doubleFlat",
};

const ACCIDENTAL_NAMES: Record<string, Pitch["alter"]> = {
  sharp: "sharp",
  flat: "flat",
  natural: "natural",
  "double-sharp": "doubleSharp",
  "flat-flat": "doubleFlat",
};

const DYNAMICS: DynamicType[] = [
  "p",
  "pp",
  "mp",
  "mf",
  "f",
  "ff",
  "fp",
  "sf",
  "sfz",
  "rf",
  "rfz",
];

const ARTICULATION_MAP: Record<string, ArticulationType> = {
  staccato: "staccato",
  accent: "accent",
  tenuto: "tenuto",
  staccatissimo: "staccatissimo",
  "strong-accent": "marcato",
  "detached-legato": "tenutoStaccato",
};

const COMBINED_ARTICULATIONS: Record<string, ArticulationType> = {
  "accent+staccato": "accentStaccato",
  "staccato+tenuto": "tenutoStaccato",
  "accent+tenuto": "accentTenuto",
  "marcato+staccato": "marcatoStaccato",
};

// Everything on one parsed <note>, before grouping
interface ParsedNote {
  voice: string;
  staff: number;
  chordWithPrevious: boolean;
  rest: boolean;
  pitch?: Pitch;
  noteValue: NoteValue;
  dotted: boolean;
  tieStart: boolean;
  tieStop: boolean;
  beam?: "begin" | "continue" | "end";
  tupletStart: boolean;
  tupletStop: boolean;
  timeMod?: [number, number];
  // MusicXML slur "number" attribute (default "1"); slurs contained in one
  // measure become Slur wrappers, unmatched boundaries become slur markers
  slurStart?: string;
  slurStop?: string;
  articulation?: ArticulationType;
  lyrics?: Lyric[];
  // grace notes preceding this note in the stream, attached as its lead-in
  grace?: GraceNote[];
  isGrace?: boolean;
  graceSlash?: boolean;
  // attached from preceding <direction> elements
  dynamic?: DynamicType;
  text?: string;
  wedgeStart?: "crescendo" | "diminuendo";
  wedgeStop: boolean;
  // an <octave-shift> starts before this note / stops before this note
  // (the stop is exclusive: the marked note itself is back at pitch)
  ottavaStart?: OttavaType;
  ottavaStop?: boolean;
}

interface MeasureAttributes {
  clefs: Map<number, ClefType>; // per staff number
  fifths?: KeyRange;
  time?: { beat: number; beatType: number } | { timeSymbol: "common" | "cut" };
  staves: number;
}

interface ParsedMeasure {
  attributes: MeasureAttributes;
  tempo?: TempoProps;
  barline?: BarlineType;
  startRepeat: boolean;
  endingStart?: string;
  endingStop?: "closed" | "open";
  ending?: EndingProps;
  // staff number -> voice id -> notes in order
  staves: Map<number, Map<string, ParsedNote[]>>;
}

const childText = (parent: Element, tag: string): string | undefined =>
  parent.getElementsByTagName(tag)[0]?.textContent ?? undefined;

const directChildren = (parent: Element, tag: string): Element[] =>
  Array.from(parent.children).filter((child) => child.tagName === tag);

/** Parse a MusicXML string (score-partwise) into renderable components. */
export function parseMusicXML(xml: string): MusicXMLResult {
  const warnings = new Set<string>();
  const warn = (message: string) => warnings.add(message);

  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    throw new Error("Invalid XML: could not parse the MusicXML document");
  }
  const root = doc.documentElement;
  if (root.tagName !== "score-partwise") {
    throw new Error(
      `Unsupported MusicXML root <${root.tagName}>: only score-partwise documents are supported`
    );
  }

  // Part names from the part-list
  const partNames = new Map<string, string>();
  const partList = root.getElementsByTagName("part-list")[0];
  if (partList) {
    for (const scorePart of Array.from(
      partList.getElementsByTagName("score-part")
    )) {
      const id = scorePart.getAttribute("id");
      const name = childText(scorePart, "part-name");
      if (id && name) partNames.set(id, name.trim());
    }
  }

  const parts = directChildren(root, "part");
  if (parts.length === 0) {
    throw new Error("The MusicXML document contains no parts");
  }

  const parsedParts = parts.map((part) => {
    const measures = directChildren(part, "measure").map((measure) =>
      parseMeasure(measure, warn)
    );
    attachEndings(measures);
    return { id: part.getAttribute("id") ?? "", measures };
  });

  const element = assemble(parsedParts, partNames, warn);
  return { element, warnings: Array.from(warnings) };
}

/*
  Turn the per-measure ending start/stop markers into composable Volta
  props: the start measure carries the label, continuation measures draw
  the line only, and the bracket stays open on the right until (and
  including, for "discontinue") the measure that ends it.
*/
function attachEndings(measures: ParsedMeasure[]) {
  let inEnding = false;
  for (const measure of measures) {
    let ending: EndingProps | undefined;
    if (measure.endingStart !== undefined) {
      const text = measure.endingStart
        .split(",")
        .filter((part) => part.trim())
        .map((part) => `${part.trim()}.`)
        .join(" ");
      ending = { text: text || undefined };
      inEnding = true;
    } else if (inEnding) {
      ending = { continues: true };
    }
    if (ending && inEnding) {
      if (measure.endingStop) {
        ending.open = measure.endingStop === "open" || undefined;
        inEnding = false;
      } else {
        // the bracket continues into the next measure
        ending.open = true;
      }
    }
    measure.ending = ending;
  }
}

function parseMeasure(
  measureElement: Element,
  warn: (message: string) => void
): ParsedMeasure {
  const measure: ParsedMeasure = {
    attributes: { clefs: new Map(), staves: 1 },
    startRepeat: false,
    staves: new Map(),
  };

  // Directions accumulate here until the next note on their staff claims them
  const pending = new Map<
    number,
    {
      dynamic?: DynamicType;
      text?: string;
      wedgeStart?: "crescendo" | "diminuendo";
      wedgeStop?: boolean;
      ottavaStart?: OttavaType;
      ottavaStop?: boolean;
    }
  >();
  const pendingFor = (staff: number) => {
    if (!pending.has(staff)) pending.set(staff, {});
    return pending.get(staff)!;
  };
  const pendingGraces = new Map<number, GraceNote[]>();
  let sawNote = false;

  for (const child of Array.from(measureElement.children)) {
    switch (child.tagName) {
      case "attributes":
        parseAttributes(child, measure.attributes, warn);
        break;
      case "direction": {
        const staff = Number(childText(child, "staff") ?? 1);
        parseDirection(child, measure, pendingFor(staff), sawNote, warn);
        break;
      }
      case "note": {
        const note = parseNote(child, warn);
        if (!note) break;
        if (note.isGrace) {
          if (!note.rest && note.pitch) {
            if (note.pitch.alter) {
              warn("Accidentals on grace notes are not drawn");
            }
            const list = pendingGraces.get(note.staff) ?? [];
            list.push({ pitch: note.pitch, slash: note.graceSlash });
            pendingGraces.set(note.staff, list);
          }
          break;
        }
        sawNote = true;
        if (!note.chordWithPrevious && pendingGraces.has(note.staff)) {
          note.grace = pendingGraces.get(note.staff);
          pendingGraces.delete(note.staff);
        }
        const claim = pendingFor(note.staff);
        note.dynamic = claim.dynamic;
        note.text = claim.text;
        note.wedgeStart = claim.wedgeStart;
        note.wedgeStop = claim.wedgeStop ?? false;
        note.ottavaStart = claim.ottavaStart;
        note.ottavaStop = claim.ottavaStop ?? false;
        pending.set(note.staff, {});

        if (!measure.staves.has(note.staff)) {
          measure.staves.set(note.staff, new Map());
        }
        const voices = measure.staves.get(note.staff)!;
        if (!voices.has(note.voice)) voices.set(note.voice, []);
        voices.get(note.voice)!.push(note);
        break;
      }
      case "barline": {
        const style = childText(child, "bar-style");
        const repeat = child.getElementsByTagName("repeat")[0];
        const location = child.getAttribute("location") ?? "right";
        const endingElement = child.getElementsByTagName("ending")[0];
        if (endingElement) {
          const type = endingElement.getAttribute("type");
          const number = endingElement.getAttribute("number") ?? "";
          if (type === "start") measure.endingStart = number;
          else if (type === "stop") measure.endingStop = "closed";
          else if (type === "discontinue") measure.endingStop = "open";
        }
        if (repeat) {
          const direction = repeat.getAttribute("direction");
          if (direction === "forward" || location === "left") {
            measure.startRepeat = true;
          } else {
            measure.barline = "repeatEnd";
          }
        } else if (style === "light-heavy") {
          measure.barline = "final";
        } else if (style === "light-light") {
          measure.barline = "double";
        } else if (style && style !== "regular") {
          warn(`Unsupported bar-style "${style}"`);
        }
        break;
      }
      case "backup":
      case "forward":
        // voices are reconstructed from <voice> numbers, so the time cursor
        // moves are not needed
        break;
      case "harmony":
      case "print":
      case "sound":
        warn(`Skipped <${child.tagName}> elements`);
        break;
      default:
        warn(`Skipped <${child.tagName}> elements`);
    }
  }
  return measure;
}

function parseAttributes(
  attributesElement: Element,
  attributes: MeasureAttributes,
  warn: (message: string) => void
) {
  const fifths = childText(attributesElement, "fifths");
  if (fifths !== undefined) {
    const value = Number(fifths);
    if (value >= -7 && value <= 7) {
      attributes.fifths = value as KeyRange;
    } else {
      warn(`Key signature fifths=${fifths} out of range`);
    }
  }

  const time = attributesElement.getElementsByTagName("time")[0];
  if (time) {
    const symbol = time.getAttribute("symbol");
    if (symbol === "common" || symbol === "cut") {
      attributes.time = { timeSymbol: symbol };
    } else {
      const beat = Number(childText(time, "beats"));
      const beatType = Number(childText(time, "beat-type"));
      if (beat && beatType) attributes.time = { beat, beatType };
    }
  }

  const staves = childText(attributesElement, "staves");
  if (staves) attributes.staves = Number(staves);

  for (const clef of Array.from(
    attributesElement.getElementsByTagName("clef")
  )) {
    const staff = Number(clef.getAttribute("number") ?? 1);
    const sign = childText(clef, "sign");
    if (sign === "G") attributes.clefs.set(staff, "gClef");
    else if (sign === "F") attributes.clefs.set(staff, "fClef");
    else if (sign === "C") attributes.clefs.set(staff, "cClef");
    else if (sign) {
      warn(`Unsupported clef sign "${sign}"; using treble`);
      attributes.clefs.set(staff, "gClef");
    }
  }

  if (attributesElement.getElementsByTagName("transpose").length > 0) {
    warn("Skipped <transpose> (parts render at written pitch)");
  }
}

function parseDirection(
  directionElement: Element,
  measure: ParsedMeasure,
  pending: {
    dynamic?: DynamicType;
    text?: string;
    wedgeStart?: "crescendo" | "diminuendo";
    wedgeStop?: boolean;
    ottavaStart?: OttavaType;
    ottavaStop?: boolean;
  },
  sawNote: boolean,
  warn: (message: string) => void
) {
  for (const directionType of Array.from(
    directionElement.getElementsByTagName("direction-type")
  )) {
    for (const item of Array.from(directionType.children)) {
      switch (item.tagName) {
        case "dynamics": {
          const mark = item.children[0]?.tagName;
          if (mark && (DYNAMICS as string[]).includes(mark)) {
            pending.dynamic = mark as DynamicType;
          } else if (mark) {
            warn(`Unsupported dynamic "${mark}"`);
          }
          break;
        }
        case "wedge": {
          const type = item.getAttribute("type");
          if (type === "crescendo") pending.wedgeStart = "crescendo";
          else if (type === "diminuendo") pending.wedgeStart = "diminuendo";
          else if (type === "stop") pending.wedgeStop = true;
          break;
        }
        case "octave-shift": {
          // MusicXML: type="down" notates pitches an octave below sounding
          // (the 8va line above the staff); type="up" is the 8vb line
          const type = item.getAttribute("type");
          const size = item.getAttribute("size") ?? "8";
          if (type === "down") {
            pending.ottavaStart = size === "15" ? "15ma" : "8va";
          } else if (type === "up") {
            pending.ottavaStart = size === "15" ? "15mb" : "8vb";
          } else if (type === "stop") {
            pending.ottavaStop = true;
          } else if (type === "continue") {
            warn('Skipped <octave-shift type="continue">');
          }
          break;
        }
        case "metronome": {
          const beatUnit = childText(item, "beat-unit");
          const perMinute = Number(childText(item, "per-minute"));
          if (beatUnit && NOTE_TYPES[beatUnit] && perMinute) {
            measure.tempo = {
              ...measure.tempo,
              beatUnit: NOTE_TYPES[beatUnit],
              beatUnitDotted:
                item.getElementsByTagName("beat-unit-dot").length > 0,
              bpm: perMinute,
            };
          }
          break;
        }
        case "words": {
          const words = item.textContent?.trim();
          if (!words) break;
          // words before the first note read as a tempo/character marking;
          // later words attach to the next note as expression text
          if (!sawNote && !measure.tempo?.text) {
            measure.tempo = { ...measure.tempo, text: words };
          } else {
            pending.text = pending.text ? `${pending.text} ${words}` : words;
          }
          break;
        }
        default:
          warn(`Skipped direction <${item.tagName}>`);
      }
    }
  }
}

function parseNote(
  noteElement: Element,
  warn: (message: string) => void
): ParsedNote | undefined {
  const graceElement = noteElement.getElementsByTagName("grace")[0];
  if (noteElement.getElementsByTagName("cue").length > 0) {
    warn("Skipped cue notes");
    return undefined;
  }
  const lyricElements = Array.from(noteElement.getElementsByTagName("lyric"));
  let lyrics: Lyric[] | undefined;
  if (lyricElements.length > 0) {
    const byVerse = new Map<number, Lyric>();
    lyricElements.forEach((lyricElement, order) => {
      const verse = Number(lyricElement.getAttribute("number") ?? order + 1);
      const text = childText(lyricElement, "text");
      if (!text) return;
      byVerse.set(verse, {
        text,
        syllabic: childText(lyricElement, "syllabic") as Lyric["syllabic"],
      });
      if (lyricElement.getElementsByTagName("extend").length > 0) {
        warn("Skipped lyric <extend> (melisma extender lines)");
      }
    });
    if (byVerse.size > 0) {
      const verseCount = Math.max(...byVerse.keys());
      lyrics = Array.from(
        { length: verseCount },
        (_, index) => byVerse.get(index + 1) ?? { text: "" }
      );
    }
  }

  const restElement = noteElement.getElementsByTagName("rest")[0];
  const typeName = childText(noteElement, "type");
  let noteValue = typeName ? NOTE_TYPES[typeName] : undefined;
  if (typeName && !noteValue) {
    warn(`Unsupported note type "${typeName}"; using quarter`);
    noteValue = "quarter";
  }
  if (!noteValue) {
    // whole-measure rests carry no <type>; grace notes usually render as
    // eighths when unspecified
    if (restElement) noteValue = "whole";
    else if (graceElement) noteValue = "eighth";
    else {
      warn("Skipped a <note> with no <type>");
      return undefined;
    }
  }

  const note: ParsedNote = {
    voice: childText(noteElement, "voice") ?? "1",
    staff: Number(childText(noteElement, "staff") ?? 1),
    chordWithPrevious: noteElement.getElementsByTagName("chord").length > 0,
    rest: Boolean(restElement),
    noteValue,
    dotted: noteElement.getElementsByTagName("dot").length > 0,
    tieStart: false,
    tieStop: false,
    tupletStart: false,
    tupletStop: false,
    wedgeStop: false,
    lyrics,
    isGrace: Boolean(graceElement),
    graceSlash: graceElement?.getAttribute("slash") === "yes",
  };
  if (noteElement.getElementsByTagName("dot").length > 1) {
    warn("Double dots reduced to a single dot");
  }

  const pitchElement = noteElement.getElementsByTagName("pitch")[0];
  if (pitchElement) {
    const step = childText(pitchElement, "step") as Pitch["step"];
    const octave = Number(childText(pitchElement, "octave"));
    const accidentalName = childText(noteElement, "accidental");
    const alterValue = childText(pitchElement, "alter");
    const alter = accidentalName
      ? ACCIDENTAL_NAMES[accidentalName]
      : alterValue
        ? ALTER_TO_ACCIDENTAL[alterValue]
        : undefined;
    if (alterValue && !accidentalName && !alter && alterValue !== "0") {
      warn(`Unsupported <alter>${alterValue}</alter> (microtones?)`);
    }
    note.pitch = { step, octave: octave as Pitch["octave"], alter };
  }

  for (const beam of Array.from(noteElement.getElementsByTagName("beam"))) {
    if ((beam.getAttribute("number") ?? "1") !== "1") continue;
    const state = beam.textContent?.trim();
    if (state === "begin" || state === "continue" || state === "end") {
      note.beam = state;
    }
  }

  const timeMod = noteElement.getElementsByTagName("time-modification")[0];
  if (timeMod) {
    const actual = Number(childText(timeMod, "actual-notes"));
    const normal = Number(childText(timeMod, "normal-notes"));
    if (actual && normal) note.timeMod = [actual, normal];
  }

  for (const tie of Array.from(noteElement.getElementsByTagName("tie"))) {
    if (tie.getAttribute("type") === "start") note.tieStart = true;
    if (tie.getAttribute("type") === "stop") note.tieStop = true;
  }

  const notations = noteElement.getElementsByTagName("notations")[0];
  if (notations) {
    for (const slur of Array.from(notations.getElementsByTagName("slur"))) {
      const type = slur.getAttribute("type");
      const number = slur.getAttribute("number") ?? "1";
      if (type === "start") note.slurStart = number;
      if (type === "stop") note.slurStop = number;
    }
    for (const tuplet of Array.from(
      notations.getElementsByTagName("tuplet")
    )) {
      const type = tuplet.getAttribute("type");
      if (type === "start") note.tupletStart = true;
      if (type === "stop") note.tupletStop = true;
    }
    const articulations = notations.getElementsByTagName("articulations")[0];
    if (articulations) {
      const found: ArticulationType[] = [];
      for (const mark of Array.from(articulations.children)) {
        const mapped = ARTICULATION_MAP[mark.tagName];
        if (mapped) found.push(mapped);
        else warn(`Skipped articulation <${mark.tagName}>`);
      }
      note.articulation = combineArticulations(found, warn);
    }
    for (const skipped of ["ornaments", "technical", "arpeggiate", "fermata"]) {
      if (notations.getElementsByTagName(skipped).length > 0) {
        warn(`Skipped <${skipped}> notations`);
      }
    }
  }

  return note;
}

function combineArticulations(
  found: ArticulationType[],
  warn: (message: string) => void
): ArticulationType | undefined {
  if (found.length === 0) return undefined;
  if (found.length === 1) return found[0];
  const key = [...found].sort().join("+");
  const combined = COMBINED_ARTICULATIONS[key];
  if (combined) return combined;
  warn(`Multiple articulations (${found.join(", ")}) reduced to ${found[0]}`);
  return found[0];
}

/* ---------- grouping: chords, then beams/tuplets/wedges/slurs ---------- */

interface EventDesc {
  node: ReactNode;
  beam?: "begin" | "continue" | "end";
  tupletStart: boolean;
  tupletStop: boolean;
  timeMod?: [number, number];
  slurStart: boolean;
  slurStop: boolean;
  wedgeStart?: "crescendo" | "diminuendo";
  wedgeStop: boolean;
  ottavaStart?: OttavaType;
  ottavaStop: boolean;
}

function buildVoiceEvents(
  notes: ParsedNote[],
  warn: (message: string) => void
): ReactNode[] {
  // 1) merge chorded notes into NoteStacks
  const groups: ParsedNote[][] = [];
  for (const note of notes) {
    if (note.chordWithPrevious && groups.length > 0) {
      groups[groups.length - 1].push(note);
    } else {
      groups.push([note]);
    }
  }

  /*
    Slurs contained in this measure-voice become Slur wrappers below; a
    boundary whose partner lies in another measure becomes a slur marker
    prop instead, and the staff-level CurveOverlay draws that curve across
    the barline (or system break). Stops resolve before starts so one note
    can close a slur and open the next; the MusicXML "number" attribute
    becomes the pairing id.
  */
  const groupSlurStart = groups.map((group) =>
    group.map((n) => n.slurStart).find((v) => v !== undefined)
  );
  const groupSlurStop = groups.map((group) =>
    group.map((n) => n.slurStop).find((v) => v !== undefined)
  );
  const startMatched = new Array<boolean>(groups.length).fill(false);
  const stopMatched = new Array<boolean>(groups.length).fill(false);
  const openStarts: number[] = [];
  groups.forEach((_, index) => {
    if (groupSlurStop[index] !== undefined) {
      const startIndex = openStarts.pop();
      if (startIndex !== undefined) {
        startMatched[startIndex] = true;
        stopMatched[index] = true;
      }
    }
    if (groupSlurStart[index] !== undefined) openStarts.push(index);
  });
  const slurMarker = (index: number): SlurMarker | undefined => {
    const start =
      groupSlurStart[index] !== undefined && !startMatched[index]
        ? `xml-${groupSlurStart[index]}`
        : undefined;
    const end =
      groupSlurStop[index] !== undefined && !stopMatched[index]
        ? `xml-${groupSlurStop[index]}`
        : undefined;
    return start || end ? { start, end } : undefined;
  };

  let events: EventDesc[] = groups.map((group, index) => {
    const first = group[0];
    const shared = {
      beam: first.beam,
      tupletStart: group.some((n) => n.tupletStart),
      tupletStop: group.some((n) => n.tupletStop),
      timeMod: first.timeMod,
      slurStart: startMatched[index],
      slurStop: stopMatched[index],
      wedgeStart: first.wedgeStart,
      wedgeStop: group.some((n) => n.wedgeStop),
      ottavaStart: first.ottavaStart,
      ottavaStop: group.some((n) => n.ottavaStop),
    };
    if (group.length > 1) {
      const pitches: StackedNote[] = group.map((n) => ({ pitch: n.pitch }));
      if (group.some((n) => n.tieStart || n.tieStop)) {
        warn("Skipped ties on chord noteheads");
      }
      return {
        node: (
          <NoteStack
            key={index}
            noteValue={first.noteValue}
            dotted={first.dotted ? 1 : undefined}
            pitches={pitches}
            articulation={first.articulation}
            dynamic={first.dynamic}
            text={first.text}
            lyrics={first.lyrics}
            grace={first.grace}
            slur={slurMarker(index)}
          />
        ),
        ...shared,
      };
    }
    if (first.rest) {
      return {
        node: (
          <Note
            key={index}
            rest
            noteValue={first.noteValue}
            dotted={first.dotted ? 1 : undefined}
            dynamic={first.dynamic}
            text={first.text}
          />
        ),
        ...shared,
      };
    }
    return {
      node: (
        <Note
          key={index}
          noteValue={first.noteValue}
          dotted={first.dotted ? 1 : undefined}
          pitch={first.pitch}
          tie={first.tieStart ? "start" : first.tieStop ? "stop" : undefined}
          articulation={first.articulation}
          dynamic={first.dynamic}
          text={first.text}
          lyrics={first.lyrics}
          grace={first.grace}
          slur={slurMarker(index)}
        />
      ),
      ...shared,
    };
  });

  // 2) beams
  events = wrapRange(
    events,
    (event) => event.beam === "begin",
    (event) => event.beam === "end",
    (members, key) => (
      <BeamContainer key={`beam-${key}`}>
        {members.map((member) => member.node)}
      </BeamContainer>
    ),
    warn,
    "beam"
  );

  // 3) tuplets
  events = wrapRange(
    events,
    (event) => event.tupletStart,
    (event) => event.tupletStop,
    (members, key) => (
      <Tuplet key={`tuplet-${key}`} ratio={members[0].timeMod ?? [3, 2]}>
        {members.map((member) => member.node)}
      </Tuplet>
    ),
    warn,
    "tuplet"
  );

  // 4) wedges (hairpins)
  events = wrapRange(
    events,
    (event) => event.wedgeStart !== undefined,
    (event) => event.wedgeStop,
    (members, key) => (
      <Hairpin key={`wedge-${key}`} type={members[0].wedgeStart}>
        {members.map((member) => member.node)}
      </Hairpin>
    ),
    warn,
    "wedge"
  );

  // 5) octave-shift lines. Unlike the other spans, the stop marker is
  // EXCLUSIVE: MusicXML places <octave-shift type="stop"/> before the
  // first note back at pitch, so the marked note stays outside the
  // wrapper (re-octaving it would change its staff position). Spans
  // crossing the barline are skipped: rendering the pitches loco is
  // pitch-accurate, just without the line.
  {
    const wrapped: EventDesc[] = [];
    let open: EventDesc[] | null = null;
    let openKey = 0;
    const closeOpen = () => {
      if (!open) return;
      wrapped.push({
        node: (
          <Ottava key={`ottava-${openKey}`} type={open[0].ottavaStart}>
            {open.map((member) => member.node)}
          </Ottava>
        ),
        tupletStart: false,
        tupletStop: false,
        // the outer slur pass still needs boundaries carried by members
        slurStart: open.some((member) => member.slurStart),
        slurStop: open.some((member) => member.slurStop),
        wedgeStop: false,
        ottavaStart: undefined,
        ottavaStop: false,
      });
      open = null;
    };
    events.forEach((event, index) => {
      if (open && event.ottavaStop) closeOpen();
      if (!open && event.ottavaStart !== undefined) {
        open = [];
        openKey = index;
      }
      if (open) open.push(event);
      else wrapped.push(event);
    });
    if (open !== null) {
      warn("Skipped an octave-shift crossing the barline");
      wrapped.push(...(open as EventDesc[]));
    }
    events = wrapped;
  }

  // 6) slurs (outermost)
  events = wrapRange(
    events,
    (event) => event.slurStart,
    (event) => event.slurStop,
    (members, key) => (
      <Slur key={`slur-${key}`}>{members.map((member) => member.node)}</Slur>
    ),
    warn,
    "slur"
  );

  return events.map((event) => event.node);
}

/*
  Group runs of events from a start marker to a stop marker into a wrapper.
  The wrapper inherits the members' remaining (outer) markers so later
  passes can still wrap it. Unmatched markers are dropped with a warning.
*/
function wrapRange(
  events: EventDesc[],
  isStart: (event: EventDesc) => boolean,
  isStop: (event: EventDesc) => boolean,
  wrap: (members: EventDesc[], key: number) => ReactNode,
  warn: (message: string) => void,
  label: string
): EventDesc[] {
  const result: EventDesc[] = [];
  let open: EventDesc[] | null = null;
  events.forEach((event, index) => {
    if (open === null && isStart(event)) {
      open = [event];
      if (isStop(event) && open.length > 0) {
        // start and stop on the same event: nothing to span
        result.push(event);
        open = null;
      }
      return;
    }
    if (open !== null) {
      open.push(event);
      if (isStop(event)) {
        const members = open;
        result.push({
          node: wrap(members, index),
          beam: undefined,
          tupletStart: members.some(
            (member) => member.tupletStart && !isStart(member)
          ),
          tupletStop: members.some(
            (member) => member.tupletStop && !isStop(member)
          ),
          timeMod: members.find((member) => member.timeMod)?.timeMod,
          slurStart: members.some(
            (member) => member.slurStart && !isStart(member)
          ),
          slurStop: members.some((member) => member.slurStop && !isStop(member)),
          wedgeStart: members.find(
            (member) => member.wedgeStart && !isStart(member)
          )?.wedgeStart,
          wedgeStop: members.some(
            (member) => member.wedgeStop && !isStop(member)
          ),
          ottavaStart: members.find(
            (member) => member.ottavaStart && !isStart(member)
          )?.ottavaStart,
          ottavaStop: members.some(
            (member) => member.ottavaStop && !isStop(member)
          ),
        });
        open = null;
      }
      return;
    }
    result.push(event);
  });
  if (open !== null) {
    warn(`Unclosed ${label} marker; left ungrouped`);
    result.push(...(open as EventDesc[]));
  }
  return result;
}

/* ---------------------------- assembly ---------------------------- */

function buildStaffChildren(
  voices: Map<string, ParsedNote[]> | undefined,
  warn: (message: string) => void
): ReactNode {
  if (!voices || voices.size === 0) {
    return <Note rest noteValue="whole" />;
  }
  const voiceIds = Array.from(voices.keys()).sort();
  if (voiceIds.length === 1) {
    return buildVoiceEvents(voices.get(voiceIds[0])!, warn);
  }
  if (voiceIds.length > 2) {
    warn(
      `${voiceIds.length} voices on one staff; only the first two are rendered`
    );
  }
  return voiceIds.slice(0, 2).map((voiceId, index) => (
    <Voice key={voiceId} stem={index === 0 ? "upStem" : "downStem"}>
      {buildVoiceEvents(voices.get(voiceId)!, warn)}
    </Voice>
  ));
}

function buildMeasureElement(
  measure: ParsedMeasure,
  staff: number,
  clefKey: string | number | undefined,
  warn: (message: string) => void
): ReactElement {
  const attributes = measure.attributes;
  return (
    <Measure
      key={clefKey}
      clef={attributes.clefs.get(staff)}
      fifths={attributes.fifths}
      time={attributes.time}
      tempo={staff === 1 ? measure.tempo : undefined}
      ending={staff === 1 ? measure.ending : undefined}
      barline={measure.barline}
      startRepeat={measure.startRepeat || undefined}
    >
      {buildStaffChildren(measure.staves.get(staff), warn)}
    </Measure>
  );
}

function assemble(
  parsedParts: { id: string; measures: ParsedMeasure[] }[],
  partNames: Map<string, string>,
  warn: (message: string) => void
): ReactElement {
  const measureCount = Math.max(
    ...parsedParts.map((part) => part.measures.length)
  );
  if (parsedParts.some((part) => part.measures.length !== measureCount)) {
    warn("Parts have differing measure counts; shorter parts are padded");
  }

  // Single part with two staves: a grand staff
  if (
    parsedParts.length === 1 &&
    parsedParts[0].measures.some((measure) => measure.attributes.staves >= 2)
  ) {
    const part = parsedParts[0];
    if (part.measures.some((measure) => measure.attributes.staves > 2)) {
      warn("More than two staves in a part; rendering the first two");
    }
    return (
      <GrandStaff>
        {part.measures.map((measure, index) => (
          <GrandMeasure
            key={index}
            barline={measure.barline}
            startRepeat={measure.startRepeat || undefined}
            upper={buildMeasureElement(measure, 1, index, warn)}
            lower={buildMeasureElement(measure, 2, index, warn)}
          />
        ))}
      </GrandStaff>
    );
  }

  // Multiple single-staff parts: a score
  if (parsedParts.length > 1) {
    if (
      parsedParts.some((part) =>
        part.measures.some((measure) => measure.attributes.staves >= 2)
      )
    ) {
      warn(
        "Multi-staff parts inside a multi-part score render their first staff only"
      );
    }
    const names = parsedParts.map(
      (part) => partNames.get(part.id) ?? part.id
    );
    return (
      <Score partNames={names}>
        {Array.from({ length: measureCount }, (_, measureIndex) => {
          const rowMeasures = parsedParts.map(
            (part) => part.measures[measureIndex]
          );
          const first = rowMeasures.find(Boolean)!;
          return (
            <ScoreMeasure
              key={measureIndex}
              barline={first.barline}
              startRepeat={first.startRepeat || undefined}
              parts={rowMeasures.map((measure, partIndex) =>
                measure ? (
                  buildMeasureElement(measure, 1, partIndex, warn)
                ) : (
                  <Measure key={partIndex}>
                    <Note rest noteValue="whole" />
                  </Measure>
                )
              )}
            />
          );
        })}
      </Score>
    );
  }

  // One part, one staff
  const part = parsedParts[0];
  return (
    <Staff>
      {part.measures.map((measure, index) =>
        buildMeasureElement(measure, 1, index, warn)
      )}
    </Staff>
  );
}
