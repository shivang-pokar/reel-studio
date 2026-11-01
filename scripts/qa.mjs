// node <skill>/scripts/qa.mjs <N> [seconds…]
// After a render: frame sheet (1 frame/s) + one full-size frame per given second, for the design check.
//   out/reel-NN-slug/reelN-framesheet.png · out/reel-NN-slug/qa/t<sec>.png
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadIndex } from "./lib.mjs";

const [N, ...times] = process.argv.slice(2);
const r = loadIndex().find((x) => x.n === Number(N));
if (!r) { console.error(`reel ${N} not in reels/index.json`); process.exit(1); }
const mp4 = `${r.out}/reel${N}.mp4`;
const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).toString());
const rows = Math.ceil(Math.ceil(dur) / 8);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp4, "-vf", `fps=1,scale=270:-1,tile=8x${rows}`, "-frames:v", "1", `${r.out}/reel${N}-framesheet.png`]);
fs.mkdirSync(`${r.out}/qa`, { recursive: true });
for (const t of times) execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", t, "-i", mp4, "-frames:v", "1", `${r.out}/qa/t${t}.png`]);
console.log(`${dur.toFixed(1)} s · ${r.out}/reel${N}-framesheet.png${times.length ? ` · ${times.length} frames in ${r.out}/qa/` : ""}`);
