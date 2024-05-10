import React from "react";
import "./Clef.css";
import "../../global.css";
import { clefGlyphs } from "../../helpers/glyphs";

interface ClefProps {
  clef: "gClef" | "fClef" | "cClef";
}

export const Clef = ({ clef }: ClefProps) => {
  return <div className="clef-container leland">{clefGlyphs[clef]}</div>;
};
