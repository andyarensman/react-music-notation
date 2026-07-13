import { useContext } from "react";
import "./Note.css";
import "../global.css";
import {
  accidentalGlyphs,
  articulationGlyphs,
  dottedGlyph,
  dynamicGlyphs,
  flagGlyphs,
  noteGlyphs,
} from "../helpers/glyphs";
import {
  articulationDefaultsAbove,
  assignAccidentalColumns,
  getArticulationIndex,
  getChordStem,
  getLedgerLines,
  getNoteFlex,
  noteTranslations,
  positionIndex,
  resolvePosition,
  StemPositions,
} from "../helpers/helpers";
import {
  ArticulationType,
  DynamicType,
  NoteProps,
  StackedNote,
} from "../helpers/types";
import { ClefContext } from "./ClefContext";

export interface NoteStackProps {
  pitches: StackedNote[];
  noteValue: NoteProps["noteValue"];
  dotted?: 1;
  stem?: "upStem" | "downStem" | "noStem";
  stemEndValue?: number;
  articulation?: ArticulationType;
  articulationPlacement?: "above" | "below";
  dynamic?: DynamicType;
}

const STEM_LENGTH = 28; // 3.5 staff-spaces in viewBox units
const MIDDLE_LINE_STEM_Y = 64; // StemPositions["line-3"], the viewBox origin for css tops

export const NoteStack = (props: NoteStackProps) => {
  const clef = useContext(ClefContext);
  const { pitches, noteValue, dotted, stemEndValue } = props;

  // Resolve every notehead's position and sort top-of-staff first
  const notes = pitches
    .map((stackedNote) => {
      const position = resolvePosition(stackedNote, clef);
      return { ...stackedNote, position, index: positionIndex(position) };
    })
    .sort((a, b) => a.index - b.index);

  if (notes.length === 0) {
    return null;
  }

  const topPosition = notes[0].position;
  const bottomPosition = notes[notes.length - 1].position;

  const stem =
    noteValue === "whole"
      ? "noStem"
      : props.stem ?? getChordStem(notes.map((note) => note.position));

  // The shared stem: beamed chords (stem forced to noStem + a stemEndValue
  // from BeamContainer) run from the notehead farthest from the beam to the
  // beam; unbeamed stems run 3.5 spaces past the outer notehead
  let stemLine: { y1: number; y2: number } | null = null;
  let stemUp = false;
  if (stem === "upStem") {
    stemUp = true;
    stemLine = {
      y1: StemPositions[bottomPosition],
      y2: StemPositions[topPosition] - STEM_LENGTH,
    };
  } else if (stem === "downStem") {
    stemLine = {
      y1: StemPositions[topPosition],
      y2: StemPositions[bottomPosition] + STEM_LENGTH,
    };
  } else if (stemEndValue !== undefined) {
    stemUp = stemEndValue < StemPositions[topPosition];
    stemLine = {
      y1: stemUp ? StemPositions[bottomPosition] : StemPositions[topPosition],
      y2: stemEndValue,
    };
  }

  /*
    Seconds flip to the far side of the stem. Walk away from the stem's
    attachment end (bottom-up for up-stems and stemless chords, top-down for
    down-stems); a note one step from an unflipped neighbor flips.
  */
  const walkUp = stemUp || stemLine === null;
  const flipped = new Array<boolean>(notes.length).fill(false);
  const walkOrder = [...notes.keys()];
  if (walkUp) walkOrder.reverse();
  for (let i = 1; i < walkOrder.length; i++) {
    const current = walkOrder[i];
    const previous = walkOrder[i - 1];
    const isSecond =
      Math.abs(notes[current].index - notes[previous].index) === 1;
    if (isSecond && !flipped[previous]) {
      flipped[current] = true;
    }
  }
  const anyRightFlip = walkUp && flipped.some(Boolean);
  const anyLeftFlip = !walkUp && flipped.some(Boolean);

  // Accidentals stack into columns leftward so they never overlap; when
  // noteheads flip left of the stem, the whole accidental block shifts
  // further left to clear them
  const notesWithAccidentals = notes
    .map((note, arrayIdx) => ({ ...note, arrayIdx }))
    .filter((note) => note.pitch && note.pitch.alter);
  const accidentalColumns = assignAccidentalColumns(
    notesWithAccidentals.map((note) => note.index)
  );
  const flipClearance = anyLeftFlip ? 1.15 : 0;
  const maxColumn = accidentalColumns.length
    ? Math.max(...accidentalColumns)
    : 0;
  const accidentalMargin = notesWithAccidentals.length
    ? 1.5 + flipClearance + maxColumn * 1.1
    : 0;

  const ledgerLines = Array.from(
    new Set(notes.flatMap((note) => getLedgerLines(note.position)))
  );
  const isWide = noteValue === "whole";

  const showFlag =
    stemLine !== null &&
    stemEndValue === undefined &&
    (noteValue === "eighth" || noteValue === "16th" || noteValue === "32nd");
  // css top offset of the stem tip, in staff-spaces below the middle line
  const flagTop = stemLine ? (stemLine.y2 - MIDDLE_LINE_STEM_Y) / 8 : 0;

  // Articulations follow the same Gould rules as single notes: notehead
  // side by default (relative to the outer notehead there), marcato above,
  // explicit placement (a Voice's stem side) wins and moves past the stem
  const articulationBelow = props.articulationPlacement
    ? props.articulationPlacement === "below"
    : props.articulation && articulationDefaultsAbove(props.articulation)
      ? false
      : walkUp;
  const articulationTarget = articulationBelow
    ? notes[notes.length - 1]
    : notes[0];
  const articulationAtStemEnd =
    stemLine !== null && articulationBelow === !stemUp;
  const articulationTopSpaces = props.articulation
    ? (getArticulationIndex({
        articulation: props.articulation,
        noteIndex: articulationTarget.index,
        below: articulationBelow,
        stemTipIndex:
          articulationAtStemEnd && stemLine
            ? Math.round(stemLine.y2 / 4) - 8
            : undefined,
      }) -
        8) *
      0.5
    : 0;

  return (
    <div
      className="note-container"
      style={{
        flexGrow: getNoteFlex(props),
        marginLeft: accidentalMargin
          ? `calc(var(--staff-space) * ${accidentalMargin})`
          : undefined,
      }}
    >
      {ledgerLines.map((ledger) => (
        <div
          key={ledger}
          className={`ledger-line ledger-${ledger}${isWide || anyRightFlip ? " ledger-wide" : ""}`}
        ></div>
      ))}
      {notesWithAccidentals.map((note, accidentalIdx) => {
        const alter = note.pitch!.alter!;
        const baseOffset = alter.startsWith("double") ? 1.6 : 1.25;
        const left =
          baseOffset + flipClearance + accidentalColumns[accidentalIdx] * 1.1;
        return (
          <div
            key={`accidental-${note.arrayIdx}`}
            className={`leland note ${note.position}`}
            style={{ left: `calc(var(--staff-space) * ${-left})` }}
          >
            {accidentalGlyphs[alter]}
          </div>
        );
      })}
      {notes.map((note, arrayIdx) => (
        <div
          key={arrayIdx}
          className={`leland note ${note.position}${
            flipped[arrayIdx]
              ? walkUp
                ? " notehead-flip-right"
                : " notehead-flip-left"
              : ""
          }`}
        >
          {noteGlyphs[noteTranslations[noteValue]]["noStem"]}
        </div>
      ))}
      {dotted &&
        notes.map((note, arrayIdx) => (
          <div
            key={`dot-${arrayIdx}`}
            className={`leland note aug-dot ${note.position}${
              note.position.startsWith("line") ? " aug-dot-on-line" : ""
            }${isWide ? " aug-dot-wide" : ""}${anyRightFlip ? " aug-dot-shifted" : ""}`}
          >
            {dottedGlyph.dotted}
          </div>
        ))}
      {showFlag && (
        <div
          className="leland note"
          style={{
            top: `calc(var(--staff-space) * ${flagTop})`,
            left: stemUp ? "calc(var(--staff-space) * 1.25)" : undefined,
          }}
        >
          {flagGlyphs[noteValue as "eighth" | "16th" | "32nd"][
            stemUp ? "upStem" : "downStem"
          ]}
        </div>
      )}
      {props.articulation && (
        <div
          className="leland note articulation"
          style={{
            top: `calc(var(--staff-space) * ${articulationTopSpaces})`,
          }}
        >
          {articulationGlyphs[props.articulation][
            articulationBelow ? "below" : "above"
          ]}
        </div>
      )}
      {props.dynamic && (
        <div
          className={`leland note dynamic-marking${
            props.articulation && articulationBelow
              ? " dynamic-marking-low"
              : ""
          }`}
        >
          {dynamicGlyphs[props.dynamic]}
        </div>
      )}
      {stemLine && (
        <div className={"stem-container " + (stemUp ? "stem-above" : "")}>
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="stem"
          >
            <line
              x1="0"
              y1={stemLine.y1}
              x2="0"
              y2={stemLine.y2}
              stroke="black"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
