// Playback for react-music-notation, as an optional subpath:
//   import { extractPlaybackScore, usePlayback } from "react-music-notation/playback";
// Zero dependencies: the default instrument is a small Web Audio synth.

export { extractPlaybackScore } from "./extract";
export type {
  ExtractOptions,
  PlaybackEvent,
  PlaybackScore,
} from "./extract";
export { createWebAudioInstrument } from "./instrument";
export type { Instrument } from "./instrument";
export { usePlayback } from "./usePlayback";
export type { UsePlaybackOptions } from "./usePlayback";
