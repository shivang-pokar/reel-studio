// node <skill>/scripts/init.mjs
// One-time setup in the current folder: copies the Remotion starter, channel.json, the learnings file
// and .gitignore. Never overwrites an existing file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SKILL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const copied = [], kept = [];

function copy(from, to) {
  if (fs.statSync(from).isDirectory()) {
    for (const f of fs.readdirSync(from)) copy(path.join(from, f), path.join(to, f));
    return;
  }
  if (fs.existsSync(to)) { kept.push(to); return; }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  copied.push(to);
}

copy(path.join(SKILL, "starter"), ".");
copy(path.join(SKILL, "templates/channel.example.json"), "channel.json");
copy(path.join(SKILL, "templates/learnings.md"), "docs/reel-learnings/learnings.md");
copy(path.join(SKILL, "templates/voice.md"), "docs/voice.md");
for (const d of ["reels", "out/samples", "public/logos"]) fs.mkdirSync(d, { recursive: true });
if (!fs.existsSync("reels/index.json")) { fs.writeFileSync("reels/index.json", "[]\n"); copied.push("reels/index.json"); }

const ignore = ["node_modules/", ".env", "out/", "reels/*/takes/"];
const gi = fs.existsSync(".gitignore") ? fs.readFileSync(".gitignore", "utf8") : "";
const missing = ignore.filter((l) => !gi.split("\n").includes(l));
if (missing.length) fs.writeFileSync(".gitignore", gi + (gi && !gi.endsWith("\n") ? "\n" : "") + missing.join("\n") + "\n");
if (!fs.existsSync(".env")) { fs.writeFileSync(".env", "OPENAI_API_KEY=\n"); copied.push(".env (empty, the user pastes their key)"); }

console.log("copied:\n  " + copied.join("\n  "));
if (kept.length) console.log("already existed (left as is):\n  " + kept.join("\n  "));
console.log("\nnext: npm install · fill channel.json · put avatar.png in public/ · user pastes OPENAI_API_KEY into .env");
