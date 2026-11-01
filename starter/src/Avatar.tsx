import { Img, staticFile, useCurrentFrame } from "remotion";
import { ch } from "./theme";

// The creator's avatar PNG + an SVG mouth whose opening follows the voice loudness (no lip-sync model).
// Mouth position/size and colours come from channel.json → avatar.
const A = ch.avatar;
const W = A.width, H = A.height;
const { x: cx, y: cy } = A.mouth;
const k = A.mouth.width / 268; // the shapes below were drawn for a 268 px wide mouth

export const Avatar: React.FC<{ loudness: number[]; width: number; still?: boolean }> = ({ loudness, width, still }) => {
  const frame = useCurrentFrame();
  const l = still ? 0 : loudness[frame] ?? 0;
  const open = Math.pow(l, 0.8) * 62 * k;
  const bob = Math.sin(frame / 18) * 6 + l * -8;
  const tilt = still ? 0 : Math.sin(frame / 41) * 0.8;

  const L = cx - 126 * k + open * 0.5, R = cx + 126 * k - open * 0.5; // corners pull in a bit when open
  const closed = `M ${cx - 134 * k} ${cy - 12 * k} Q ${cx} ${cy + 36 * k} ${cx + 134 * k} ${cy - 22 * k}`;
  const mouth = `M ${L} ${cy - 14 * k} Q ${cx} ${cy - 2 * k - open * 0.15} ${R} ${cy - 18 * k} Q ${cx} ${cy + 20 * k + open * 1.1} ${L} ${cy - 14 * k} Z`;

  return (
    <div style={{ width, height: (width * H) / W, transform: `translateY(${bob}px) rotate(${tilt}deg)`, transformOrigin: "50% 100%", position: "relative" }}>
      <Img src={staticFile(A.file)} style={{ width: "100%", height: "100%" }} />
      <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <ellipse cx={cx} cy={cy} rx={150 * k} ry={30 * k} fill={A.skin} />
        {open < 4 * k ? (
          <path d={closed} stroke={A.lip} strokeWidth={15 * k} strokeLinecap="round" fill="none" />
        ) : (
          <>
            <path d={mouth} fill={A.inside} stroke={A.lip} strokeWidth={10 * k} strokeLinejoin="round" />
            <path d={`M ${L + 30 * k} ${cy - 8 * k} Q ${cx} ${cy + 2 * k + open * 0.1} ${R - 30 * k} ${cy - 12 * k}`} stroke="#fff" strokeWidth={Math.min(12 * k, open * 0.3)} strokeLinecap="round" fill="none" opacity={0.9} />
          </>
        )}
      </svg>
    </div>
  );
};
