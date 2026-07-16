import { Children, ReactElement, ReactNode, isValidElement } from "react";
import { Staff } from "../components/Staff";
import { GrandStaff } from "../components/GrandStaff";
import { GrandMeasure } from "../components/GrandMeasure";
import { Score } from "../components/Score";
import { ScoreMeasure } from "../components/ScoreMeasure";
import { Measure, MeasureProps } from "../components/Measure";
import { BeamContainer } from "../components/BeamContainer";
import { TabNote } from "../components/TabNote";
import { getMusicRole } from "../components/layout";
import { getNoteFlex } from "../helpers/helpers";
import { AccidentalContext, midiOf } from "../helpers/soundingPitch";
import {
  ClefType,
  GraceNote,
  KeyRange,
  NoteProps,
  Pitch,
  StackedNote,
} from "../helpers/types";
import { TempoProps } from "../components/MeasureMeta/Tempo";
import { TabFret } from "../components/TabNote";

/*
  Playback extraction: walk the same element tree you render and produce
  a timed event list. The flex system doubles as the duration model
  (whole = 16 flex = 4 quarters), tempo marks carry real BPM, repeat
  barlines and volta endings encode the play order, and sounding pitch
  comes from Phase 20's AccidentalContext — explicit soundingAlter wins,
  then drawn accidentals (with measure carry), then the key signature.
*/

/** One sounding event (a note, chord, or unpitched hit). */
export interface PlaybackEvent {
  /** Onset in seconds from the start of playback. */
  timeSec: number;
  /** Sounding length in seconds (ties merged). */
  durationSec: number;
  /** MIDI note numbers; empty for unpitched (percussion) events. */
  midi: number[];
  /** 1-based source measure number (repeats revisit the same numbers). */
  measureNumber: number;
  /** Stable per-voice key: "staffIndex:voiceIndex". */
  voiceKey: string;
  /**
   * Source-order indices (per voiceKey, counting every rest/note event)
   * of the notes merged into this event — for mapping back to your own
   * note list when highlighting.
   */
  noteIndices: number[];
  /** True for grace notes (they steal time just before their host). */
  grace: boolean;
}

export interface PlaybackScore {
  /** All events, sorted by onset. */
  events: PlaybackEvent[];
  /** Total length in seconds. */
  durationSec: number;
}

export interface ExtractOptions {
  /** Tempo used until (and unless) a measure carries a tempo mark with bpm. */
  bpm?: number;
  /** Honor repeat barlines and first/second endings. Default true. */
  repeats?: boolean;
}

const GRACE_SEC = 0.07;
// standard guitar tuning, string 1 (high E) to 6, as MIDI numbers
const TAB_TUNING = [64, 59, 55, 50, 45, 40];

interface StaffSource {
  clef?: ClefType;
  children?: ReactNode;
}

interface MeasureSource {
  fifths?: KeyRange;
  tempo?: TempoProps;
  startRepeat: boolean;
  repeatEnd: boolean;
  endingNumbers: number[];
  staves: StaffSource[];
}

const endingNumbersOf = (ending: MeasureProps["ending"]): number[] => {
  if (!ending) return [];
  const text = typeof ending === "string" ? ending : (ending.text ?? "");
  return (text.match(/\d+/g) ?? []).map(Number);
};

const measureSource = (props: MeasureProps): Omit<MeasureSource, "staves"> => ({
  fifths: props.fifths,
  tempo: props.tempo,
  startRepeat: props.startRepeat === true,
  repeatEnd: props.barline === "repeatEnd",
  endingNumbers: endingNumbersOf(props.ending),
});

// Normalize any score root (Staff / GrandStaff / Score, or a fragment of
// measures) into per-measure, per-staff sources
const normalize = (node: ReactNode): MeasureSource[] => {
  const measures: MeasureSource[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === Staff || child.type === GrandStaff || child.type === Score) {
      measures.push(
        ...normalize((child.props as { children?: ReactNode }).children)
      );
      return;
    }
    if (child.type === Measure) {
      const props = child.props as MeasureProps;
      measures.push({
        ...measureSource(props),
        staves: [{ clef: props.clef, children: props.children }],
      });
      return;
    }
    if (child.type === GrandMeasure) {
      const props = child.props as {
        upper: ReactElement<MeasureProps>;
        lower: ReactElement<MeasureProps>;
        startRepeat?: boolean;
        barline?: string;
      };
      const upper = props.upper.props;
      const lower = props.lower.props;
      measures.push({
        fifths: upper.fifths ?? lower.fifths,
        tempo: upper.tempo,
        startRepeat: props.startRepeat === true,
        repeatEnd: props.barline === "repeatEnd",
        endingNumbers: endingNumbersOf(upper.ending),
        staves: [
          { clef: upper.clef, children: upper.children },
          { clef: lower.clef, children: lower.children },
        ],
      });
      return;
    }
    if (child.type === ScoreMeasure) {
      const props = child.props as {
        parts: ReactElement<MeasureProps>[];
        startRepeat?: boolean;
        barline?: string;
      };
      const first = props.parts[0]?.props;
      measures.push({
        fifths: props.parts.find((part) => part.props.fifths !== undefined)
          ?.props.fifths,
        tempo: first?.tempo,
        startRepeat: props.startRepeat === true,
        repeatEnd: props.barline === "repeatEnd",
        endingNumbers: endingNumbersOf(first?.ending),
        staves: props.parts.map((part) => ({
          clef: part.props.clef,
          children: part.props.children,
        })),
      });
      return;
    }
    // unknown wrappers: look inside
    const children = (child.props as { children?: ReactNode }).children;
    if (children) measures.push(...normalize(children));
  });
  return measures;
};

/*
  Play order: expand repeat barlines with first/second endings. On the
  repeat pass, measures whose volta includes "1" (but not "2") are
  skipped. Single-level repeats, taken once — the common case.
*/
const playOrder = (measures: MeasureSource[], repeats: boolean): number[] => {
  if (!repeats) return measures.map((_, index) => index);
  const order: number[] = [];
  let index = 0;
  let anchor = 0;
  let pass = 1;
  let guard = 0;
  while (index < measures.length && guard++ < measures.length * 4) {
    const measure = measures[index];
    if (measure.startRepeat && pass === 1) anchor = index;
    if (
      pass === 2 &&
      measure.endingNumbers.includes(1) &&
      !measure.endingNumbers.includes(2)
    ) {
      index += 1;
      continue;
    }
    order.push(index);
    if (measure.repeatEnd) {
      if (pass === 1) {
        pass = 2;
        index = anchor;
        continue;
      }
      pass = 1;
      anchor = index + 1;
    }
    index += 1;
  }
  return order;
};

interface LeafNote {
  props: NoteProps & { pitches?: StackedNote[]; frets?: TabFret[] };
  isTab: boolean;
  tupletFactor: number;
}

// Flatten one voice's children to leaf events, resolving tuplet scaling
// and walking through timing-transparent wrappers
const leaves = (node: ReactNode, tupletFactor: number): LeafNote[] => {
  const result: LeafNote[] = [];
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const role = getMusicRole(child);
    const props = child.props as LeafNote["props"] & {
      children?: ReactNode;
      ratio?: [number, number];
    };
    if (role === "tuplet") {
      const [actual, normal] = props.ratio ?? [3, 2];
      result.push(...leaves(props.children, tupletFactor * (normal / actual)));
      return;
    }
    if (
      role === "slur" ||
      role === "hairpin" ||
      role === "ottava" ||
      child.type === BeamContainer
    ) {
      result.push(...leaves(props.children, tupletFactor));
      return;
    }
    if (props.noteValue !== undefined) {
      result.push({
        props,
        isTab: child.type === TabNote,
        tupletFactor,
      });
    }
  });
  return result;
};

const soundingMidi = (
  pitch: Pitch | undefined,
  context: AccidentalContext
): number | null => {
  if (!pitch || pitch.step === undefined || pitch.octave === undefined) {
    return null;
  }
  return midiOf(pitch, context.resolve(pitch));
};

/**
 * Extracts a timed playback score from the same element tree you render:
 * a `Staff`, `GrandStaff`, or `Score` (for MusicXML, pass
 * `parseMusicXML(xml).element`). Tempo marks, repeats/voltas, ties,
 * tuplets, grace notes, key signatures and accidental carry, tablature
 * tuning, and unpitched percussion are all honored.
 */
export const extractPlaybackScore = (
  node: ReactNode,
  options: ExtractOptions = {}
): PlaybackScore => {
  const measures = normalize(node);
  const order = playOrder(measures, options.repeats ?? true);

  const events: PlaybackEvent[] = [];
  // running reader state per staff, in play order
  const contexts = new Map<number, AccidentalContext>();
  const clefs = new Map<number, ClefType>();
  const openTies = new Map<string, PlaybackEvent>();
  const noteCounters = new Map<string, number>();

  let fifths: KeyRange = 0;
  let secPerQuarter = 60 / (options.bpm ?? 120);
  let cursorSec = 0;
  let totalSec = 0;

  for (const measureIndex of order) {
    const measure = measures[measureIndex];
    if (measure.fifths !== undefined && measure.fifths !== fifths) {
      fifths = measure.fifths;
      contexts.forEach((context) => context.setKey(fifths));
    }
    contexts.forEach((context) => context.startMeasure());
    if (measure.tempo?.bpm) {
      const unitQuarters =
        (getNoteFlex({
          noteValue: measure.tempo.beatUnit ?? "quarter",
          dotted: measure.tempo.beatUnitDotted ? 1 : undefined,
        }) as number) / 4;
      secPerQuarter = 60 / (measure.tempo.bpm * unitQuarters);
    }

    let measureEndSec = cursorSec;
    measure.staves.forEach((staff, staffIndex) => {
      if (staff.clef) clefs.set(staffIndex, staff.clef);
      const clef = clefs.get(staffIndex) ?? (staffIndex === 1 ? "fClef" : "gClef");
      const unpitchedStaff = clef === "percussion";
      let context = contexts.get(staffIndex);
      if (!context) {
        context = new AccidentalContext(fifths);
        contexts.set(staffIndex, context);
      }

      // voices run in parallel from the measure start
      const children = Children.toArray(staff.children);
      const voiceElements = children.filter(
        (child) => getMusicRole(child) === "voice"
      ) as ReactElement<{ children?: ReactNode }>[];
      const voices: ReactNode[] =
        voiceElements.length > 0 ? voiceElements.map((v) => v.props.children) : [children];

      voices.forEach((voice, voiceIndex) => {
        const voiceKey = `${staffIndex}:${voiceIndex}`;
        let voiceCursor = cursorSec;
        for (const leaf of leaves(voice, 1)) {
          const noteIndex = noteCounters.get(voiceKey) ?? 0;
          noteCounters.set(voiceKey, noteIndex + 1);
          const quarters =
            ((getNoteFlex(leaf.props) as number) / 4) * leaf.tupletFactor;
          const durationSec = quarters * secPerQuarter;

          if (leaf.props.rest) {
            voiceCursor += durationSec;
            continue;
          }

          // grace notes steal time just before the host
          const graces: GraceNote[] = leaf.props.grace ?? [];
          graces.forEach((grace, graceIndex) => {
            const midi = unpitchedStaff
              ? null
              : soundingMidi(grace.pitch, context!);
            events.push({
              timeSec: Math.max(
                0,
                voiceCursor - (graces.length - graceIndex) * GRACE_SEC
              ),
              durationSec: GRACE_SEC,
              midi: midi === null ? [] : [midi],
              measureNumber: measureIndex + 1,
              voiceKey,
              noteIndices: [noteIndex],
              grace: true,
            });
          });

          let midi: number[];
          if (leaf.isTab) {
            midi = (leaf.props.frets ?? []).map(
              ({ string, fret }) => TAB_TUNING[string - 1] + fret
            );
          } else if (unpitchedStaff) {
            midi = [];
          } else if (leaf.props.pitches) {
            midi = leaf.props.pitches
              .map((stacked) => soundingMidi(stacked.pitch, context!))
              .filter((value): value is number => value !== null);
          } else {
            const single = soundingMidi(leaf.props.pitch, context!);
            midi = single === null ? [] : [single];
          }

          const event: PlaybackEvent = {
            timeSec: voiceCursor,
            durationSec,
            midi: midi.sort((a, b) => a - b),
            measureNumber: measureIndex + 1,
            voiceKey,
            noteIndices: [noteIndex],
            grace: false,
          };

          // merge tied continuations into the note that started the tie
          const open = openTies.get(voiceKey);
          if (
            open &&
            open.midi.length === event.midi.length &&
            open.midi.every((value, i) => value === event.midi[i])
          ) {
            open.durationSec += event.durationSec;
            open.noteIndices.push(noteIndex);
            if (leaf.props.tie !== "start") openTies.delete(voiceKey);
          } else {
            openTies.delete(voiceKey);
            events.push(event);
            if (leaf.props.tie === "start") openTies.set(voiceKey, event);
          }

          voiceCursor += durationSec;
        }
        measureEndSec = Math.max(measureEndSec, voiceCursor);
      });
    });

    cursorSec = measureEndSec;
    totalSec = Math.max(totalSec, measureEndSec);
  }

  events.sort((a, b) => a.timeSec - b.timeSec);
  const lastEnd = events.reduce(
    (max, event) => Math.max(max, event.timeSec + event.durationSec),
    totalSec
  );
  return { events, durationSec: lastEnd };
};
