import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Staff } from "../components/Staff";
import { Measure } from "../components/Measure";
import { Note } from "../components/Note";
import { NoteStack } from "../components/NoteStack";
import { BeamContainer } from "../components/BeamContainer";
import { NoteInteractionInfo } from "../helpers/types";
import { MusicXMLScore } from "../musicxml";

/*
  Phase 16 demo: interactivity + accessibility.
  - score-level onNoteClick/onNoteHover (works for MusicXML imports too)
  - per-note onClick + selected for consumer-managed selection state
  - keyboard: Tab reaches every clickable note, Enter/Space activates
  - every note/chord/rest carries a spoken aria-label; measures are
    labeled groups with auto-assigned numbers
*/
const meta: Meta = {
  title: "Demo/Phase 16",
};

export default meta;

const describe = (info: NoteInteractionInfo) => {
  const what = info.rest
    ? "rest"
    : info.pitches
        .map((pitch) => `${pitch.step}${pitch.alter ? "#" : ""}${pitch.octave}`)
        .join(" + ") || "note";
  return `${what} — ${info.dotted ? "dotted " : ""}${info.noteValue}, measure ${
    info.measureNumber ?? "?"
  }`;
};

const panelStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 14,
  marginTop: 16,
};

const InteractiveScore = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [clicked, setClicked] = useState("(click or Tab + Enter on a note)");
  const [hovered, setHovered] = useState("");

  const note = (
    id: string,
    props: React.ComponentProps<typeof Note>
  ) => (
    <Note
      {...props}
      onClick={() => setSelected((current) => (current === id ? null : id))}
      selected={selected === id}
    />
  );

  return (
    <div>
      <Staff
        onNoteClick={(info) => setClicked(describe(info))}
        onNoteHover={(info) => setHovered(info ? describe(info) : "")}
      >
        <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
          {note("m1-c5", {
            pitch: { step: "C", octave: 5 },
            noteValue: "quarter",
          })}
          {note("m1-d5", {
            pitch: { step: "D", octave: 5 },
            noteValue: "quarter",
          })}
          {note("m1-e5", {
            pitch: { step: "E", octave: 5 },
            noteValue: "half",
          })}
        </Measure>
        <Measure>
          <BeamContainer>
            {note("m2-f5", {
              pitch: { step: "F", octave: 5 },
              noteValue: "eighth",
            })}
            {note("m2-g5", {
              pitch: { step: "G", octave: 5 },
              noteValue: "eighth",
            })}
          </BeamContainer>
          {note("m2-rest", { rest: true, noteValue: "quarter" })}
          <NoteStack
            noteValue="half"
            pitches={[
              { pitch: { step: "C", octave: 5 } },
              { pitch: { step: "E", octave: 5 } },
            ]}
            onClick={() =>
              setSelected((current) => (current === "m2-chord" ? null : "m2-chord"))
            }
            selected={selected === "m2-chord"}
          />
        </Measure>
      </Staff>
      <div style={panelStyle}>
        <div>
          <strong>clicked:</strong> {clicked}
        </div>
        <div>
          <strong>hovering:</strong> {hovered || "—"}
        </div>
      </div>
    </div>
  );
};

export const Interactive: StoryObj = {
  render: function Render() {
    return <InteractiveScore />;
  },
};

// Static look of the selection color (and the recolored stem/ledger/tie)
export const SelectionColor: StoryObj = {
  render: () => (
    <Staff>
      <Measure clef="gClef" time={{ beat: 4, beatType: 4 }}>
        <Note pitch={{ step: "C", octave: 5 }} noteValue="quarter" />
        <Note
          pitch={{ step: "A", octave: 5 }}
          noteValue="quarter"
          selected
        />
        <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="start" selected />
      </Measure>
      <Measure barline="final">
        <Note pitch={{ step: "D", octave: 5 }} noteValue="half" tie="stop" />
        <NoteStack
          noteValue="half"
          selected
          pitches={[
            { pitch: { step: "B", octave: 4 } },
            { pitch: { step: "D", octave: 5 } },
          ]}
        />
      </Measure>
    </Staff>
  ),
};

const XML_SNIPPET = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="4.0">
  <part-list>
    <score-part id="P1"><part-name>Oboe</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration><voice>1</voice><type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>4</duration><voice>1</voice><type>half</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>8</duration><voice>1</voice><type>whole</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`;

const InteractiveXML = () => {
  const [clicked, setClicked] = useState("(click any imported note)");
  return (
    <div>
      <MusicXMLScore
        xml={XML_SNIPPET}
        onNoteClick={(info) => setClicked(describe(info))}
      />
      <div style={panelStyle}>
        <strong>clicked:</strong> {clicked}
      </div>
    </div>
  );
};

export const FromMusicXML: StoryObj = {
  render: function Render() {
    return <InteractiveXML />;
  },
};
