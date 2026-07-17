import { Children, ReactElement, ReactNode, isValidElement } from "react";
import {
  getChordStem,
  getNoteFlex,
  leadingMarginSs,
  positionIndex,
  resolvePosition,
} from "../helpers/helpers";
import { ClefType, NoteProps, StackedNote } from "../helpers/types";
import { BeamContainer } from "./BeamContainer";
import { ClefContext } from "./ClefContext";

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
  if (
    node.type === BeamContainer ||
    role === "slur" ||
    role === "hairpin" ||
    role === "ottava"
  ) {
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
      if (role === "slur" || role === "hairpin" || role === "ottava") {
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

/* -------------------------- mid-measure clefs -------------------------- */

// The first clefChange in a node's subtree (a change inside a wrapper
// takes effect from that wrapper's start)
export const findClefChange = (node: ReactNode): ClefType | undefined => {
  if (!isValidElement(node)) return undefined;
  const props = node.props as { clefChange?: ClefType; children?: ReactNode };
  if (props.clefChange) return props.clefChange;
  for (const child of Children.toArray(props.children)) {
    const found = findClefChange(child);
    if (found) return found;
  }
  return undefined;
};

// The clef in effect AFTER these children (for running-clef tracking
// across measures)
export const lastClefChange = (children: ReactNode): ClefType | undefined => {
  let last: ClefType | undefined;
  const walk = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      if (!isValidElement(child)) return;
      const props = child.props as {
        clefChange?: ClefType;
        children?: ReactNode;
      };
      if (props.clefChange) last = props.clefChange;
      walk(props.children);
    });
  };
  walk(children);
  return last;
};

// The clef governing each direct child, given the measure's starting clef
export const clefSequence = (
  children: ReactNode,
  baseClef: ClefType
): ClefType[] => {
  let cursor = baseClef;
  return Children.toArray(children).map((child) => {
    const change = findClefChange(child);
    if (change) cursor = change;
    return cursor;
  });
};

/*
  Wrap children whose governing clef differs from the measure's in a
  ClefContext provider — at RENDER time only. Providers add no DOM, so
  flex/grid layout is untouched; the layout walkers all run on the raw
  children before this step.
*/
export const wrapWithClefs = (
  children: ReactNode,
  baseClef: ClefType
): ReactNode[] => {
  const clefs = clefSequence(children, baseClef);
  return Children.toArray(children).map((child, index) =>
    clefs[index] === baseClef ? (
      child
    ) : (
      <ClefContext.Provider key={`clef-${index}`} value={clefs[index]}>
        {child}
      </ClefContext.Provider>
    )
  );
};

export const unionBoundaries = (a: number[], b: number[]): number[] =>
  Array.from(new Set([...a, ...b].map(round3))).sort((x, y) => x - y);

/* ----------------------- onset-margin columns ----------------------- */

/*
  Accidentals, grace notes, and mid-measure clefs give a note a fixed
  leading margin (staff-spaces). On a shared onset grid that margin must
  not come out of the note's own proportional column, or its notehead
  lands right of the other staff's simultaneous notehead (the "margin
  skew"). The grid therefore gets a fixed-width margin track before every
  duration track, sized to the widest margin any staff/voice needs at
  that onset; events whose own margin is narrower are padded up to it
  (placeEventsOnGrid), so simultaneous noteheads align at their duration
  track's left edge.
*/

/*
  The leading margin the FIRST notehead of an event will render with —
  a static mirror of Note/NoteStack/BeamContainer's own margin math
  (helpers.leadingMarginSs). Ottava/cross-staff re-resolution is ignored
  here; it can only alter the chord seconds-flip clearance in rare
  corners. `voiceStem` is the stem a surrounding Voice would force.
*/
export const eventLeadingMargin =
  (clef: ClefType, voiceStem?: "upStem" | "downStem") =>
  (node: ReactNode): number => {
    if (!isValidElement(node)) return 0;
    const role = getMusicRole(node);
    const props = node.props as {
      noteValue?: NoteProps["noteValue"];
      stem?: "upStem" | "downStem" | "noStem";
      pitches?: StackedNote[];
      children?: ReactNode;
    };
    const resolve = (note: StackedNote) => resolvePosition(note, clef);
    if (node.type === BeamContainer) {
      const groupStem = props.stem ?? voiceStem ?? "upStem";
      const first = Children.toArray(props.children).find(
        (child) =>
          isValidElement(child) &&
          (child.props as { noteValue?: unknown }).noteValue !== undefined
      ) as ReactElement | undefined;
      return first
        ? leadingMarginSs(
            first.props as Parameters<typeof leadingMarginSs>[0],
            resolve,
            groupStem === "upStem"
          )
        : 0;
    }
    if (role === "tuplet") {
      const first = Children.toArray(props.children)[0];
      return eventLeadingMargin(clef, voiceStem)(first);
    }
    if (props.noteValue === undefined) return 0;
    // chord stacks flip seconds by stem direction, which widens the margin
    const walkUp =
      props.pitches && props.pitches.length > 0
        ? (props.noteValue === "whole"
            ? "noStem"
            : props.stem ??
              voiceStem ??
              getChordStem(props.pitches.map(resolve))) !== "downStem"
        : true;
    return leadingMarginSs(
      props as Parameters<typeof leadingMarginSs>[0],
      resolve,
      walkUp
    );
  };

/*
  Per-column leading margins for one staff (or one voice): entry i is the
  margin of the event starting at boundaries[i], 0 when nothing with a
  margin starts there. Traversal mirrors getOnsetBoundaries (transparent
  slur/hairpin/ottava wrappers contribute their interior events; tuplets
  are opaque). A measure containing Voice layers unions its voices.
*/
export const getOnsetMargins = (
  children: ReactNode,
  boundaries: number[],
  clef: ClefType,
  voiceStem?: "upStem" | "downStem"
): number[] => {
  const childArray = Children.toArray(children);
  const voices = childArray.filter(isVoiceElement);
  if (voices.length > 0) {
    return voices
      .map((voice) => {
        const voiceProps = (
          voice as ReactElement<{
            stem?: "upStem" | "downStem";
            children?: ReactNode;
          }>
        ).props;
        return getOnsetMargins(
          voiceProps.children,
          boundaries,
          clef,
          voiceProps.stem
        );
      })
      .reduce(unionMargins);
  }

  const margins = new Array<number>(Math.max(boundaries.length - 1, 0)).fill(
    0
  );
  const columnIndex = new Map(
    boundaries.map((boundary, index) => [round3(boundary), index])
  );
  const marginOf = eventLeadingMargin(clef, voiceStem);
  let onset = 0;
  const walk = (nodes: ReactNode) => {
    Children.toArray(nodes).forEach((child) => {
      const role = getMusicRole(child);
      if (role === "slur" || role === "hairpin" || role === "ottava") {
        walk((child as ReactElement<{ children?: ReactNode }>).props.children);
        return;
      }
      const flex = getEventFlex(child);
      if (flex > 0) {
        const index = columnIndex.get(round3(onset));
        if (index !== undefined && index < margins.length) {
          margins[index] = Math.max(margins[index], round3(marginOf(child)));
        }
        onset = round3(onset + flex);
      }
    });
  };
  walk(childArray);
  return margins;
};

// max per column across staves/voices (arrays may differ in length only
// when a staff doesn't share every boundary; missing entries count as 0)
export const unionMargins = (a: number[], b: number[]): number[] =>
  (a.length >= b.length ? a : b).map((_, index) =>
    Math.max(a[index] ?? 0, b[index] ?? 0)
  );

/*
  Column template: every onset interval becomes a [margin][duration] track
  pair. The fixed margin track holds the union leading margin at that
  onset so the fr tracks stay purely rhythmic; intervals without margins
  get a 0px track, keeping column numbering uniform (margin column of
  interval i = 2i+1, duration column = 2i+2).
*/
export const gridTemplateFromBoundaries = (
  boundaries: number[],
  margins?: number[]
): string =>
  boundaries
    .slice(1)
    .map((boundary, index) => {
      const margin = margins?.[index] ?? 0;
      const marginTrack =
        margin > 0 ? `calc(var(--staff-space) * ${round3(margin)})` : "0px";
      return `${marginTrack} ${round3(boundary - boundaries[index])}fr`;
    })
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

// Wrap each event in a grid item spanning its onset columns (each onset
// owns a [margin][duration] track pair — an event's span starts at its
// onset's margin track, which its own leading margin fills; events whose
// margin is narrower than the column's union margin get the difference as
// padding, so simultaneous noteheads align at the duration track edge).
// `collisionShifts` (onset → staff-spaces) nudges single note events
// sideways with a paint transform, so the grid columns — and every other
// voice/staff aligned to them — are untouched.
export const placeEventsOnGrid = (
  children: ReactNode,
  boundaries: number[],
  margins?: number[],
  // computes the event's own rendered leading margin for the padding
  // top-up (eventLeadingMargin(clef, voiceStem))
  marginOf?: (child: ReactNode) => number,
  collisionShifts?: Map<number, number>,
  // render-time decoration (e.g. mid-measure clef providers); applied
  // inside the grid wrapper so flex math still sees the raw child
  decorate?: (child: ReactNode, index: number) => ReactNode
): ReactNode[] => {
  const columnOf = new Map(
    boundaries.map((boundary, index) => [round3(boundary), 2 * index + 1])
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
    const sharedMargin =
      start !== undefined ? margins?.[(start - 1) / 2] ?? 0 : 0;
    onset = round3(onset + flex);
    const rendered = decorate ? decorate(child, index) : child;
    if (start === undefined || end === undefined) {
      // event doesn't land on the shared grid (staves with mismatched
      // totals); let it flow and keep rendering
      return rendered;
    }
    const topUp = round3(
      Math.max(sharedMargin - (marginOf?.(child) ?? 0), 0)
    );
    return (
      <div
        key={index}
        className="grid-event"
        style={{
          gridColumn: `${start} / ${end}`,
          paddingLeft:
            topUp > 0
              ? `calc(var(--staff-space) * ${topUp})`
              : undefined,
          transform: shift
            ? `translateX(calc(var(--staff-space) * ${shift}))`
            : undefined,
        }}
      >
        {rendered}
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
        role === "ottava" ||
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
