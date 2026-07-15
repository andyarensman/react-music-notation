import { useContext } from "react";
import "./Note.css";
import "../global.css";
import {
  accidentalGlyphs,
  articulationGlyphs,
  dottedGlyph,
  dynamicGlyphs,
  noteGlyphs,
} from "../helpers/glyphs";
import {
  MIDDLE_LINE_INDEX,
  TOP_LINE_INDEX,
  articulationCentersOnStem,
  articulationDefaultsAbove,
  articulationLeftSs,
  getArticulationIndex,
  getDefaultStem,
  getLedgerLines,
  getNoteFlex,
  noteTranslations,
  positionIndex,
  resolvePosition,
  StemPositions,
} from "../helpers/helpers";
import { NoteProps } from "../helpers/types";
import { ClefContext } from "./ClefContext";

/**
 * Renders a single note or rest: notehead/rest glyph, optional accidental,
 * ledger lines, augmentation dot, stem, tie curve, articulation mark,
 * dynamic marking, and expression text. Accepts either a pitched note
 * (`NoteValueProps`) or a rest (`RestProps`) — see `NoteProps`.
 *
 * @example
 * ```tsx
 * <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
 * <Note rest noteValue="quarter" dotted={1} />
 * ```
 */
export const Note = (props: NoteProps) => {
  const clef = useContext(ClefContext);
  const { noteValue, rest, dotted, stemEndValue } = props;
  const position = resolvePosition(props, clef);
  const stem = !rest ? props.stem || getDefaultStem(position) : undefined;
  const pitch = !rest ? props.pitch : null;

  const stemStart = StemPositions[position];
  const ledgerLines = rest ? [] : getLedgerLines(position);
  const isWide = noteValue === "whole";
  const dotOnLine = position.startsWith("line");

  // Ties curve on the side opposite the stem (real or implied) unless a
  // Voice dictates the side
  const tie = !rest ? props.tie : undefined;
  const effectiveStemUp =
    stem === "upStem" ||
    (stem === "noStem" &&
      (stemEndValue !== undefined
        ? stemEndValue < stemStart
        : getDefaultStem(position) === "upStem"));
  const tieAbove = props.tieDirection
    ? props.tieDirection === "above"
    : !effectiveStemUp;
  // notehead center sits (index - top line) half-spaces below the top line
  const tieTopSpaces =
    (positionIndex(position) - TOP_LINE_INDEX) * 0.5 +
    (tieAbove ? -1.85 : 0.6);

  /*
    Articulations (Gould pp. 115-121): notehead side by default, marcato
    above the staff regardless of stem, and an explicit placement (a Voice's
    stem side) wins. When the mark lands on the stem side it moves past the
    stem tip; otherwise it snaps to a clear stave-space next to the notehead.
  */
  const articulation = !rest ? props.articulation : undefined;
  const articulationBelow = props.articulationPlacement
    ? props.articulationPlacement === "below"
    : articulation && articulationDefaultsAbove(articulation)
      ? false
      : effectiveStemUp;
  const hasRealStem =
    !rest &&
    noteValue !== "whole" &&
    (stem === "upStem" ||
      stem === "downStem" ||
      (stem === "noStem" && stemEndValue !== undefined));
  const articulationAtStemEnd =
    hasRealStem && articulationBelow === !effectiveStemUp;
  let stemTipIndex: number | undefined;
  if (articulationAtStemEnd) {
    stemTipIndex =
      stem === "noStem" && stemEndValue !== undefined
        ? Math.round((stemEndValue - 64) / 4) + MIDDLE_LINE_INDEX
        : positionIndex(position) + (effectiveStemUp ? -7 : 7);
  }
  const articulationTopSpaces = articulation
    ? (getArticulationIndex({
        articulation,
        noteIndex: positionIndex(position),
        below: articulationBelow,
        stemTipIndex,
      }) -
        MIDDLE_LINE_INDEX) *
      0.5
    : 0;
  // Centred on the notehead, except staccato dots at a stem end, which
  // center on the stem itself
  const articulationLeftSpaces = articulation
    ? articulationAtStemEnd && articulationCentersOnStem(articulation)
      ? (effectiveStemUp ? 1.25 : 0) - 0.16
      : articulationLeftSs[articulation]
    : 0;

  // Reserve horizontal room for the accidental so it doesn't overlap the
  // previous note; double accidentals are wider
  const accidentalMargin = pitch?.alter
    ? pitch.alter.startsWith("double")
      ? 1.75
      : 1.5
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
          className={`ledger-line ledger-${ledger}${isWide ? " ledger-wide" : ""}`}
        ></div>
      ))}
      {pitch && pitch.alter && (
        <div className={`leland note ${pitch.alter} ${position}`}>
          {accidentalGlyphs[pitch.alter]}
        </div>
      )}
      <div className={"leland note " + position}>
        {rest
          ? noteGlyphs[noteTranslations[noteValue]]["rest"]
          : noteGlyphs[noteTranslations[noteValue]][stem!]}
      </div>
      {dotted && (
        <div
          className={`leland note aug-dot ${position}${dotOnLine ? " aug-dot-on-line" : ""}${isWide ? " aug-dot-wide" : ""}`}
        >
          {dottedGlyph.dotted}
        </div>
      )}
      {articulation && (
        <div
          className="leland note articulation"
          style={{
            top: `calc(var(--staff-space) * ${articulationTopSpaces})`,
            left: `calc(var(--staff-space) * ${articulationLeftSpaces})`,
          }}
        >
          {articulationGlyphs[articulation][
            articulationBelow ? "below" : "above"
          ]}
        </div>
      )}
      {props.dynamic && (
        <div
          className={`leland note dynamic-marking${
            articulation && articulationBelow ? " dynamic-marking-low" : ""
          }`}
        >
          {dynamicGlyphs[props.dynamic]}
        </div>
      )}
      {props.text && <div className="note-text">{props.text}</div>}
      {tie === "start" && (
        <div
          className="tie-container"
          style={{
            top: `calc((var(--staff-space) * 12.125 - var(--staff-line-thickness)) / 2 + var(--staff-space) * ${tieTopSpaces})`,
          }}
        >
          <svg
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
            className="tie-svg"
          >
            {tieAbove ? (
              <path d="M2,8 Q50,-2 98,8 Q50,4 2,8" />
            ) : (
              <path d="M2,2 Q50,12 98,2 Q50,6 2,2" />
            )}
          </svg>
        </div>
      )}
      {stem === "noStem" && stemEndValue && (
        <div
          className={
            "stem-container " + (stemEndValue < stemStart ? "stem-above" : "")
          }
        >
          <svg
            viewBox="0 0 100 129"
            preserveAspectRatio="none"
            className="stem"
          >
            <line
              x1="0"
              y1={stemStart}
              x2="0"
              y2={stemEndValue}
              stroke="black"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
