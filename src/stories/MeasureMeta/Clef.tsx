import React from "react";
import "./Clef.css";
import { clefGlyphs } from "../../helpers/glyphs";

interface ClefProps {
  clef: "gClef" | "fClef" | "cClef";
}

export const Clef = ({ clef }: ClefProps) => {
  return <div className="clef-container">{clefGlyphs[clef]}</div>;
};
