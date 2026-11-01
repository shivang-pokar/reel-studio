import { AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, Word } from "./theme";
import { In, Bubble, Cta } from "./kit";
import { Avatar } from "./Avatar";

// The house look: one continuous dotted canvas. Each scene is a block placed on it, and a camera
// glides from block to block on the scene's first word (no fades). Avatar + caption bubble stay
// bottom-left; the end screen (CTA) replaces the canvas.

// frame of a word, by index or by its text (text survives re-voicing; pass `from` to skip earlier matches)
export const useWordTime = (words: Word[]) => {
  const { fps } = useVideoConfig();
  const f = (i: number) => Math.round(words[i].start * fps);
  const w = (text: string, from = 0) => {
    const clean = (s: string) => s.toLowerCase().replace(/[.,:;?!]/g, "");
    const i = words.findIndex((x, k) => k >= from && clean(x.text) === clean(text));
    if (i < 0) throw new Error(`word "${text}" not found after index ${from}`);
    return f(i);
  };
  return { f, w };
};

const BLOCK_W = 900;
// snake layout: right, down, left, down, right…  (screen centre of the content area = 540, 760)
const spot = (i: number): [number, number] => {
  const row = Math.floor(i / 2), right = (i % 2 === 1) !== (row % 2 === 1);
  return [right ? 1900 : 540, 760 + row * 1800];
};

const useCamera = (keys: { at: number; x: number; y: number }[]) => {
  const frame = useCurrentFrame();
  let x = keys[0].x, y = keys[0].y, z = 1;
  for (let i = 1; i < keys.length; i++) {
    const s = keys[i].at - 10, e = keys[i].at + 12; // glide starts just before the scene's first word
    if (frame >= e) { x = keys[i].x; y = keys[i].y; continue; }
    if (frame > s) {
      const p = Easing.inOut(Easing.cubic)((frame - s) / (e - s));
      x = keys[i - 1].x + (keys[i].x - keys[i - 1].x) * p;
      y = keys[i - 1].y + (keys[i].y - keys[i - 1].y) * p;
      z = 1 - 0.1 * Math.sin(p * Math.PI); // pull back a little mid-glide
    }
    break;
  }
  return { x, y, z };
};

export type Scene = { at: number; el: React.ReactNode };
export type Cue = [name: "pop" | "whoosh" | "marker" | "ding", at: number, volume: number];

export const CanvasReel: React.FC<{
  reel: number; words: Word[]; loudness: number[];
  scenes: Scene[];
  end: { at: number; sub: string; big?: string; icon?: React.ReactNode; next?: string };
  cues?: Cue[];
  series?: string; // small pill after the hook, off by default (non-followers don't know the series)
}> = ({ reel, words, loudness, scenes, end, cues = [], series }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const keys = scenes.map((s, i) => ({ at: s.at, x: spot(i)[0], y: spot(i)[1] }));
  const cam = useCamera(keys);
  const tx = 540 - cam.x * cam.z, ty = 760 - cam.y * cam.z;
  const canvasOut = interpolate(frame, [end.at - 7, end.at - 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const inEnd = frame >= end.at;
  const allCues: Cue[] = [...keys.slice(1).map((k) => ["whoosh", k.at - 12, 0.22] as Cue), ["whoosh", end.at - 8, 0.2], ...cues];

  return (
    <AbsoluteFill style={{ fontFamily, color: C.ink, background: C.bg, overflow: "hidden" }}>
      {/* dots move with the camera so the canvas feels physical */}
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.dot} ${2.6 * cam.z}px, transparent ${2.8 * cam.z}px)`, backgroundSize: `${34 * cam.z}px ${34 * cam.z}px`, backgroundPosition: `${tx}px ${ty}px` }} />
      {!inEnd && (
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${tx}px, ${ty}px) scale(${cam.z})`, transformOrigin: "0 0", opacity: canvasOut }}>
          {scenes.map((s, i) => (
            <div key={i} style={{ position: "absolute", left: spot(i)[0] - BLOCK_W / 2, top: spot(i)[1] - 460, width: BLOCK_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>{s.el}</div>
          ))}
        </div>
      )}
      {series && scenes.length > 1 && frame >= scenes[1].at && !inEnd && (
        <div style={{ position: "absolute", top: 150, width: "100%", display: "flex", justifyContent: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 800, background: "#fff", border: `3px solid ${C.ink}`, borderRadius: 999, padding: "6px 22px", opacity: 0.85 }}>{series}</div>
        </div>
      )}
      {!inEnd && (
        <>
          <div style={{ position: "absolute", left: 20, top: 1290, WebkitMaskImage: "linear-gradient(#000 72%, transparent 96%)" }}><Avatar loudness={loudness} width={380} /></div>
          <Bubble words={words} style={{ left: 350, top: 1395 }} />
        </>
      )}
      {frame >= end.at - 1 && (
        <>
          <div style={{ position: "absolute", top: 300, left: 0, right: 0 }}>
            <Cta at={end.at - 1} loudness={loudness} big={end.big} sub={end.sub} icon={end.icon} />
          </div>
          {inEnd && <Bubble words={words} tail="top" style={{ left: 0, right: 0, top: 1330, display: "flex", justifyContent: "center" }} />}
          {end.next && (
            <div style={{ position: "absolute", top: 1480, width: "100%", display: "flex", justifyContent: "center" }}>
              <In at={end.at + 20} y={10}><div style={{ fontSize: 30, fontWeight: 800, color: C.mute }}>{end.next}</div></In>
            </div>
          )}
        </>
      )}
      <Audio src={staticFile(`reel${reel}/voice.wav`)} />
      {allCues.filter(([, at]) => at >= 0 && at < durationInFrames).map(([name, at, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={20}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
