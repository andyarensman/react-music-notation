import {
  CSSProperties,
  Fragment,
  KeyboardEvent,
  MouseEvent,
  MouseEventHandler,
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
  applyOttavaShift,
  articulationCentersOnStem,
  articulationDefaultsAbove,
  articulationLeftSs,
  getArticulationIndex,
  getChordStem,
  getCurveAnchors,
  getLedgerLines,
  getNoteFlex,
  lyricsMinWidthSs,
  normalizeLyric,
  noteAriaLabel,
  noteTranslations,
  resolvePosition,
  resolveStack,
  stackAccidentalMargin,
  stackFlips,
  StemPositions,
} from "../helpers/helpers";
import {
  ArticulationType,
  ClefType,
  DynamicType,
  GraceNote,
  LyricInput,
  NoteInteractionInfo,
  NoteProps,
  SlurMarker,
  StackedNote,
} from "../helpers/types";
import { ClefContext } from "./ClefContext";
import { OttavaContext } from "./OttavaContext";
import { InteractionContext } from "./InteractionContext";
import { MeasureNumberContext } from "./MeasureNumberContext";

export interface NoteStackProps {
  /**
   * One notehead per chord tone (`StackedNote`: a `pitch` or an explicit
   * `position`). Resolved and sorted top-of-staff first internally.
   */
  pitches: StackedNote[];
  /** Duration shared by every notehead in the chord. */
  noteValue: NoteProps["noteValue"];
  /** Adds an augmentation dot to every notehead in the chord. */
  dotted?: 1;
  /**
   * Stem direction for the shared stem. Defaults to the direction implied
   * by the notehead farthest from the middle line (`getChordStem`) unless
   * overridden here, by a `Voice`, or by `BeamContainer`. Whole-note chords
   * are always stemless regardless of this prop; `"noStem"` combined with
   * `stemEndValue` draws a custom-length beamed stem.
   */
  stem?: "upStem" | "downStem" | "noStem";
  /**
   * @internal Set by `BeamContainer` to draw a custom-length shared stem
   * that meets the beam line; not usually set manually.
   */
  stemEndValue?: number;
  /**
   * Articulation mark applied at the chord's outer notehead (the one
   * farthest from the stem); follows the same placement rules as `Note`'s
   * `articulation`.
   */
  articulation?: ArticulationType;
  /**
   * Forces the mark's side, overriding the notehead-side default. Inside a
   * `Voice`, this is set automatically so articulation sits at the stem end
   * instead of the notehead side; set this explicitly to override either
   * default.
   */
  articulationPlacement?: "above" | "below";
  /** Dynamic marking rendered below the staff at the chord's position. */
  dynamic?: DynamicType;
  /** Expression text ("dolce", "cresc.") in italics below the staff. */
  text?: string;
  /**
   * Lyric syllables under the chord, one entry per verse — same behavior as
   * `Note`'s `lyrics`.
   */
  lyrics?: LyricInput[];
  /** Grace notes rendered small before the chord, in playing order. */
  grace?: GraceNote[];
  /**
   * Slur boundary markers for slurs that cross barlines/system breaks —
   * same behavior as `Note`'s `slur`.
   */
  slur?: SlurMarker;
  /** A mid-measure clef change taking effect at this chord — see `Note`'s `clefChange`. */
  clefChange?: ClefType;
  /**
   * Click handler for the chord. Any click handler — this one or a
   * score-level `onNoteClick` — makes the chord interactive: pointer
   * cursor, keyboard focus (Tab), and Enter/Space activation.
   */
  onClick?: MouseEventHandler<HTMLDivElement>;
  /** Draws the chord in the selection color; state lives with the consumer. */
  selected?: boolean;
}

const STEM_LENGTH = 28; // 3.5 staff-spaces in viewBox units
const MIDDLE_LINE_STEM_Y = 64; // StemPositions["line-3"], the viewBox origin for css tops

/**
 * Renders a chord: a shared stem sized to the outer noteheads, seconds
 * flipped across the stem, accidentals stacked into non-colliding columns,
 * and (for unbeamed 8th/16th/32nd chords) a standalone flag glyph. See
 * "Chords (`NoteStack`)" in the README for the full derivation rules.
 *
 * @example
 * ```tsx
 * <NoteStack
 *   noteValue="quarter"
 *   pitches={[
 *     { pitch: { step: "C", octave: 3, alter: "sharp" } },
 *     { pitch: { step: "D", octave: 3, alter: "flat" } },
 *   ]}
 * />
 * ```
 */
export const NoteStack = (props: NoteStackProps) => {
  const clef = useContext(ClefContext);
  const ottava = useContext(OttavaContext);
  const { pitches, noteValue, dotted, stemEndValue } = props;

  // Resolve every notehead's position and sort top-of-staff first
  const notes = resolveStack(pitches, (stackedNote) =>
    resolvePosition(applyOttavaShift(stackedNote, ottava), clef)
  );

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

  // Seconds flipping and accidental columns come from the shared stack
  // layout helpers — BeamContainer uses the same math to compensate beam
  // geometry for the resulting margins
  const walkUp = stemUp || stemLine === null;
  const { flipped, anyLeftFlip, anyRightFlip } = stackFlips(notes, walkUp);
  const notesWithAccidentals = notes
    .map((note, arrayIdx) => ({ ...note, arrayIdx }))
    .filter((note) => note.pitch && note.pitch.alter);
  const { columns: accidentalColumns, margin: accidentalMargin } =
    stackAccidentalMargin(notes, anyLeftFlip);
  const flipClearance = anyLeftFlip ? 1.15 : 0;

  // Grace notes sit before the accidental block, ~1.6 staff-spaces each
  // Same slot math as Note: 1.7ss per grace + 0.5ss host gap + 0.3ss lead-in
  const graceMargin = props.grace?.length
    ? props.grace.length * 1.7 + 0.8
    : 0;
  const clefChangeMargin = props.clefChange ? 3.4 : 0;
  const leadingMargin = clefChangeMargin + accidentalMargin + graceMargin;

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
            ? Math.round((stemLine.y2 - 64) / 4) + MIDDLE_LINE_INDEX
            : undefined,
      }) -
        MIDDLE_LINE_INDEX) *
      0.5
    : 0;
  const articulationLeftSpaces = props.articulation
    ? articulationAtStemEnd && articulationCentersOnStem(props.articulation)
      ? (stemUp ? 1.25 : 0) - 0.16
      : articulationLeftSs[props.articulation]
    : 0;

  // Interactivity/accessibility, mirroring Note: spoken aria-label (chord
  // tones bottom-to-top), button semantics + keyboard when clickable
  const interaction = useContext(InteractionContext);
  const measureNumber = useContext(MeasureNumberContext);
  const clickable = Boolean(props.onClick || interaction.onNoteClick);
  const info: NoteInteractionInfo = {
    measureNumber,
    pitches: [...notes]
      .reverse()
      .flatMap((note) => (note.pitch ? [note.pitch] : [])),
    positions: notes.map((note) => note.position),
    noteValue,
    dotted: dotted !== undefined,
    rest: false,
  };
  const ariaLabel = noteAriaLabel({
    pitches: info.pitches,
    noteValue,
    dotted: dotted !== undefined,
    graceCount: props.grace?.length,
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
  }`;

  // Publish curve geometry + slur markers for the CurveOverlay, using the
  // chord's outer noteheads (same anchor rules as Note)
  const impliedStemUp = stemLine
    ? stemUp
    : getChordStem(notes.map((note) => note.position)) === "upStem";
  const slurStartId =
    props.slur?.start === true ? "default" : props.slur?.start || undefined;
  const slurEndId =
    props.slur?.end === true ? "default" : props.slur?.end || undefined;
  const curveAnchors = getCurveAnchors({
    topPosition,
    bottomPosition,
    stemUp: impliedStemUp,
    hasStem: stemLine !== null,
    stemEndVb: stemEndValue,
  });

  return (
    <div
      className={containerClass}
      {...interactionAttributes}
      data-note-event=""
      data-stem-up={impliedStemUp ? "1" : "0"}
      data-has-stem={stemLine !== null ? "1" : "0"}
      data-anchor-above={curveAnchors.anchorAboveSs}
      data-anchor-below={curveAnchors.anchorBelowSs}
      data-obstacle-above={curveAnchors.obstacleAboveSs}
      data-obstacle-below={curveAnchors.obstacleBelowSs}
      data-slur-start={slurStartId}
      data-slur-end={slurEndId}
      data-slur-dir={props.slur?.direction}
      style={
        {
          flexGrow: getNoteFlex(props),
          marginLeft: leadingMargin
            ? `calc(var(--staff-space) * ${leadingMargin})`
            : undefined,
          // widens the slot for long syllables; beam groups still override
          // via CSS so beam geometry stays flex-proportional
          "--note-min-width": props.lyrics?.length
            ? `calc(var(--staff-space) * ${lyricsMinWidthSs(props.lyrics)})`
            : undefined,
        } as CSSProperties
      }
    >
      {ledgerLines.map((ledger) => (
        <div
          key={ledger}
          className={`ledger-line ledger-${ledger}${isWide || anyRightFlip ? " ledger-wide" : ""}`}
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
      {props.grace?.map((graceNote, index) => {
        const gracePosition = resolvePosition(
          applyOttavaShift(graceNote, ottava),
          clef
        );
        const left = -(
          accidentalMargin +
          0.5 +
          (props.grace!.length - index) * 1.7
        );
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
          {note.notehead
            ? altNoteheadGlyphs[note.notehead][
                noteValue === "whole"
                  ? "whole"
                  : noteValue === "half"
                    ? "half"
                    : "black"
              ]
            : noteGlyphs[noteTranslations[noteValue]]["noStem"]}
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
            left: `calc(var(--staff-space) * ${articulationLeftSpaces})`,
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
      {props.text && <div className="note-text">{props.text}</div>}
      {props.lyrics?.map((entry, verse) => {
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
              stroke="currentColor"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
