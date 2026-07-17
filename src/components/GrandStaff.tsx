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
import "./GrandStaff.css";
import "../global.css";
import { CurveOverlay } from "./CurveOverlay";
import {
  InteractionContext,
  NoteInteractionHandlers,
} from "./InteractionContext";
import { lastClefChange } from "./layout";
import { braceGlyph } from "../helpers/glyphs";
import { ClefType, KeyRange } from "../helpers/types";
import { GrandMeasureProps } from "./GrandMeasure";
import {
  LOOSE_SYSTEM_THRESHOLD,
  breakIntoSystems,
  estimateMeasureWidthSs,
  systemFillRatio,
} from "./systemLayout";

interface GrandStaffProps extends NoteInteractionHandlers {
  children?: ReactNode;
  /** Extra class name(s) appended to the grand-staff container. */
  className?: string;
  /** Extra styles applied to the grand-staff container. */
  style?: CSSProperties;
}

interface AnnotatedGrandMeasure {
  element: ReactElement<GrandMeasureProps>;
  number: number;
  inheritedUpperClef: ClefType;
  inheritedLowerClef: ClefType;
  inheritedUpperFifths: KeyRange | undefined;
  inheritedLowerFifths: KeyRange | undefined;
  baseWidthSs: number;
  startWidthSs: number;
}

const BRACE_WIDTH_SS = 2;

/*
  A piano-style pair of staves. Like Staff, GrandStaff breaks its measures
  into systems itself: every system gets a brace and restates the running
  clef and key signature on both staves.
*/
/**
 * A piano-style pair of staves. Like `Staff`, `GrandStaff` breaks its
 * `GrandMeasure` children into systems from the measured container width;
 * every system gets its own brace and restates the running clef and key
 * signature on both staves.
 *
 * @example
 * ```tsx
 * <GrandStaff>
 *   <GrandMeasure
 *     upper={<Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>...</Measure>}
 *     lower={<Measure clef="fClef" time={{ beat: 4, beatType: 4 }}>...</Measure>}
 *   />
 * </GrandStaff>
 * ```
 */
export const GrandStaff = forwardRef<HTMLDivElement, GrandStaffProps>(
  function GrandStaff(
    { children, onNoteClick, onNoteHover, className, style },
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

  let upperClef: ClefType = "gClef";
  let lowerClef: ClefType = "fClef";
  let upperFifths: KeyRange | undefined;
  let lowerFifths: KeyRange | undefined;
  const annotated: AnnotatedGrandMeasure[] = [];
  const passthrough: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<GrandMeasureProps>(child)) {
      passthrough.push(child);
      return;
    }
    const { upper, lower } = child.props;
    const inherited = {
      inheritedUpperClef: upperClef,
      inheritedLowerClef: lowerClef,
      inheritedUpperFifths: upperFifths,
      inheritedLowerFifths: lowerFifths,
    };
    if (upper?.props.clef) upperClef = upper.props.clef;
    if (lower?.props.clef) lowerClef = lower.props.clef;
    upperClef = lastClefChange(upper?.props.children) ?? upperClef;
    lowerClef = lastClefChange(lower?.props.children) ?? lowerClef;
    if (upper?.props.fifths !== undefined) upperFifths = upper.props.fifths;
    if (lower?.props.fifths !== undefined) lowerFifths = lower.props.fifths;

    const staffWidth = (
      measureElement: ReactElement<{ children?: ReactNode }> | undefined,
      declaredClef: boolean,
      fifthsCount: number,
      hasTime: boolean,
      restate: boolean
    ) =>
      measureElement
        ? estimateMeasureWidthSs(measureElement.props.children, {
            showsClef: declaredClef || restate,
            fifthsCount,
            hasTime,
            hasStartRepeat: child.props.startRepeat === true,
          })
        : 0;

    const base = Math.max(
      staffWidth(
        upper,
        upper?.props.clef !== undefined,
        Math.abs(upper?.props.fifths ?? 0),
        upper?.props.time !== undefined,
        false
      ),
      staffWidth(
        lower,
        lower?.props.clef !== undefined,
        Math.abs(lower?.props.fifths ?? 0),
        lower?.props.time !== undefined,
        false
      )
    );
    const start = Math.max(
      staffWidth(
        upper,
        true,
        Math.abs(
          upper?.props.fifths ?? inherited.inheritedUpperFifths ?? 0
        ),
        upper?.props.time !== undefined,
        true
      ),
      staffWidth(
        lower,
        true,
        Math.abs(
          lower?.props.fifths ?? inherited.inheritedLowerFifths ?? 0
        ),
        lower?.props.time !== undefined,
        true
      )
    );

    annotated.push({
      element: child,
      number: child.props.measureNumber ?? annotated.length + 1,
      ...inherited,
      baseWidthSs: base,
      startWidthSs: start,
    });
  });

  const availableSs = widthSs > 0 ? widthSs - BRACE_WIDTH_SS : 0;
  const systems =
    availableSs > 0 ? breakIntoSystems(annotated, availableSs) : [annotated];

  const content = (
    <div
      className={"grand-staff-container" + (className ? ` ${className}` : "")}
      role="group"
      aria-label="Grand staff"
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
          <div key={systemIndex} className="grand-system">
            <div className="grand-brace">
              <span className="leland grand-brace-glyph">{braceGlyph}</span>
            </div>
            {system.map((measure, measureIndex) => {
              const isSystemStart = measureIndex === 0;
              const widthSsForMeasure = isSystemStart
                ? measure.startWidthSs
                : measure.baseWidthSs;
              return cloneElement(measure.element, {
                key: measureIndex,
                measureNumber: measure.number,
                inheritedUpperClef: measure.inheritedUpperClef,
                inheritedLowerClef: measure.inheritedLowerClef,
                inheritedUpperFifths: measure.inheritedUpperFifths,
                inheritedLowerFifths: measure.inheritedLowerFifths,
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
