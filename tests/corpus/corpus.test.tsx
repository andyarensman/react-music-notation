// @vitest-environment jsdom
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { parseMusicXML } from "../../src/musicxml";

/*
  Robustness corpus: real-world MusicXML (see fixtures/README.md) that we
  did not write. For every file the importer must
  - parse without throwing,
  - render to markup (renderToStaticMarkup runs the full component tree),
  - produce a plausible number of note events (a file quietly rendering
    almost nothing is a bug even when nothing throws),
  - keep its skip-warnings stable (snapshot): warnings changing without
    an importer change means a regression; a warning disappearing should
    be the deliberate result of new coverage.
*/

const fixturesDir = join(__dirname, "fixtures");
const fixtures = readdirSync(fixturesDir).filter((f) => f.endsWith(".xml"));

describe("MusicXML corpus", () => {
  it("has fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  for (const file of fixtures) {
    describe(file, () => {
      const xml = readFileSync(join(fixturesDir, file), "utf8");

      it("parses and renders", () => {
        const { element } = parseMusicXML(xml);
        expect(element).toBeTruthy();
        const markup = renderToStaticMarkup(element);
        // every rendered note/rest/chord container carries this class
        const noteCount = (markup.match(/note-container/g) ?? []).length;
        const measureCount = (markup.match(/measure-container/g) ?? [])
          .length;
        expect(measureCount).toBeGreaterThan(0);
        // real scores have many events; even HelloWorld-size files have 1
        expect(noteCount).toBeGreaterThan(0);
        expect(noteCount / measureCount).toBeGreaterThan(0.5);
      });

      it("keeps its warnings stable", () => {
        const { warnings } = parseMusicXML(xml);
        // count + content both matter; sort so ordering churn can't flake
        expect(
          [`${warnings.length} warnings`, ...[...warnings].sort()].join("\n")
        ).toMatchSnapshot();
      });
    });
  }
});
