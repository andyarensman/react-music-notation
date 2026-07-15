import { useEffect, useRef } from "react";
import "./CurveOverlay.css";

/*
  Cross-measure and cross-system slurs and ties.

  A curve whose endpoints live in different measures has no flex/grid
  container that can host it: every in-measure wrapper stops at the
  barline, and after system breaking the endpoints may not even share a
  row. So Staff/GrandStaff/Score mount this overlay, notes publish their
  curve geometry as data attributes (see getCurveAnchors in helpers.ts),
  and after every render the overlay measures the DOM, pairs the markers,
  and paints SVG paths in pixel space above the staves.

  Curves whose endpoints land on different systems split at the break:
  an outgoing half-curve runs to the system's right edge and an incoming
  half-curve leads into the destination note (Gould, "Ties/slurs at a
  system break"). Slurs spanning three or more systems draw a full-width
  segment across each middle system.

  The paint is stateless and repainted from scratch each pass — a handful
  of paths — which keeps it correct under resizes, system re-breaking, and
  prop changes without bookkeeping. Pixel positions come from
  getBoundingClientRect, so this never influences layout (the svg is
  position:absolute and pointer-events:none).
*/

// The staff top line sits half the 12.125-staff-space staff box below the
// note container's top (see the .tie-container top calc in Note.css)
const STAFF_TOP_OFFSET_SS = 12.125 / 2;
const SVG_NS = "http://www.w3.org/2000/svg";

interface NoteEventInfo {
  el: HTMLElement;
  rect: DOMRect;
  /** Index of the system row this note landed on, in document order. */
  row: number;
  /** Which staff of a grand-staff/score row the note belongs to. */
  track: string;
  /** Voice-layer index within the measure, or -1 outside voices. */
  voice: number;
  stemUp: boolean;
  hasStem: boolean;
  anchorAbove: number;
  anchorBelow: number;
  obstacleAbove: number;
  obstacleBelow: number;
}

const sameLine = (a: NoteEventInfo, b: NoteEventInfo) =>
  a.row === b.row && a.track === b.track;

const collectEvents = (container: HTMLElement): NoteEventInfo[] => {
  const rows = Array.from(
    container.querySelectorAll(".staff-system, .grand-system, .score-system")
  );
  return Array.from(
    container.querySelectorAll<HTMLElement>("[data-note-event]")
  ).map((el) => {
    const measure = el.closest(".measure-container");
    let voice = -1;
    const layer = el.closest(".voice-layer");
    if (layer && measure) {
      voice = Array.from(measure.querySelectorAll(".voice-layer")).indexOf(
        layer
      );
    }
    const rowEl = el.closest(".staff-system, .grand-system, .score-system");
    return {
      el,
      rect: el.getBoundingClientRect(),
      row: rowEl ? rows.indexOf(rowEl) : 0,
      track: (measure as HTMLElement | null)?.dataset.staffTrack ?? "0",
      voice,
      stemUp: el.dataset.stemUp === "1",
      hasStem: el.dataset.hasStem === "1",
      anchorAbove: parseFloat(el.dataset.anchorAbove ?? "0"),
      anchorBelow: parseFloat(el.dataset.anchorBelow ?? "0"),
      obstacleAbove: parseFloat(el.dataset.obstacleAbove ?? "0"),
      obstacleBelow: parseFloat(el.dataset.obstacleBelow ?? "0"),
    };
  });
};

export const CurveOverlay = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const container = svg?.parentElement;
    if (!svg || !container) return;
    paint(svg, container);
    // Container resizes that don't re-render the parent (height changes
    // from wrapping, zoom) still need a repaint
    const observer = new ResizeObserver(() => paint(svg, container));
    observer.observe(container);
    return () => observer.disconnect();
  });

  return <svg ref={svgRef} className="curve-overlay" aria-hidden="true" />;
};

function paint(svg: SVGSVGElement, container: HTMLElement) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const ss =
    parseFloat(
      getComputedStyle(container).getPropertyValue("--staff-space")
    ) || 8;
  const cRect = container.getBoundingClientRect();
  svg.setAttribute("width", String(container.clientWidth));
  svg.setAttribute("height", String(container.clientHeight));

  const events = collectEvents(container);
  const rowEls = Array.from(
    container.querySelectorAll(".staff-system, .grand-system, .score-system")
  );

  const x = (px: number) => px - cRect.left;
  // y of the staff top line for the staff this note sits on, then offset
  // by a staff-space value below it
  const yAt = (ev: NoteEventInfo, ssVal: number) =>
    ev.rect.top - cRect.top + (STAFF_TOP_OFFSET_SS + ssVal) * ss;
  const noteLeft = (ev: NoteEventInfo) => x(ev.rect.left);
  // Left edge of a note including its accidental/grace margin, so incoming
  // curves stop before the accidental instead of crossing it
  const inkLeft = (ev: NoteEventInfo) =>
    noteLeft(ev) - (parseFloat(getComputedStyle(ev.el).marginLeft) || 0);
  const rowRight = (ev: NoteEventInfo) => {
    const rowEl = rowEls[ev.row];
    return rowEl ? x(rowEl.getBoundingClientRect().right) : cRect.width;
  };
  const notesRegionLeft = (ev: NoteEventInfo) => {
    const region = ev.el
      .closest(".measure-container")
      ?.querySelector(".notes-container");
    return region ? x(region.getBoundingClientRect().left) : noteLeft(ev);
  };
  const addPath = (d: string) => {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
  };

  paintTies(events, { ss, yAt, noteLeft, inkLeft, rowRight, notesRegionLeft, addPath });
  paintSlurs(events, { ss, yAt, noteLeft, inkLeft, rowRight, notesRegionLeft, addPath });
}

interface PaintContext {
  ss: number;
  yAt: (ev: NoteEventInfo, ssVal: number) => number;
  noteLeft: (ev: NoteEventInfo) => number;
  inkLeft: (ev: NoteEventInfo) => number;
  rowRight: (ev: NoteEventInfo) => number;
  notesRegionLeft: (ev: NoteEventInfo) => number;
  addPath: (d: string) => void;
}

/* ---------------------------------- ties ---------------------------------- */

/*
  The tie lens shape, in the same proportions as Note's in-measure tie
  (a 1.25-staff-space box: endpoints 1ss below its top for an "above" tie,
  apex 0.25ss above it). yTop is the box top in px.
*/
const tiePath = (
  x1: number,
  x2: number,
  yTop: number,
  ss: number,
  above: boolean
) => {
  const xm = (x1 + x2) / 2;
  if (above) {
    const ye = yTop + 1.0 * ss;
    return `M${x1},${ye} Q${xm},${yTop - 0.25 * ss} ${x2},${ye} Q${xm},${yTop + 0.5 * ss} ${x1},${ye} Z`;
  }
  const ye = yTop + 0.25 * ss;
  return `M${x1},${ye} Q${xm},${yTop + 1.5 * ss} ${x2},${ye} Q${xm},${yTop + 0.75 * ss} ${x1},${ye} Z`;
};

/*
  Half of the lens for a tie interrupted by a system break: anchored at
  (xAnchor), opening toward xOpen where it ends near the curve's apex
  height instead of returning to the baseline.
*/
const halfTiePath = (
  xAnchor: number,
  xOpen: number,
  yTop: number,
  ss: number,
  above: boolean
) => {
  const xc = xAnchor + (xOpen - xAnchor) * 0.6;
  if (above) {
    const ye = yTop + 1.0 * ss;
    const yApex = yTop - 0.05 * ss;
    return `M${xAnchor},${ye} Q${xc},${yApex} ${xOpen},${yTop + 0.15 * ss} Q${xc},${yApex + 0.4 * ss} ${xAnchor},${ye} Z`;
  }
  const ye = yTop + 0.25 * ss;
  const yApex = yTop + 1.3 * ss;
  return `M${xAnchor},${ye} Q${xc},${yApex} ${xOpen},${yTop + 1.1 * ss} Q${xc},${yApex - 0.4 * ss} ${xAnchor},${ye} Z`;
};

function paintTies(events: NoteEventInfo[], ctx: PaintContext) {
  const { ss, yAt, noteLeft, inkLeft, rowRight, notesRegionLeft, addPath } = ctx;

  // Reset any local ties hidden on a previous paint (idempotence under
  // re-layout: a tie that was cross-measure can become in-measure again)
  events.forEach((ev) => {
    if (ev.el.dataset.tieStart !== undefined) {
      const local = ev.el.querySelector<HTMLElement>(".tie-container");
      if (local) local.style.display = "";
    }
  });

  events.forEach((ev, index) => {
    if (ev.el.dataset.tieStart === undefined) return;
    // The tied-to note: the next note in the same staff and voice —
    // an explicit tie="stop" confirms it but isn't required
    let next: NoteEventInfo | undefined;
    for (let i = index + 1; i < events.length; i++) {
      const candidate = events[i];
      if (candidate.track !== ev.track) continue;
      if (candidate.voice !== ev.voice) continue;
      next = candidate;
      break;
    }
    if (!next) return; // nothing to tie to: keep the local curve
    const sameMeasure =
      ev.el.closest(".measure-container") ===
      next.el.closest(".measure-container");
    if (sameMeasure) return; // the in-measure curve already covers it

    const local = ev.el.querySelector<HTMLElement>(".tie-container");
    if (local) local.style.display = "none";

    const above = ev.el.dataset.tieStart === "above";
    const tieTop = parseFloat(ev.el.dataset.tieTop ?? "0");
    const x1 = noteLeft(ev) + 1.4 * ss;
    const x2 = inkLeft(next) - 0.3 * ss;

    if (sameLine(ev, next)) {
      addPath(tiePath(x1, Math.max(x2, x1 + 1.5 * ss), yAt(ev, tieTop), ss, above));
      return;
    }
    // System break: outgoing half past the barline, incoming half into
    // the destination note on the next system
    const xOut = Math.min(x1 + 5 * ss, rowRight(ev) - 0.3 * ss);
    addPath(halfTiePath(x1, xOut, yAt(ev, tieTop), ss, above));
    const xIn = Math.max(x2 - 5 * ss, notesRegionLeft(next) - 0.5 * ss);
    addPath(halfTiePath(x2, xIn, yAt(next, tieTop), ss, above));
  });
}

/* ---------------------------------- slurs --------------------------------- */

/*
  The slur band: same cubic profile as the in-measure Slur component
  (controls at 23%/83% of the span holding the bulge line, so the curve
  stays flat across the group and clears beams that end mid-span).
*/
const slurPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  cx1: number,
  cx2: number,
  bulge: number,
  ss: number,
  above: boolean
) => {
  const inner = bulge + (above ? 0.5 : -0.5) * ss;
  return `M${x1},${y1} C${cx1},${bulge} ${cx2},${bulge} ${x2},${y2} C${cx2},${inner} ${cx1},${inner} ${x1},${y1} Z`;
};

// y of the slur's outer cubic at a given x (x(t) is monotone here since
// both control xs lie inside [x1, x2], so bisection on t converges)
const cubicYAtX = (
  xq: number,
  x1: number,
  cx1: number,
  cx2: number,
  x2: number,
  y1: number,
  bulge: number,
  y2: number
) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const t = (lo + hi) / 2;
    const u = 1 - t;
    const xt =
      u * u * u * x1 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * x2;
    if (xt < xq) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const u = 1 - t;
  return (
    u * u * u * y1 + 3 * u * u * t * bulge + 3 * u * t * t * bulge + t * t * t * y2
  );
};

function paintSlurs(events: NoteEventInfo[], ctx: PaintContext) {
  const { ss, yAt, noteLeft, inkLeft, rowRight, addPath } = ctx;

  // Pair markers: an end matches the nearest unmatched start with the same
  // id. A note may end one slur and start another, so ends resolve first.
  const open = new Map<string, NoteEventInfo[]>();
  const pairs: Array<{ start: NoteEventInfo; end: NoteEventInfo }> = [];
  events.forEach((ev) => {
    const endId = ev.el.dataset.slurEnd;
    if (endId !== undefined) {
      const stack = open.get(endId);
      const start = stack?.pop();
      if (start) pairs.push({ start, end: ev });
    }
    const startId = ev.el.dataset.slurStart;
    if (startId !== undefined) {
      const stack = open.get(startId) ?? [];
      stack.push(ev);
      open.set(startId, stack);
    }
  });

  pairs.forEach(({ start, end }) => {
    const iStart = events.indexOf(start);
    const iEnd = events.indexOf(end);
    const covered = events
      .slice(iStart, iEnd + 1)
      .filter(
        (ev) => ev.track === start.track && ev.voice === start.voice
      );
    if (covered.length < 2) return;

    const above =
      start.el.dataset.slurDir !== undefined
        ? start.el.dataset.slurDir === "above"
        : !covered.every((ev) => ev.stemUp);
    const anchor = (ev: NoteEventInfo) =>
      yAt(ev, above ? ev.anchorAbove : ev.anchorBelow);
    const obstacle = (ev: NoteEventInfo) =>
      yAt(ev, above ? ev.obstacleAbove : ev.obstacleBelow);
    // A stem-side endpoint anchors at the stem (up-stems attach at the
    // notehead's right, down-stems at its left); notehead-side endpoints
    // anchor near the notehead's center
    const anchorX = (ev: NoteEventInfo) =>
      noteLeft(ev) +
      (ev.hasStem && above === ev.stemUp ? (ev.stemUp ? 1.25 : 0.05) : 0.6) *
        ss;

    // One curve segment per system row the slur passes through
    const segments: NoteEventInfo[][] = [];
    covered.forEach((ev) => {
      const current = segments[segments.length - 1];
      if (current && sameLine(current[0], ev)) {
        current.push(ev);
      } else {
        segments.push([ev]);
      }
    });

    segments.forEach((segment, segmentIndex) => {
      const first = segment[0];
      const last = segment[segment.length - 1];
      const isFirst = segmentIndex === 0;
      const isLast = segmentIndex === segments.length - 1;

      const x1 = isFirst ? anchorX(first) : inkLeft(first) - 1.2 * ss;
      const x2 = isLast ? anchorX(last) : rowRight(last) - 0.3 * ss;
      if (x2 - x1 < ss) return;
      let y1 = anchor(first);
      let y2 = anchor(last);

      /*
        The bulge clears every covered stem/beam tip, but the curve's rise
        and fall toward the (lower) notehead anchors can still cut through
        an obstacle near an endpoint — a beam that runs almost to the end
        note is the classic case. Check the actual bezier against every
        covered obstacle at its stem's x; where it collides, raise the
        nearer endpoint just clear of that obstacle (Gould: when space is
        tight the slur ends above the beam rather than at the notehead)
        and re-check, since raising an endpoint reshapes the curve.
      */
      const w = x2 - x1;
      const cx1 = x1 + 0.2 * w;
      const cx2 = x1 + 0.88 * w;
      const inner = segment.slice(1, -1);
      const clearance = (above ? -0.5 : 0.5) * ss;
      let bulge = 0;
      for (let pass = 0; pass < 3; pass++) {
        const extreme = above
          ? Math.min(y1, y2, ...segment.map(obstacle))
          : Math.max(y1, y2, ...segment.map(obstacle));
        bulge = extreme + (above ? -1.75 : 1.75) * ss;
        let changed = false;
        for (const ev of inner) {
          const xStem = noteLeft(ev) + (ev.stemUp ? 1.25 : 0.05) * ss;
          if (xStem <= x1 + 0.5 * ss || xStem >= x2 - 0.5 * ss) continue;
          const yCurve = cubicYAtX(xStem, x1, cx1, cx2, x2, y1, bulge, y2);
          const yObs = obstacle(ev);
          const collides = above
            ? yCurve > yObs - 0.35 * ss
            : yCurve < yObs + 0.35 * ss;
          if (!collides) continue;
          const target = yObs + clearance;
          if (xStem > (x1 + x2) / 2) {
            const next = above ? Math.min(y2, target) : Math.max(y2, target);
            if (next !== y2) {
              y2 = next;
              changed = true;
            }
          } else {
            const next = above ? Math.min(y1, target) : Math.max(y1, target);
            if (next !== y1) {
              y1 = next;
              changed = true;
            }
          }
        }
        if (!changed) break;
      }
      addPath(slurPath(x1, y1, x2, y2, cx1, cx2, bulge, ss, above));
    });
  });
}
