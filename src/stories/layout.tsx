import { Children, ReactElement, ReactNode, isValidElement } from "react";
import { getNoteFlex } from "../helpers/helpers";
import { NoteProps } from "../helpers/types";
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

// Voice can't be imported here (it imports this module), so voices are
// recognized by the musicRole marker on the component
export const isVoiceElement = (node: ReactNode): boolean =>
  isValidElement(node) &&
  (node.type as { musicRole?: string }).musicRole === "voice";

export const hasVoices = (children: ReactNode): boolean =>
  Children.toArray(children).some(isVoiceElement);

// Duration of one measure event in flex units. Beam groups span the sum of
// their notes.
export const getEventFlex = (node: ReactNode): number => {
  if (!isValidElement(node)) {
    return 0;
  }
  if (node.type === BeamContainer) {
    return Children.toArray(
      (node.props as { children?: ReactNode }).children
    ).reduce((sum: number, child) => sum + getEventFlex(child), 0);
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

  const boundaries = [0];
  let onset = 0;
  childArray.forEach((child) => {
    const flex = getEventFlex(child);
    if (flex > 0) {
      onset += flex;
      boundaries.push(round3(onset));
    }
  });
  return boundaries;
};

export const unionBoundaries = (a: number[], b: number[]): number[] =>
  Array.from(new Set([...a, ...b].map(round3))).sort((x, y) => x - y);

export const gridTemplateFromBoundaries = (boundaries: number[]): string =>
  boundaries
    .slice(1)
    .map((boundary, index) => `${round3(boundary - boundaries[index])}fr`)
    .join(" ");

// Wrap each event in a grid item spanning its onset columns. The wrapper is
// a flex row, so the event's own flex-grow just fills it.
export const placeEventsOnGrid = (
  children: ReactNode,
  boundaries: number[]
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
        style={{ gridColumn: `${start} / ${end}` }}
      >
        {child}
      </div>
    );
  });
};
