import "./Note.css";
import "../global.css";
import { accidentalGlyphs, dottedGlyph, noteGlyphs } from "../helpers/glyphs";
import {
  getDefaultStem,
  getLedgerLines,
  getNoteFlex,
  noteTranslations,
  StemPositions,
} from "../helpers/helpers";
import { NoteProps } from "../helpers/types";

export const Note = (props: NoteProps) => {
  const { noteValue, rest, dotted, stemEndValue } = props;
  const position = props.position || "line-3";
  const stem = !rest ? props.stem || getDefaultStem(position) : undefined;
  const pitch = !rest ? props.pitch : null;

  const stemStart = StemPositions[position];
  const ledgerLines = rest ? [] : getLedgerLines(position);
  const isWide = noteValue === "whole";
  const dotOnLine = position.startsWith("line");

  return (
    <div className="note-container" style={{ flexGrow: getNoteFlex(props) }}>
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
