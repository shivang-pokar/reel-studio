import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, ch, hand, Word } from "./theme";
import { Avatar } from "./Avatar";

// ---------- building blocks: outlined white cards, hard offset shadows, label pills ----------
export const border = `4px solid ${C.ink}`;
export const shadow = (n = 7) => `${n}px ${n}px 0 ${C.ink}`;

export const useIn = (at: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping: 13, stiffness: 180 } });
};

// springs its children in at frame `at`; keeps their space reserved before that
export const In: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties; y?: number; rot?: number }> = ({ at, children, style, y = 40, rot = 0 }) => {
  const p = useIn(at);
  return <div style={{ opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * y}px) scale(${0.9 + 0.1 * p}) rotate(${rot * (1 - p)}deg)`, ...style }}>{children}</div>;
};

export const Pill: React.FC<{ bg: string; color?: string; children: React.ReactNode; size?: number }> = ({ bg, color = C.ink, children, size = 40 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: bg, color, border, boxShadow: shadow(5), borderRadius: 16, padding: "8px 24px", fontSize: size, fontWeight: 900 }}>{children}</div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "#fff", border, boxShadow: shadow(), borderRadius: 26, padding: "30px 36px", ...style }}>{children}</div>
);

// simple-icons logo, e.g. <Brand icon={siPosthog} size={60} />
export const Brand: React.FC<{ icon: { path: string; hex: string }; size: number; color?: string }> = ({ icon, size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d={icon.path} fill={color ?? `#${icon.hex}`} /></svg>
);

// every fact on screen shows where it came from
export const Source: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ fontSize: 24, fontWeight: 700, color: C.mute, textAlign: "right", marginTop: 18 }}>source: {text}</div>
);

// ---------- hand-drawn marker strokes and notes ----------
// rough, slightly overshooting ellipse so it reads as hand-drawn
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed = 1) => {
  const pts: string[] = [];
  const turns = 1.07, n = 72;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2 * turns - 0.6;
    const wob = 1 + 0.018 * Math.sin(i * 0.9 + seed) + 0.01 * Math.sin(i * 2.3 + seed * 2);
    const grow = 1 + (i / n) * 0.05;
    pts.push(`${(cx + Math.cos(t) * rx * wob * grow).toFixed(1)} ${(cy + Math.sin(t) * ry * wob * grow).toFixed(1)}`);
  }
  return "M " + pts.join(" L ");
};

// draws path `d` over `dur` frames starting at `at` (circle, underline, cross-out…)
export const Marker: React.FC<{ d: string; at: number; dur?: number; color?: string; width?: number; w: number; h: number; style?: React.CSSProperties }> = ({ d, at, dur = 14, color = C.danger, width = 9, w, h, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  if (p <= 0) return null;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", ...style }}>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} opacity={0.92} />
    </svg>
  );
};

export const HandNote: React.FC<{ at: number; children: React.ReactNode; color?: string; size?: number; rot?: number; style?: React.CSSProperties }> = ({ at, children, color = C.danger, size = 58, rot = -4, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", fontFamily: hand, fontWeight: 700, fontSize: size, color, transform: `rotate(${rot}deg) scale(${0.8 + 0.2 * p})`, opacity: p, whiteSpace: "nowrap", ...style }}>{children}</div>;
};

// ---------- caption bubble next to the avatar: ≤ 4 words, current word highlighted ----------
const groupWords = (words: Word[]) => {
  const groups: number[][] = [];
  let cur: number[] = [];
  let chars = 0;
  words.forEach((w, i) => {
    if (cur.length && chars + w.text.length > 20) { groups.push(cur); cur = []; chars = 0; }
    cur.push(i); chars += w.text.length + 1;
    if (cur.length >= 4 || /[.,:?!]$/.test(w.text)) { groups.push(cur); cur = []; chars = 0; }
  });
  if (cur.length) groups.push(cur);
  return groups;
};

export const Bubble: React.FC<{ words: Word[]; style: React.CSSProperties; tail?: "left" | "top" }> = ({ words, style, tail = "left" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const groups = groupWords(words);
  const gi = groups.findIndex((g, k) => t >= words[g[0]].start - 0.08 && (k === groups.length - 1 || t < words[groups[k + 1][0]].start - 0.08));
  if (gi < 0) return null;
  const g = groups[gi];
  const pop = spring({ frame: frame - Math.round((words[g[0]].start - 0.08) * fps), fps, config: { damping: 14, stiffness: 260 } });
  return (
    <div style={{ position: "absolute", ...style, transform: `scale(${0.92 + 0.08 * pop})`, transformOrigin: tail === "left" ? "0% 50%" : "50% 0%" }}>
      <div style={{ position: "relative", background: "#fff", border, boxShadow: shadow(5), borderRadius: 20, padding: "12px 22px", fontSize: 48, fontWeight: 900, whiteSpace: "nowrap", display: "flex", gap: 12 }}>
        {tail === "left" && (
          <div style={{ position: "absolute", left: -19, top: "50%", marginTop: -14, width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderRight: `18px solid ${C.ink}` }}>
            <div style={{ position: "absolute", left: 6, top: -9, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderRight: "12px solid #fff" }} />
          </div>
        )}
        {g.map((i) => {
          const w = words[i];
          const spoken = t >= w.start - 0.03;
          const active = spoken && (i === g[g.length - 1] || t < words[i + 1].start - 0.03);
          return (
            <span key={i} style={{ color: active ? "#fff" : spoken ? C.ink : C.mute, background: active ? C.primary : "transparent", borderRadius: 10, padding: active ? "0 10px" : "0" }}>
              {w.text.replace(/[.,:]$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- end screen: big action pill, one line, avatar centred ----------
export const Cta: React.FC<{ at: number; loudness: number[]; big?: string; sub: string; icon?: React.ReactNode }> = ({ at, loudness, big = ch.cta.share, sub, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
    <In at={at}><Pill bg={C.primary} color="#fff" size={56}>{icon} {big}</Pill></In>
    <In at={at + 8}><div style={{ fontSize: 48, fontWeight: 900, textAlign: "center", padding: "0 100px" }}>{sub}</div></In>
    <In at={at + 4} y={60}><div style={{ WebkitMaskImage: "linear-gradient(#000 70%, transparent 95%)" }}><Avatar loudness={loudness} width={500} /></div></In>
  </div>
);
