import {
  CSSProperties,
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { mergeRefs } from "./mergeRefs";
import "./Score.css";
import "../global.css";
import { CurveOverlay } from "./CurveOverlay";
import {
  InteractionContext,
  NoteInteractionHandlers,
} from "./InteractionContext";
import { lastClefChange } from "./layout";
import { ClefType, KeyRange } from "../helpers/types";
import { PART_STRIDE_SS, ScoreMeasureProps } from "./ScoreMeasure";
import {
  LOOSE_SYSTEM_THRESHOLD,
  breakIntoSystems,
  estimateMeasureWidthSs,
  systemFillRatio,
} from "./systemLayout";

interface ScoreProps extends NoteInteractionHandlers {
  /**
   * Instrument names shown in a left gutter on the first system, one per
   * part (top staff first). The gutter's width persists on later systems so
   * measures stay aligned, but the names render only once.
   */
  partNames?: string[];
  /** The score's measures: `ScoreMeasure` elements. */
  children?: ReactNode;
  /** Extra class name(s) appended to the score container. */
  className?: string;
  /** Extra styles applied to the score container. */
  style?: CSSProperties;
}

interface AnnotatedScoreMeasure {
  element: ReactElement<ScoreMeasureProps>;
  number: number;
  inheritedClefs: ClefType[];
  inheritedFifths: (KeyRange | undefined)[];
  baseWidthSs: number;
  startWidthSs: number;
}

/**
 * A multi-instrument score: any number of parts stacked per measure (see
 * `ScoreMeasure`), broken into systems from the measured container width.
 * Every system starts with a systemic barline connecting all staves and
 * restates each part's running clef and key signature.
 *
 * @example
 * ```tsx
 * <Score partNames={["Violin", "Cello"]}>
 *   <ScoreMeasure parts={[trebleMeasure, bassMeasure]} />
 * </Score>
 * ```
 */
export const Score = forwardRef<HTMLDivElement, ScoreProps>(function Score(
  { partNames, children, onNoteClick, onNoteHover, className, style },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widthSs, setWidthSs] = useState(0);
  const [staffSpacePx, setStaffSpacePx] = useState(8);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () => {
      const spacePx =
        parseFloat(
          getComputedStyle(element).getPropertyValue("--staff-space")
        ) || 8;
      setStaffSpacePx(spacePx);
      setWidthSs(element.clientWidth / spacePx);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Running clef/key per part while annotating each score measure
  const runningClefs: ClefType[] = [];
  const runningFifths: (KeyRange | undefined)[] = [];
  const annotated: AnnotatedScoreMeasure[] = [];
  const passthrough: ReactNode[] = [];
  let partCount = 0;

  Children.forEach(children, (child) => {
    if (!isValidElement<ScoreMeasureProps>(child)) {
      passthrough.push(child);
      return;
    }
    const parts = child.props.parts ?? [];
    partCount = Math.max(partCount, parts.length);
    while (runningClefs.length < parts.length) runningClefs.push("gClef");
    while (runningFifths.length < parts.length) runningFifths.push(undefined);

    const inheritedClefs = [...runningClefs];
    const inheritedFifths = [...runningFifths];
    parts.forEach((part, index) => {
      if (part.props.clef) runningClefs[index] = part.props.clef;
      runningClefs[index] =
        lastClefChange(part.props.children) ?? runningClefs[index];
      if (part.props.fifths !== undefined) {
        runningFifths[index] = part.props.fifths;
      }
    });

    const widthFor = (restate: boolean) =>
      Math.max(
        ...parts.map((part, index) =>
          estimateMeasureWidthSs(part.props.children, {
            showsClef: part.props.clef !== undefined || restate,
            fifthsCount: Math.abs(
              (restate
                ? part.props.fifths ?? inheritedFifths[index]
                : part.props.fifths) ?? 0
            ),
            hasTime: part.props.time !== undefined,
            hasStartRepeat: child.props.startRepeat === true,
          })
        )
      );

    annotated.push({
      element: child,
      number: child.props.measureNumber ?? annotated.length + 1,
      inheritedClefs,
      inheritedFifths,
      baseWidthSs: widthFor(false),
      startWidthSs: widthFor(true),
    });
  });

  // Reserve a left gutter for part names (rough serif width estimate); it
  // stays on every system so measures align, but names render only once
  const gutterSs = partNames?.length
    ? Math.max(...partNames.map((name) => name.length)) * 0.95 + 2
    : 0;

  const availableSs = widthSs > 0 ? widthSs - gutterSs - 1 : 0;
  const systems =
    availableSs > 0 ? breakIntoSystems(annotated, availableSs) : [annotated];

  const systemHeight = `calc(var(--staff-space) * ${
    16.125 + (partCount - 1) * PART_STRIDE_SS
  })`;
  const barlineHeight = `calc(var(--staff-space) * ${
    4 + (partCount - 1) * PART_STRIDE_SS
  } + var(--staff-line-thickness))`;

  const content = (
    <div
      className={"score-container" + (className ? ` ${className}` : "")}
      role="group"
      aria-label={
        partNames?.length ? `Score: ${partNames.join(", ")}` : "Score"
      }
      ref={mergeRefs(containerRef, ref)}
      style={style}
    >
      {systems.map((system, systemIndex) => {
        const loose =
          systemIndex === systems.length - 1 &&
          systems.length > 1 &&
          availableSs > 0 &&
          systemFillRatio(system, availableSs) < LOOSE_SYSTEM_THRESHOLD;
        return (
          <div key={systemIndex} className="score-system">
            {gutterSs > 0 && (
              <div
                className="score-name-gutter"
                style={{
                  width: `calc(var(--staff-space) * ${gutterSs})`,
                  height: systemHeight,
                }}
              >
                {systemIndex === 0 &&
                  partNames!.map((name, partIndex) => (
                    <div
                      key={partIndex}
                      className="score-part-name"
                      style={{
                        top: `calc(var(--staff-space) * ${
                          partIndex * PART_STRIDE_SS + 7.1
                        })`,
                      }}
                    >
                      {name}
                    </div>
                  ))}
              </div>
            )}
            <div
              className="score-system-barline"
              style={{ height: barlineHeight }}
            ></div>
            {system.map((measure, measureIndex) => {
              const isSystemStart = measureIndex === 0;
              const widthSsForMeasure = isSystemStart
                ? measure.startWidthSs
                : measure.baseWidthSs;
              return cloneElement(measure.element, {
                key: measureIndex,
                measureNumber: measure.number,
                inheritedClefs: measure.inheritedClefs,
                inheritedFifths: measure.inheritedFifths,
                systemStart: isSystemStart && systemIndex > 0,
                style: loose
                  ? {
                      flexGrow: 0,
                      flexBasis: `${widthSsForMeasure * staffSpacePx}px`,
                    }
                  : undefined,
              });
            })}
          </div>
        );
      })}
      {passthrough}
      <CurveOverlay />
    </div>
  );

  return onNoteClick || onNoteHover ? (
    <InteractionContext.Provider value={{ onNoteClick, onNoteHover }}>
      {content}
    </InteractionContext.Provider>
  ) : (
    content
  );
});
