// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BeamContainer,
  GrandMeasure,
  GrandStaff,
  Measure,
  Note,
  NoteStack,
  Score,
  ScoreMeasure,
  Slur,
  Staff,
  TabNote,
  Tuplet,
  Voice,
} from "../../src";

/*
  SSR smoke test: the components must render to markup in a pure Node
  environment — no window, document, DOMParser, or ResizeObserver.
  (Effects don't run under renderToStaticMarkup; what this catches is
  anything touching browser globals at module scope or during render.)
  The importer is exempt: parseMusicXML needs DOMParser, which servers
  must polyfill — documented in the README.
*/

describe("server-side rendering", () => {
  it("renders a kitchen-sink staff without browser globals", () => {
    const markup = renderToStaticMarkup(
      <Staff>
        <Measure clef="gClef" fifths={2} time={{ beat: 4, beatType: 4 }}>
          <BeamContainer>
            <Note pitch={{ step: "D", octave: 5 }} noteValue="eighth" />
            <Note
              pitch={{ step: "F", octave: 5, alter: "sharp" }}
              noteValue="eighth"
            />
          </BeamContainer>
          <Tuplet ratio={[3, 2]}>
            <Note pitch={{ step: "A", octave: 4 }} noteValue="eighth" />
            <Note pitch={{ step: "B", octave: 4 }} noteValue="eighth" />
            <Note pitch={{ step: "C", octave: 5 }} noteValue="eighth" />
          </Tuplet>
          <NoteStack
            noteValue="quarter"
            pitches={[
              { pitch: { step: "C", octave: 5 } },
              { pitch: { step: "E", octave: 5 } },
            ]}
          />
        </Measure>
        <Measure barline="final">
          <Slur>
            <Note pitch={{ step: "G", octave: 4 }} noteValue="half" />
            <Note pitch={{ step: "A", octave: 4 }} noteValue="half" />
          </Slur>
        </Measure>
      </Staff>
    );
    expect(markup).toContain("staff-container");
    // 2 beamed + 3 tuplet + 1 chord stack + 2 slurred
    expect((markup.match(/note-container/g) ?? []).length).toBe(8);
  });

  it("renders voices, grand staff, score, and tab", () => {
    const markup = renderToStaticMarkup(
      <>
        <Staff>
          <Measure clef="gClef" time={{ beat: 2, beatType: 4 }}>
            <Voice stem="upStem">
              <Note pitch={{ step: "E", octave: 5 }} noteValue="half" />
            </Voice>
            <Voice stem="downStem">
              <Note pitch={{ step: "C", octave: 5 }} noteValue="half" />
            </Voice>
          </Measure>
        </Staff>
        <GrandStaff>
          <GrandMeasure
            upper={
              <Measure clef="gClef">
                <Note pitch={{ step: "C", octave: 5 }} noteValue="whole" />
              </Measure>
            }
            lower={
              <Measure clef="fClef">
                <Note pitch={{ step: "C", octave: 3 }} noteValue="whole" />
              </Measure>
            }
          />
        </GrandStaff>
        <Score partNames={["Vln", "Vc"]}>
          <ScoreMeasure
            parts={[
              <Measure clef="gClef">
                <Note pitch={{ step: "G", octave: 5 }} noteValue="whole" />
              </Measure>,
              <Measure clef="fClef">
                <Note pitch={{ step: "C", octave: 3 }} noteValue="whole" />
              </Measure>,
            ]}
          />
        </Score>
        <Staff>
          <Measure clef="tab">
            <TabNote noteValue="whole" frets={[{ string: 6, fret: 0 }]} />
          </Measure>
        </Staff>
      </>
    );
    expect(markup).toContain("grand-staff-container");
    expect(markup).toContain("score-container");
    expect(markup).toContain("tab-note");
  });
});
