import { useContext } from "react";
import "./Note.css";
import "../global.css";
import { accidentalGlyphs, dottedGlyph, noteGlyphs } from "../helpers/glyphs";
import {
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
  // notehead center sits (index - 4) half-spaces below the top staff line
  const tieTopSpaces =
    (positionIndex(position) - 4) * 0.5 + (tieAbove ? -1.85 : 0.6);

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
