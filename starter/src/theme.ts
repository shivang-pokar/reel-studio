import { loadFont as loadBody } from "@remotion/google-fonts/Nunito";
import { loadFont as loadHand } from "@remotion/google-fonts/Caveat";
import channel from "../channel.json";

// Everything visual that differs per creator comes from channel.json.
export const ch = channel;
export const C = channel.colors;
export const { fontFamily } = loadBody("normal", { weights: ["600", "800", "900"], subsets: ["latin"] });
export const { fontFamily: hand } = loadHand("normal", { weights: ["700"], subsets: ["latin"] });

export type Word = { text: string; start: number; end: number };
export type ReelProps = { reel: number; words: Word[]; loudness: number[] };
