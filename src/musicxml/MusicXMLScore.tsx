import { useEffect, useMemo } from "react";
import { parseMusicXML } from "./parse";
import {
  InteractionContext,
  NoteInteractionHandlers,
} from "../components/InteractionContext";

interface MusicXMLScoreProps extends NoteInteractionHandlers {
  /** A MusicXML document (score-partwise) as a string. */
  xml: string;
  /**
   * Receives the importer's warnings (everything it skipped). Defaults to
   * logging them with console.warn.
   */
  onWarnings?: (warnings: string[]) => void;
}

/**
 * Parses and renders a MusicXML document. Unsupported notation degrades
 * gracefully: the importer skips what it can't draw and reports it via
 * `onWarnings`. For `.mxl` (compressed) files, unzip first and pass the
 * contained `.musicxml` document string.
 *
 * @example
 * ```tsx
 * import { MusicXMLScore } from "react-music-notation/musicxml";
 *
 * <MusicXMLScore xml={xmlString} />
 * ```
 */
export const MusicXMLScore = ({
  xml,
  onWarnings,
  onNoteClick,
  onNoteHover,
}: MusicXMLScoreProps) => {
  const { element, warnings } = useMemo(() => parseMusicXML(xml), [xml]);

  useEffect(() => {
    if (warnings.length === 0) return;
    if (onWarnings) {
      onWarnings(warnings);
    } else {
      console.warn(
        "[react-music-notation] MusicXML import skipped:",
        warnings
      );
    }
  }, [warnings, onWarnings]);

  return onNoteClick || onNoteHover ? (
    <InteractionContext.Provider value={{ onNoteClick, onNoteHover }}>
      {element}
    </InteractionContext.Provider>
  ) : (
    element
  );
};
