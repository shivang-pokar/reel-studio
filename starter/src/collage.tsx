import { AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, fontFamily, Word } from "./theme";
import { Avatar } from "./Avatar";

// The house look ("Collage"): paper + dot grid, a big headline that builds word by word with a
// marker swipe under key words, a soft colour blob behind the hero (colour per chapter), tilted
// taped cards with a hard shadow, a NEW hero visual every 1–2 s, and the avatar as a sticker
// bottom-right. The headline IS the caption, so there is no caption bubble.

export const mono = "ui-monospace, Menlo, monospace";
export const bd = `4px solid ${C.ink}`;
export const sh = (n = 8) => `${n}px ${n}px 0 ${C.ink}`;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const clean = (s: string) => s.toLowerCase().replace(/[.,:;?!"'“”।]/g, "");

// ---------- pieces for hero visuals ----------
const useSpring = (at: number, damping = 13) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping, stiffness: 190 } });
};

// springs its children in at frame `at`
export const Pop: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; s0?: number }> = ({ at, children, style, y = 30, s0 = 0.85 }) => {
  const p = useSpring(at);
  return <div style={{ opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * y}px) scale(${s0 + (1 - s0) * p})`, ...style }}>{children}</div>;
};

const Tape: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: "absolute", width: 140, height: 44, background: C.tape, zIndex: 2, ...style }} />
);

// white card, 12 px hard shadow, two strips of tape on top
export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tape?: boolean }> = ({ children, style, tape = true }) => (
  <div style={{ position: "relative", background: "#fff", border: bd, boxShadow: sh(12), borderRadius: 30, padding: "30px 36px", boxSizing: "border-box", ...style }}>
    {tape && <><Tape style={{ left: -38, top: -16, transform: "rotate(-28deg)" }} /><Tape style={{ right: -38, top: -16, transform: "rotate(28deg)" }} /></>}
    {children}
  </div>
);

// red rubber stamp that slams in (FREE, FIXED, QUOTA FULL…)
export const Stamp: React.FC<{ at: number; children: React.ReactNode; rot?: number; size?: number; style?: React.CSSProperties }> = ({ at, children, rot = -8, size = 64, style }) => {
  const frame = useCurrentFrame();
  const p = useSpring(at, 11);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", transform: `rotate(${rot}deg) scale(${1.7 - 0.7 * p})`, opacity: Math.min(1, p * 2), border: `6px solid ${C.danger}`, color: C.danger, borderRadius: 16, padding: "4px 22px", fontSize: size, fontWeight: 900, letterSpacing: 2, background: "rgba(255,255,255,0.85)", whiteSpace: "nowrap", ...style }}>{children}</div>
  );
};

// logo + huge number + unit, with a FREE stamp: the "number" beat of most reels
export const BigNumber: React.FC<{ logo: React.ReactNode; num: string; unit: string; stampAt: number; stamp?: string; note?: string }> = ({ logo, num, unit, stampAt, stamp = "FREE", note }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
    {logo}
    <div style={{ fontSize: 250, fontWeight: 900, lineHeight: 1, marginTop: 10, letterSpacing: -6 }}>{num}</div>
    <div style={{ fontSize: 56, fontWeight: 900, color: C.mute, marginTop: 6 }}>{unit}</div>
    {note && <div style={{ fontFamily: mono, fontSize: 28, color: C.mute, marginTop: 14 }}>{note}</div>}
    <Stamp at={stampAt} style={{ right: -90, top: -30 }}>{stamp}</Stamp>
  </div>
);

// ---------- overlay ----------
// headline = the sentence being spoken; groups are [first, last] word index
const Headline: React.FC<{ words: Word[]; f: (i: number) => number; groups: [number, number][]; keys: Set<number>; red: Set<number> }> = ({ words, f, groups, keys, red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [a, b] = [...groups].reverse().find(([s]) => frame >= f(s) - 2) ?? groups[0];
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 160, display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 22, fontSize: 90, fontWeight: 900, lineHeight: 1.12, letterSpacing: -1, color: C.ink }}>
      {words.slice(a, b + 1).map((w, k) => {
        const i = a + k;
        const at = f(i) - 2;
        const p = a === 0 || k === 0 ? 1 : spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 220 } });
        const shown = a === 0 || k === 0 || frame >= at; // first word lands with the line, so no blank frame
        const hl = a === 0 ? 1 : interpolate(frame, [at + 2, at + 9], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", opacity: shown ? Math.min(1, p * 1.8) : 0, transform: `translateY(${(1 - p) * 16}px)` }}>
            {keys.has(i) && <span style={{ position: "absolute", left: -8, right: -8, bottom: 8, height: "44%", background: C.highlight, borderRadius: 8, transform: `rotate(-1.5deg) scaleX(${hl})`, transformOrigin: "0 50%" }} />}
            <span style={{ position: "relative", color: red.has(i) ? C.danger : C.ink }}>{w.text}</span>
          </span>
        );
      })}
    </div>
  );
};

// soft blob behind the hero; colour changes (and pops) on each chapter
const Blob: React.FC<{ starts: number[] }> = ({ starts }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const idx = Math.max(0, starts.filter((s) => frame >= s).length - 1);
  const p = spring({ frame: frame - (idx === 0 ? -30 : starts[idx]), fps, config: { damping: 12, stiffness: 140 } });
  const m = Math.sin(frame / 40) * 4;
  return (
    <div style={{ position: "absolute", left: 90, top: 400, width: 900, height: 900, borderRadius: `${46 + m}% ${54 - m}% ${52 + m}% ${48 - m}% / ${50 - m}% ${44 + m}% ${56 - m}% ${50 + m}%`, background: C.blobs[idx % C.blobs.length], transform: `scale(${0.86 + 0.14 * p}) rotate(${frame * 0.05}deg)` }} />
  );
};

// halftone dot wipe, e.g. into "the catch"
const DotWipe: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [at - 8, at + 8], [0, 1], clamp);
  if (t <= 0 || t >= 1) return null;
  const r = Math.sin(t * Math.PI) * 46;
  return <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.ink} ${r}px, transparent ${r + 1}px)`, backgroundSize: "60px 60px", backgroundPosition: "30px 30px" }} />;
};

const sticker = "drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(10px 12px 0 rgba(28,42,90,.25))";

// ---------- word timing helpers ----------
// f(i): frame of caption word i. w("Sentry"): frame of a word by its text (survives re-voicing).
// idx("Sentry"): its index. Pass `from` to skip earlier matches.
export const useWords = (words: Word[]) => {
  const { fps } = useVideoConfig();
  const idx = (text: string, from = 0) => {
    const i = words.findIndex((x, k) => k >= from && clean(x.text) === clean(text));
    if (i < 0) throw new Error(`word "${text}" not found after index ${from}`);
    return i;
  };
  const f = (i: number) => Math.round(words[Math.min(i, words.length - 1)].start * fps);
  return { f, idx, w: (text: string, from = 0) => f(idx(text, from)) };
};

// split the voice into headline lines: at . ? ! : and every ~maxWords
export const autoGroups = (words: Word[], maxWords = 8): [number, number][] => {
  const out: [number, number][] = [];
  let s = 0;
  words.forEach((w, i) => {
    if (/[.?!:।]$/.test(w.text) || i - s + 1 >= maxWords || i === words.length - 1) { out.push([s, i]); s = i + 1; }
  });
  return out;
};

// ---------- the reel ----------
export type Beat = { at: number; el: React.ReactNode; source?: string }; // at = caption word index
export type Cue = [name: "pop" | "whoosh" | "marker" | "ding", at: number, volume: number];

export const CollageReel: React.FC<{
  reel: number; words: Word[]; loudness: number[];
  beats: Beat[];                       // a new hero every 1–2 s; first one at word 0
  chapters: [at: number, label: string][]; // small "// 01 · hook" label top-left; also changes the blob colour
  keys?: number[];                     // word indices with the yellow marker swipe
  red?: number[];                      // word indices drawn in red (e.g. "Catch")
  groups?: [number, number][];         // headline lines; default = autoGroups(words)
  wipeAt?: number;                     // word index for a dot wipe (usually the catch)
  cues?: Cue[];
}> = ({ reel, words, loudness, beats, chapters, keys = [], red = [], groups, wipeAt, cues = [] }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const f = (i: number) => Math.round(words[Math.min(i, words.length - 1)].start * fps);

  const starts = beats.map((b) => (b.at === 0 ? 0 : f(b.at) - 4));
  const bi = Math.max(0, starts.filter((s) => frame >= s).length - 1);
  const start = starts[bi];
  const next = starts[bi + 1] ?? durationInFrames + 10;
  const enter = bi === 0 ? 1 : spring({ frame: frame - start, fps, config: { damping: 13, stiffness: 200 } });
  const exit = interpolate(frame, [next - 4, next], [1, 0], clamp);
  const { el, source } = beats[bi];

  const chStarts = chapters.map(([i]) => (i === 0 ? 0 : f(i) - 3));
  const chapter = chapters[Math.max(0, chStarts.filter((s) => frame >= s).length - 1)];

  // avatar bounces on every beat
  const k = frame - start;
  const amp = Math.exp(-k / 6) * Math.sin(k / 2.2);
  const allCues: Cue[] = [...starts.slice(1).map((s) => ["pop", s, 0.13] as Cue), ...(wipeAt !== undefined ? [["whoosh", f(wipeAt) - 10, 0.24] as Cue] : []), ...cues];

  return (
    <AbsoluteFill style={{ fontFamily, color: C.ink, background: C.paper, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${C.paperDot} 2.4px, transparent 2.6px)`, backgroundSize: "34px 34px" }} />
      <Blob starts={chStarts} />
      <div style={{ position: "absolute", left: 80, top: 104, fontFamily: mono, fontSize: 27, color: C.mute }}>// {chapter[1]}</div>
      <Headline words={words} f={f} groups={groups ?? autoGroups(words)} keys={new Set(keys)} red={new Set(red)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 720, display: "flex", alignItems: "center", justifyContent: "center", opacity: Math.min(1, enter * 1.6) * exit, transform: `translateY(${(1 - enter) * 40}px) scale(${(0.88 + 0.12 * enter) * (0.94 + 0.06 * exit)}) rotate(${[-2.5, 2, -1.5, 2.5][bi % 4] * (0.4 + 0.6 * enter)}deg)` }}>
        {el}
      </div>
      {source && <div style={{ position: "absolute", left: 80, top: 1430, fontFamily: mono, fontSize: 24, color: C.mute, opacity: exit }}>source: {source}</div>}
      <div style={{ position: "absolute", left: 560, top: 1200, transform: `translateY(${-amp * 18}px) rotate(${-3 + amp * 1.6}deg)`, transformOrigin: "50% 100%", filter: sticker }}>
        <Avatar loudness={loudness} width={540} />
      </div>
      {wipeAt !== undefined && <DotWipe at={f(wipeAt) - 4} />}
      <Audio src={staticFile(`reel${reel}/voice.wav`)} />
      {allCues.filter(([, at]) => at >= 0 && at < durationInFrames).map(([name, at, vol], i) => (
        <Sequence key={i} from={at} durationInFrames={20}>
          <Audio src={staticFile(`sfx/${name}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
