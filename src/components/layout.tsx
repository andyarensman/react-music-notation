import { Children, ReactElement, ReactNode, isValidElement } from "react";
import {
  getNoteFlex,
  positionIndex,
  resolvePosition,
} from "../helpers/helpers";
import { ClefType, NoteProps, StackedNote } from "../helpers/types";
import { BeamContainer } from "./BeamContainer";

/*
  Onset-grid layout: when two staves share a measure (GrandStaff), notes that
  sound together must sit at the same x position even though the staves have
  different rhythms. Each measure's events map to flex-unit onsets; the union
  of both staves' onsets becomes a CSS grid whose fr column widths are the
  onset deltas. fr columns stay proportional exactly like flex-grow with
  flex-basis 0, so all existing beam geometry keeps working inside a column
  span.
*/

const round3 = (value: number) => Math.round(value * 1000) / 1000;

/*
  Voice/Slur/Tuplet/Hairpin can't be imported here (they import this module),
  so they're recognized by the musicRole marker each component carries.
*/
export const getMusicRole = (node: ReactNode): string | undefined =>
  isValidElement(node)
    ? (node.type as { musicRole?: string }).musicRole
    : undefined;

export const isVoiceElement = (node: ReactNode): boolean =>
  getMusicRole(node) === "voice";

export const hasVoices = (children: ReactNode): boolean =>
  Children.toArray(children).some(isVoiceElement);

// Duration of one measure event in flex units. Beam groups and slur/hairpin
// wrappers span the sum of their notes; tuplets scale the sum by their
// ratio (three-in-the-time-of-two = 2/3 of the natural duration).
export const getEventFlex = (node: ReactNode): number => {
  if (!isValidElement(node)) {
    return 0;
  }
  const role = getMusicRole(node);
  if (node.type === BeamContainer || role === "slur" || role === "hairpin") {
    return Children.toArray(
      (node.props as { children?: ReactNode }).children
    ).reduce((sum: number, child) => sum + getEventFlex(child), 0);
  }
  if (role === "tuplet") {
    const props = node.props as {
      ratio: [number, number];
      children?: ReactNode;
    };
    const [actual, normal] = props.ratio;
    const inner = Children.toArray(props.children).reduce(
      (sum: number, child) => sum + getEventFlex(child),
      0
    );
    return round3((inner * normal) / actual);
  }
  const props = node.props as {
    noteValue?: NoteProps["noteValue"];
    dotted?: 1;
  };
  if (props.noteValue !== undefined) {
    return getNoteFlex({ noteValue: props.noteValue, dotted: props.dotted });
  }
  return 0;
};

// Cumulative onsets of a measure's events, starting at 0 and ending at the
// measure's total duration. Voices run in parallel, so a measure containing
// Voice layers gets the union of each voice's boundaries.
export const getOnsetBoundaries = (children: ReactNode): number[] => {
  const childArray = Children.toArray(children);
  const voices = childArray.filter(isVoiceElement);
  if (voices.length > 0) {
    return voices
      .map((voice) =>
        getOnsetBoundaries(
          (voice as ReactElement<{ children?: ReactNode }>).props.children
        )
      )
      .reduce(unionBoundaries);
  }

  // Slur/hairpin wrappers are transparent for timing: their internal notes
  // contribute onsets so the other staff of a grand measure still aligns.
  // Tuplets stay opaque (their fractional internals shouldn't create shared
  // columns).
  const boundaries = [0];
  let onset = 0;
  const addEvents = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      const role = getMusicRole(child);
      if (role === "slur" || role === "hairpin") {
        addEvents((child as ReactElement<{ children?: ReactNode }>).props.children);
        return;
      }
      const flex = getEventFlex(child);
      if (flex > 0) {
        onset = round3(onset + flex);
        boundaries.push(onset);
      }
    });
  };
  addEvents(childArray);
  return boundaries;
};

export const unionBoundaries = (a: number[], b: number[]): number[] =>
  Array.from(new Set([...a, ...b].map(round3))).sort((x, y) => x - y);

export const gridTemplateFromBoundaries = (boundaries: number[]): string =>
  boundaries
    .slice(1)
    .map((boundary, index) => `${round3(boundary - boundaries[index])}fr`)
    .join(" ");

// Flex of the last leaf note inside a group (slurs/hairpins end their spans
// at the final notehead, not the group's right edge)
export const getLastLeafFlex = (nodes: ReactNode): number => {
  const childArray = Children.toArray(nodes);
  for (let index = childArray.length - 1; index >= 0; index--) {
    const child = childArray[index];
    if (!isValidElement<{ noteValue?: unknown; children?: ReactNode }>(child)) {
      continue;
    }
    if (child.props.noteValue !== undefined) {
      return getEventFlex(child);
    }
    if (child.props.children) {
      const inner = getLastLeafFlex(child.props.children);
      if (inner > 0) return inner;
    }
  }
  return 0;
};

// Wrap each event in a grid item spanning its onset columns. The wrapper is
// a flex row, so the event's own flex-grow just fills it. `collisionShifts`
// (onset → staff-spaces) nudges single note events sideways with a paint
// transform, so the grid columns — and every other voice/staff aligned to
// them — are untouched.
export const placeEventsOnGrid = (
  children: ReactNode,
  boundaries: number[],
  collisionShifts?: Map<number, number>
): ReactNode[] => {
  const columnOf = new Map(
    boundaries.map((boundary, index) => [round3(boundary), index + 1])
  );
  let onset = 0;
  return Children.toArray(children).map((child, index) => {
    const flex = getEventFlex(child);
    if (flex === 0) {
      return child;
    }
    const isPlainNote =
      isValidElement(child) &&
      (child.props as { noteValue?: unknown }).noteValue !== undefined;
    const shift = isPlainNote
      ? collisionShifts?.get(round3(onset))
      : undefined;
    const start = columnOf.get(round3(onset));
    const end = columnOf.get(round3(onset + flex));
    onset = round3(onset + flex);
    if (start === undefined || end === undefined) {
      // event doesn't land on the shared grid (staves with mismatched
      // totals); let it flow and keep rendering
      return child;
    }
    return (
      <div
        key={index}
        className="grid-event"
        style={{
          gridColumn: `${start} / ${end}`,
          transform: shift
            ? `translateX(calc(var(--staff-space) * ${shift}))`
            : undefined,
        }}
      >
        {child}
      </div>
    );
  });
};

/* ------------------------- two-voice collisions ------------------------- */

interface TimedNote {
  onset: number;
  indices: number[];
  value: NoteProps["noteValue"];
  dotted: boolean;
  chord: boolean;
}

// The sounding notes of one voice with their onsets, walking through
// timing-transparent wrappers and beam groups (tuplets stay opaque, like
// the onset grid itself)
const collectTimedNotes = (children: ReactNode, clef: ClefType): TimedNote[] => {
  const notes: TimedNote[] = [];
  let onset = 0;
  const walk = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      if (!isValidElement(child)) return;
      const role = getMusicRole(child);
      const props = child.props as {
        noteValue?: NoteProps["noteValue"];
        dotted?: 1;
        rest?: boolean;
        pitches?: StackedNote[];
        position?: NoteProps["position"];
        pitch?: StackedNote["pitch"];
        children?: ReactNode;
      };
      if (
        role === "slur" ||
        role === "hairpin" ||
        child.type === BeamContainer
      ) {
        walk(props.children);
        return;
      }
      if (role === "tuplet") {
        onset = round3(onset + getEventFlex(child));
        return;
      }
      if (props.noteValue === undefined) return;
      if (!props.rest) {
        const indices = props.pitches
          ? props.pitches.map((note) =>
              positionIndex(resolvePosition(note, clef))
            )
          : [positionIndex(resolvePosition(props, clef))];
        notes.push({
          onset,
          indices,
          value: props.noteValue,
          dotted: props.dotted !== undefined,
          chord: props.pitches !== undefined,
        });
      }
      onset = round3(onset + getEventFlex(child));
    });
  };
  walk(children);
  return notes;
};

/*
  Two voices sharing a staff collide when simultaneous notes sit a second
  apart or in unison (Gould, "Two voices on one stave"): the down-stem
  voice's note moves right of the up-stem voice's note. A unison of two
  single notes with the same value and dotting needs no shift — the
  superimposed noteheads with their up and down stems read as the shared
  notehead engravers use. Returns onset → shift (in staff-spaces) for the
  down-stem voice.
*/
export const getVoiceCollisionShifts = (
  children: ReactNode,
  clef: ClefType
): Map<number, number> => {
  const voices = Children.toArray(children).filter(
    isVoiceElement
  ) as ReactElement<{ stem?: string; children?: ReactNode }>[];
  const up = voices.find((voice) => voice.props.stem === "upStem");
  const down = voices.find((voice) => voice.props.stem === "downStem");
  const shifts = new Map<number, number>();
  if (!up || !down) return shifts;
  const upNotes = collectTimedNotes(up.props.children, clef);
  const downNotes = collectTimedNotes(down.props.children, clef);
  for (const downNote of downNotes) {
    const upNote = upNotes.find((note) => note.onset === downNote.onset);
    if (!upNote) continue;
    const gap = Math.min(
      ...upNote.indices.flatMap((iu) =>
        downNote.indices.map((id) => Math.abs(iu - id))
      )
    );
    if (gap > 1) continue;
    const mergedUnison =
      gap === 0 &&
      !upNote.chord &&
      !downNote.chord &&
      upNote.value === downNote.value &&
      upNote.dotted === downNote.dotted &&
      upNote.value !== "whole";
    if (mergedUnison) continue;
    // clear the up-voice notehead (wholes are wider), and its dot if any
    const shift = upNote.value === "whole" ? 1.75 : upNote.dotted ? 2.0 : 1.2;
    shifts.set(downNote.onset, shift);
  }
  return shifts;
};
