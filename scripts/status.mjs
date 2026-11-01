// node <skill>/scripts/status.mjs                       -> table of all reels
// node <skill>/scripts/status.mjs <N> key=value ...     -> update a reel, e.g. status=posted posted=2026-10-30 url=https://…
// Statuses, in order: research → script → approved → voiced → preview → rendered → posted → analysed
import { loadIndex, saveIndex } from "./lib.mjs";

const [nArg, ...pairs] = process.argv.slice(2);
const index = loadIndex();

if (nArg) {
  const r = index.find((x) => x.n === Number(nArg));
  if (!r) { console.error(`reel ${nArg} not in reels/index.json`); process.exit(1); }
  for (const p of pairs) {
    const i = p.indexOf("=");
    if (i < 1) continue;
    r[p.slice(0, i)] = p.slice(i + 1);
  }
  saveIndex(index);
}

const rows = index.map((r) => [r.n, r.slug, r.status, r.stage || "-", r.posted || "-", r.title || ""]);
const head = ["#", "slug", "status", "stage", "posted", "title"];
const w = head.map((h, c) => Math.max(h.length, ...rows.map((r) => String(r[c]).length)));
const line = (r) => r.map((v, c) => String(v).padEnd(w[c])).join("  ");
console.log(line(head) + "\n" + w.map((x) => "-".repeat(x)).join("  ") + "\n" + rows.map(line).join("\n"));
