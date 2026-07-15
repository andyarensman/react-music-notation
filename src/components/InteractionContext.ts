import { SyntheticEvent, createContext } from "react";
import { NoteInteractionInfo } from "../helpers/types";

/**
 * Score-level interaction callbacks, provided by `Staff`/`GrandStaff`/
 * `Score`/`MusicXMLScore` when their `onNoteClick`/`onNoteHover` props are
 * set. Every note and chord beneath the provider becomes interactive:
 * pointer cursor, hover highlight, keyboard focus, Enter/Space activation.
 */
export interface NoteInteractionHandlers {
  /** A note/chord/rest was clicked (or activated with Enter/Space). */
  onNoteClick?: (info: NoteInteractionInfo, event: SyntheticEvent) => void;
  /** The pointer entered (info) or left (null) a note/chord/rest. */
  onNoteHover?: (
    info: NoteInteractionInfo | null,
    event: SyntheticEvent
  ) => void;
}

export const InteractionContext = createContext<NoteInteractionHandlers>({});
