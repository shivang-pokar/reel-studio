// node <skill>/scripts/new-reel.mjs <slug> "<working title>" [stage]
// Creates every folder for the next reel and registers it in reels/index.json.
//   reels/<N>/                     script.json (skeleton), takes/
//   public/reel<N>/                voice.wav, words.json, loudness.json (filled later)
//   docs/reel-NN-<slug>-research/  research.md
//   out/reel-NN-<slug>/            mp4, cover, frame sheet, post.md (filled later)
// stage = pre-launch | launch | post-launch (the topic test in the learnings file)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadIndex, saveIndex, pad } from "./lib.mjs";

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [slugIn, title = "", stage = ""] = process.argv.slice(2);
if (!slugIn) { console.error('usage: new-reel.mjs <slug> "<title>" [pre-launch|launch|post-launch]'); process.exit(1); }
const slug = slugIn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const index = loadIndex();
const used = new Set(index.map((r) => r.n));
if (fs.existsSync("reels")) for (const d of fs.readdirSync("reels")) if (/^\d+$/.test(d)) used.add(Number(d));
const n = Math.max(0, ...used) + 1;
const NN = pad(n);

const paths = {
  script: `reels/${n}/script.json`,
  research: `docs/reel-${NN}-${slug}-research/research.md`,
  public: `public/reel${n}`,
  out: `out/reel-${NN}-${slug}`,
};
fs.mkdirSync(`reels/${n}/takes`, { recursive: true });
fs.mkdirSync(paths.public, { recursive: true });
fs.mkdirSync(paths.out, { recursive: true });
fs.mkdirSync(path.dirname(paths.research), { recursive: true });
if (!fs.existsSync(paths.script))
  fs.writeFileSync(paths.script, JSON.stringify({ hint: "", voice: "", caption: "" }, null, 1) + "\n");
if (!fs.existsSync(paths.research)) {
  const t = fs.readFileSync(path.join(SKILL, "templates/research.md"), "utf8");
  fs.writeFileSync(paths.research, t.replaceAll("{{N}}", String(n)).replaceAll("{{TITLE}}", title || slug).replaceAll("{{DATE}}", new Date().toISOString().slice(0, 10)));
}

index.push({ n, slug, title, stage, status: "research", composition: `Reel${n}`, ...paths, posted: null, url: null, created: new Date().toISOString().slice(0, 10) });
saveIndex(index);
console.log(`Reel ${n} · ${slug}`);
for (const [k, v] of Object.entries(paths)) console.log(`  ${k.padEnd(8)} ${v}`);
