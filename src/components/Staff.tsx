import {
  Children,
  ReactElement,
  ReactNode,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { ClefType, KeyRange } from "../helpers/types";
import { MeasureProps } from "./Measure";
import {
  LOOSE_SYSTEM_THRESHOLD,
  breakIntoSystems,
  estimateMeasureWidthSs,
  systemFillRatio,
} from "./systemLayout";
import { CurveOverlay } from "./CurveOverlay";
import "./Staff.css";

interface StaffProps {
  children?: ReactNode;
}

interface AnnotatedMeasure {
  element: ReactElement<MeasureProps>;
  inheritedClef: ClefType;
  inheritedFifths: KeyRange | undefined;
  baseWidthSs: number;
  startWidthSs: number;
}

/*
  Staff breaks its measures into systems (lines) itself, using estimated
  measure widths against the observed container width, so each system's
  first measure can restate the running clef and key signature. Intermediate
  systems justify to full width; a mostly-empty final system stays at
  natural width instead of stretching its measures.
*/
/**
 * Wraps a run of `Measure` children into a single-staff system layout:
 * breaks measures into systems (lines) from the measured container width,
 * tracks the running clef and key signature across measures that don't
 * restate them, and restates both on the first measure of every system
 * after the first. A mostly-empty final system keeps its natural width
 * instead of justifying.
 *
 * @example
 * ```tsx
 * <Staff>
 *   <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>...</Measure>
 *   <Measure>...</Measure>
 * </Staff>
 * ```
 */
export const Staff = ({ children }: StaffProps) => {
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

  // Track the running clef and key while annotating each measure
  let runningClef: ClefType = "gClef";
  let runningFifths: KeyRange | undefined;
  const annotated: AnnotatedMeasure[] = [];
  const passthrough: ReactNode[] = [];

  Children.forEach(children, (child) => {
    if (!isValidElement<MeasureProps>(child)) {
      passthrough.push(child);
      return;
    }
    const inheritedClef = runningClef;
    const inheritedFifths = runningFifths;
    if (child.props.clef) runningClef = child.props.clef;
    if (child.props.fifths !== undefined) runningFifths = child.props.fifths;

    const activeFifths = child.props.fifths ?? inheritedFifths;
    annotated.push({
      element: child,
      inheritedClef,
      inheritedFifths,
      baseWidthSs: estimateMeasureWidthSs(child.props.children, {
        showsClef: child.props.clef !== undefined,
        fifthsCount: Math.abs(child.props.fifths ?? 0),
        hasTime: child.props.time !== undefined,
        hasStartRepeat: child.props.startRepeat === true,
      }),
      startWidthSs: estimateMeasureWidthSs(child.props.children, {
        showsClef: true,
        fifthsCount: Math.abs(activeFifths ?? 0),
        hasTime: child.props.time !== undefined,
        hasStartRepeat: child.props.startRepeat === true,
      }),
    });
  });

  // Before the first width measurement, render everything as one system
  const systems =
    widthSs > 0 ? breakIntoSystems(annotated, widthSs) : [annotated];

  return (
    <div className="staff-container" ref={containerRef}>
      {systems.map((system, systemIndex) => {
        const loose =
          systemIndex === systems.length - 1 &&
          systems.length > 1 &&
          widthSs > 0 &&
          systemFillRatio(system, widthSs) < LOOSE_SYSTEM_THRESHOLD;
        return (
          <div key={systemIndex} className="staff-system">
            {system.map((measure, measureIndex) => {
              const isSystemStart = measureIndex === 0;
              const widthSsForMeasure = isSystemStart
                ? measure.startWidthSs
                : measure.baseWidthSs;
              return cloneElement(measure.element, {
                key: measureIndex,
                inheritedClef: measure.inheritedClef,
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
};
