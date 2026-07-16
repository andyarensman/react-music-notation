import { Children, ReactElement, ReactNode, isValidElement } from "react";
import { BeamContainer } from "./BeamContainer";
import { getMusicRole, isVoiceElement } from "./layout";
import { lyricsMinWidthSs } from "../helpers/helpers";
import { GraceNote, LyricInput, Pitch, StackedNote } from "../helpers/types";

/*
  System layout: Staff and GrandStaff break their measures into systems
  (lines) themselves instead of relying on CSS flex-wrap, so each system can
  restate the running clef and key signature and (for grand staves) get its
  own brace. Line breaking needs a width per measure BEFORE rendering, so
  widths are estimated from the same quantities the CSS minimums use — no
  DOM measurement of the notes themselves.
*/

interface CountableProps {
  noteValue?: unknown;
  pitch?: Pitch;
  pitches?: StackedNote[];
  lyrics?: LyricInput[];
  grace?: GraceNote[];
  clefChange?: unknown;
  children?: ReactNode;
}

// Estimated minimum width of a measure's note events, in staff-spaces.
// Mirrors the CSS floors: ~2.2 staff-spaces per note plus the margin an
// accidental reserves. Voices overlay, so a voiced measure costs as much as
// its widest voice.
export const estimateNotesWidthSs = (children: ReactNode): number => {
  const childArray = Children.toArray(children);
  const voices = childArray.filter(isVoiceElement) as ReactElement<{
    children?: ReactNode;
  }>[];
  if (voices.length > 0) {
    return Math.max(
      ...voices.map((voice) => estimateNotesWidthSs(voice.props.children))
    );
  }

  let width = 0;
  childArray.forEach((child) => {
    if (!isValidElement<CountableProps>(child)) {
      return;
    }
    const role = getMusicRole(child);
    if (
      child.type === BeamContainer ||
      role === "slur" ||
      role === "hairpin" ||
      role === "tuplet" ||
      role === "ottava"
    ) {
      width += estimateNotesWidthSs(child.props.children);
      return;
    }
    if (child.props.noteValue === undefined) {
      return;
    }
    // base slot (raised by the widest lyric syllable, mirroring the CSS
    // min-width floor)
    width += lyricsMinWidthSs(child.props.lyrics);
    if (child.props.grace?.length) {
      width += child.props.grace.length * 1.7 + 0.8;
    }
    if (child.props.clefChange) {
      width += 3.4;
    }
    if (child.props.pitch?.alter) {
      width += 1.5;
    }
    if (child.props.pitches?.some((note) => note.pitch?.alter)) {
      width += 1.5;
    }
  });
  return width;
};

export interface MeasureMetaEstimate {
  showsClef: boolean;
  fifthsCount: number;
  hasTime: boolean;
  hasStartRepeat: boolean;
}

// Estimated minimum width of one measure, in staff-spaces. Estimating a
// little high is safe (systems break a measure early); estimating low makes
// a system overflow.
export const estimateMeasureWidthSs = (
  children: ReactNode,
  meta: MeasureMetaEstimate
): number => {
  let metaWidth = 1.875; // gap between the meta block and the notes
  if (meta.showsClef) metaWidth += 5;
  if (meta.fifthsCount > 0) metaWidth += meta.fifthsCount + 1.875;
  if (meta.hasTime) metaWidth += 3.5;
  if (meta.hasStartRepeat) metaWidth += 2.5;

  const notesWidth = estimateNotesWidthSs(children) * 1.15 + 2;
  // 31.25 staff-spaces is the CSS min-width floor on measure containers
  return Math.max(31.25, metaWidth + notesWidth);
};

/*
  Greedy line breaking: fill a system while the estimates fit, then start
  the next one. Every item carries two widths because a measure that starts
  a system restates the clef and key signature, which costs extra space.
*/
export interface BreakableItem {
  baseWidthSs: number;
  startWidthSs: number;
}

export const breakIntoSystems = <T extends BreakableItem>(
  items: T[],
  availableSs: number
): T[][] => {
  const systems: T[][] = [];
  let current: T[] = [];
  let used = 0;

  items.forEach((item) => {
    const width = current.length === 0 ? item.startWidthSs : item.baseWidthSs;
    if (current.length > 0 && used + width > availableSs) {
      systems.push(current);
      current = [item];
      used = item.startWidthSs;
      return;
    }
    current.push(item);
    used += width;
  });
  if (current.length > 0) {
    systems.push(current);
  }
  return systems;
};

// How full a system is relative to the available width; the final system
// stays at natural width instead of justifying when it's mostly empty
export const systemFillRatio = <T extends BreakableItem>(
  system: T[],
  availableSs: number
): number => {
  const used = system.reduce(
    (sum, item, index) =>
      sum + (index === 0 ? item.startWidthSs : item.baseWidthSs),
    0
  );
  return availableSs > 0 ? used / availableSs : 1;
};

export const LOOSE_SYSTEM_THRESHOLD = 0.6;
