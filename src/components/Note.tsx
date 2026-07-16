import {
  CSSProperties,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  SyntheticEvent,
  useContext,
} from "react";
import "./Note.css";
import "../global.css";
import {
  accidentalGlyphs,
  altNoteheadGlyphs,
  articulationGlyphs,
  clefGlyphs,
  dottedGlyph,
  dynamicGlyphs,
  flagGlyphs,
  graceNoteGlyphs,
  noteGlyphs,
} from "../helpers/glyphs";
import {
  MIDDLE_LINE_INDEX,
  TOP_LINE_INDEX,
  applyOttavaShift,
  articulationCentersOnStem,
  articulationDefaultsAbove,
  articulationLeftSs,
  getArticulationIndex,
  getCurveAnchors,
  getDefaultStem,
  getLedgerLines,
  getNoteFlex,
  lyricsMinWidthSs,
  normalizeLyric,
  noteAriaLabel,
  noteTranslations,
  positionIndex,
  resolvePosition,
  StemPositions,
} from "../helpers/helpers";
import { NoteInteractionInfo, NoteProps } from "../helpers/types";
import { ClefContext } from "./ClefContext";
import { OttavaContext } from "./OttavaContext";
import { InteractionContext } from "./InteractionContext";
import { MeasureNumberContext } from "./MeasureNumberContext";
import { CrossStaffContext, STAFF_STRIDE_VB } from "./CrossStaffContext";

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
  const ottava = useContext(OttavaContext);
  const crossContext = useContext(CrossStaffContext);
  const { noteValue, rest, dotted, stemEndValue } = props;

  /*
    Cross-staff notes (piano writing): the note keeps its rhythmic slot
    here, but its pitch resolves on the OTHER staff's clef and every glyph
    draws a staff-stride away (a CSS transform on the glyph divs). The
    stem svg stays in this staff's coordinate space with a shifted start,
    so a beamed stem simply grows across the gap to the shared beam.
  */
  const cross = !rest && props.crossStaff ? crossContext : null;
  const crossShiftVb = cross ? cross.directionSign * STAFF_STRIDE_VB : 0;
  const position = resolvePosition(
    applyOttavaShift(props, ottava),
    cross ? cross.otherClef : clef
  );
  const stem = !rest ? props.stem || getDefaultStem(position) : undefined;
  const pitch = !rest ? props.pitch : null;

  const stemStart = StemPositions[position] + crossShiftVb;
  const ledgerLines = rest ? [] : getLedgerLines(position);
  const isWide = noteValue === "whole";
  const dotOnLine = position.startsWith("line");

  /*
    Alternative noteheads (x, diamond, ...) render as a bare head plus a
    drawn stem — the combined note glyphs only exist for standard heads.
    Beamed notes already draw their stem to the beam via stemEndValue;
    unbeamed alternative heads get a standard-length stem and, for
    eighths and shorter, a standalone flag (the NoteStack pattern).
  */
  const notehead = !rest ? props.notehead : undefined;
  const altHeadGlyph = notehead
    ? altNoteheadGlyphs[notehead][
        noteValue === "whole"
          ? "whole"
          : noteValue === "half"
            ? "half"
            : "black"
      ]
    : undefined;
  const drawnStemEnd =
    stem === "noStem" && stemEndValue !== undefined
      ? stemEndValue
      : altHeadGlyph &&
          (stem === "upStem" || stem === "downStem") &&
          noteValue !== "whole"
        ? stemStart + (stem === "upStem" ? -28 : 28)
        : undefined;

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

  // Grace notes sit before the accidental, ~1.6 staff-spaces each
  const graces = !rest ? props.grace : undefined;
  // Each grace glyph's ink is ~1.6ss wide (notehead + stem + flag), so a
  // 1.7ss slot per grace plus a 0.5ss gap before the host (and 0.3ss lead-in)
  const graceMargin = graces?.length ? graces.length * 1.7 + 0.8 : 0;
  // A mid-measure clef change draws a small clef ahead of everything
  const clefChangeMargin = props.clefChange ? 3.4 : 0;
  const leadingMargin = clefChangeMargin + accidentalMargin + graceMargin;

  const lyrics = !rest ? props.lyrics : undefined;

  /*
    Publish curve geometry for the CurveOverlay (cross-measure/system slurs
    and ties): anchors and clearance lines in staff-spaces below the staff
    top line, plus tie/slur boundary markers. The overlay pairs markers
    across measures and draws what no in-measure container can.
  */
  const slur = !rest ? props.slur : undefined;
  const slurStartId =
    slur?.start === true ? "default" : slur?.start || undefined;
  const slurEndId = slur?.end === true ? "default" : slur?.end || undefined;
  const curveAnchors = !rest
    ? getCurveAnchors({
        topPosition: position,
        bottomPosition: position,
        stemUp: effectiveStemUp,
        hasStem: hasRealStem,
        stemEndVb: stem === "noStem" ? stemEndValue : undefined,
      })
    : undefined;
  /*
    Interactivity and accessibility: every event carries a spoken
    aria-label (the glyphs are PUA characters, meaningless to screen
    readers) with role="img" hiding the glyph internals. A click handler —
    per-note or score-level — upgrades it to a keyboard-reachable button;
    hover and selection recolor via currentColor (noteheads, stem, tie,
    ledgers, and dots all inherit).
  */
  const interaction = useContext(InteractionContext);
  const measureNumber = useContext(MeasureNumberContext);
  const clickable = Boolean(props.onClick || interaction.onNoteClick);
  const info: NoteInteractionInfo = {
    measureNumber,
    pitches: pitch ? [pitch] : [],
    positions: [position],
    noteValue,
    dotted: dotted !== undefined,
    rest: Boolean(rest),
  };
  const ariaLabel = noteAriaLabel({
    rest,
    pitches: info.pitches,
    noteValue,
    dotted: dotted !== undefined,
    graceCount: graces?.length,
  });
  const handleActivate = (event: SyntheticEvent<HTMLDivElement>) => {
    props.onClick?.(event as MouseEvent<HTMLDivElement>);
    interaction.onNoteClick?.(info, event);
  };
  const interactionAttributes = {
    role: clickable ? "button" : "img",
    "aria-label": ariaLabel,
    "aria-pressed":
      clickable && props.selected !== undefined ? props.selected : undefined,
    tabIndex: clickable ? 0 : undefined,
    onClick: clickable ? handleActivate : undefined,
    onKeyDown: clickable
      ? (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleActivate(event);
          }
        }
      : undefined,
    onMouseEnter: interaction.onNoteHover
      ? (event: MouseEvent<HTMLDivElement>) =>
          interaction.onNoteHover?.(info, event)
      : undefined,
    onMouseLeave: interaction.onNoteHover
      ? (event: MouseEvent<HTMLDivElement>) =>
          interaction.onNoteHover?.(null, event)
      : undefined,
  };
  const containerClass = `note-container${clickable ? " note-interactive" : ""}${
    props.selected ? " note-selected" : ""
  }${cross ? (cross.directionSign > 0 ? " note-cross-down" : " note-cross-up") : ""}`;

  const crossShiftSs = crossShiftVb / 8;
  const curveData = curveAnchors
    ? {
        "data-note-event": "",
        "data-stem-up": effectiveStemUp ? "1" : "0",
        "data-has-stem": hasRealStem ? "1" : "0",
        "data-anchor-above": curveAnchors.anchorAboveSs + crossShiftSs,
        "data-anchor-below": curveAnchors.anchorBelowSs + crossShiftSs,
        "data-obstacle-above": curveAnchors.obstacleAboveSs + crossShiftSs,
        "data-obstacle-below": curveAnchors.obstacleBelowSs + crossShiftSs,
        "data-tie-start": tie === "start" ? (tieAbove ? "above" : "below") : undefined,
        "data-tie-top": tie === "start" ? tieTopSpaces + crossShiftSs : undefined,
        "data-tie-stop": tie === "stop" ? "" : undefined,
        "data-slur-start": slurStartId,
        "data-slur-end": slurEndId,
        "data-slur-dir": slur?.direction,
      }
    : undefined;

  return (
    <div
      className={containerClass}
      {...interactionAttributes}
      {...curveData}
      style={
        {
          flexGrow: getNoteFlex(props),
          marginLeft: leadingMargin
            ? `calc(var(--staff-space) * ${leadingMargin})`
            : undefined,
          // widens the slot for long syllables; beam groups still override
          // via CSS so beam geometry stays flex-proportional
          "--note-min-width": lyrics?.length
            ? `calc(var(--staff-space) * ${lyricsMinWidthSs(lyrics)})`
            : undefined,
        } as CSSProperties
      }
    >
      {ledgerLines.map((ledger) => (
        <div
          key={ledger}
          className={`ledger-line ledger-${ledger}${isWide ? " ledger-wide" : ""}`}
        ></div>
      ))}
      {props.clefChange && (
        <div
          className={`leland note clef-change clef-change-${props.clefChange}`}
          style={{
            left: `calc(var(--staff-space) * ${-(accidentalMargin + graceMargin + 3.1)})`,
          }}
        >
          {clefGlyphs[props.clefChange]}
        </div>
      )}
      {graces?.map((graceNote, index) => {
        const gracePosition = resolvePosition(
          applyOttavaShift(graceNote, ottava),
          clef
        );
        const left = -(accidentalMargin + 0.5 + (graces.length - index) * 1.7);
        return (
          <div
            key={`grace-${index}`}
            className={`leland note ${gracePosition}`}
            style={{ left: `calc(var(--staff-space) * ${left})` }}
          >
            {graceNote.slash
              ? graceNoteGlyphs.acciaccaturaUp
              : graceNoteGlyphs.appoggiaturaUp}
          </div>
        );
      })}
      {pitch && pitch.alter && (
        <div className={`leland note ${pitch.alter} ${position}`}>
          {accidentalGlyphs[pitch.alter]}
        </div>
      )}
      <div className={"leland note " + position}>
        {rest
          ? noteGlyphs[noteTranslations[noteValue]]["rest"]
          : (altHeadGlyph ?? noteGlyphs[noteTranslations[noteValue]][stem!])}
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
      {lyrics?.map((entry, verse) => {
        const lyric = normalizeLyric(entry);
        const top = `calc(var(--staff-space) * ${13.1 + verse * 1.9})`;
        return (
          <Fragment key={`lyric-${verse}`}>
            <div className="lyric" style={{ top }}>
              {lyric.text}
            </div>
            {(lyric.syllabic === "begin" || lyric.syllabic === "middle") && (
              <div className="lyric lyric-hyphen" style={{ top }}>
                -
              </div>
            )}
          </Fragment>
        );
      })}
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
      {drawnStemEnd !== undefined && (
        <div
          className={
            "stem-container " + (drawnStemEnd < stemStart ? "stem-above" : "")
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
              y2={drawnStemEnd}
              stroke="currentColor"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
      {altHeadGlyph &&
        drawnStemEnd !== undefined &&
        stemEndValue === undefined &&
        (noteValue === "eighth" ||
          noteValue === "16th" ||
          noteValue === "32nd") && (
          <div
            className="leland note"
            style={{
              top: `calc(var(--staff-space) * ${(drawnStemEnd - 64) / 8})`,
              left: effectiveStemUp
                ? "calc(var(--staff-space) * 1.25)"
                : undefined,
            }}
          >
            {flagGlyphs[noteValue][effectiveStemUp ? "upStem" : "downStem"]}
          </div>
        )}
    </div>
  );
};
