// node <skill>/scripts/captions.mjs <N>
// whisper-1 word timestamps -> one {text,start,end} per caption token, aligned by DP.
// Transcription language comes from channel.json (language.whisper, e.g. "hi" for Hinglish, "en" for English).
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { loadEnv, loadChannel, tokens, align } from "./lib.mjs";

loadEnv();
const LANG = loadChannel().language?.whisper ?? "hi";
const N = process.argv[2];
if (!N) { console.error("usage: captions.mjs <N>"); process.exit(1); }
const script = JSON.parse(fs.readFileSync(`reels/${N}/script.json`, "utf8"));
const wav = `public/reel${N}/voice.wav`;

const fd = new FormData();
fd.append("file", new Blob([fs.readFileSync(wav)]), "voice.wav");
fd.append("model", "whisper-1");
fd.append("response_format", "verbose_json");
fd.append("timestamp_granularities[]", "word");
fd.append("language", LANG); // don't pass the script as a prompt: whisper-1 skips ahead on Hinglish
const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: fd,
});
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const j = await res.json();
fs.writeFileSync(`reels/${N}/whisper.json`, JSON.stringify(j, null, 2));

const hw = j.words;
const hyp = hw.map((w) => tokens(w.word)[0] ?? "");
// voice and caption tokens are 1:1; align on the voice (Devanagari) tokens
const voiceToks = script.voice.split(/\s+/).filter(Boolean);
const capToks = script.caption.split(/\s+/).filter(Boolean);
if (voiceToks.length !== capToks.length) throw new Error("voice/caption token counts differ");
const ref = voiceToks.map((t) => tokens(t)[0] ?? "");
const map = align(ref, hyp, 0.4);

const out = capToks.map((text, i) => ({
  text,
  start: map[i] >= 0 ? hw[map[i]].start : null,
  end: map[i] >= 0 ? hw[map.end[i]].end : null,
}));
// interpolate unmatched runs between known neighbours
for (let i = 0; i < out.length; i++) {
  if (out[i].start !== null) continue;
  let k = i;
  while (k < out.length && out[k].start === null) k++;
  const t0 = i > 0 ? out[i - 1].end : 0;
  const t1 = k < out.length ? out[k].start : j.duration;
  const step = (t1 - t0) / (k - i);
  for (let m = i; m < k; m++) out[m] = { ...out[m], start: t0 + step * (m - i), end: t0 + step * (m - i + 1), interp: true };
}
// second pass: re-transcribe each interpolated run (>= 3 words) on its own clip
async function whisperWords(file, prompt) {
  const f = new FormData();
  f.append("file", new Blob([fs.readFileSync(file)]), "clip.wav");
  f.append("model", "whisper-1");
  f.append("response_format", "verbose_json");
  f.append("timestamp_granularities[]", "word");
  f.append("language", LANG);
  const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: f,
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return (await r.json()).words;
}
for (let i = 0; i < out.length; i++) {
  if (!out[i].interp) continue;
  let k = i;
  while (k < out.length && out[k].interp) k++;
  if (k - i >= 3) {
    const a = Math.max(0, (i > 0 ? out[i - 1].start : 0) - 0.05);
    const b = Math.min(j.duration, (k < out.length ? out[k].end : j.duration) + 0.05);
    const clip = `reels/${N}/clip-${i}.wav`;
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(a), "-t", String(b - a), "-i", wav, clip]);
    const lo = Math.max(0, i - 1), hi = Math.min(out.length, k + 1);
    const words = await whisperWords(clip, voiceToks.slice(lo, hi).join(" "));
    const m2 = align(ref.slice(lo, hi), words.map((w) => tokens(w.word)[0] ?? ""), 0.4);
    console.log("  clip", a.toFixed(2), b.toFixed(2), words.map((w) => `${w.word}@${(a + w.start).toFixed(2)}`).join(" "));
    let fixed = 0;
    for (let t = i; t < k; t++) {
      const h = m2[t - lo];
      if (h >= 0) { out[t] = { text: out[t].text, start: a + words[h].start, end: a + words[m2.end[t - lo]].end, pass2: true }; fixed++; }
    }
    console.log(`pass2 ${i}-${k - 1}: fixed ${fixed}/${k - i}`);
    fs.unlinkSync(clip);
    // re-interpolate anything still missing inside this run
    for (let t = i; t < k; t++) {
      if (!out[t].interp) continue;
      let e = t; while (e < k && out[e].interp) e++;
      const t0 = out[t - 1]?.end ?? a, t1 = out[e]?.start ?? b, st = (t1 - t0) / (e - t);
      for (let m = t; m < e; m++) out[m] = { text: out[m].text, start: t0 + st * (m - t), end: t0 + st * (m - t + 1), interp: true };
      t = e;
    }
  }
  i = k;
}
// keep times monotonic
for (let i = 1; i < out.length; i++) if (out[i].start < out[i - 1].start) out[i].start = out[i - 1].start;

const matched = map.filter((x) => x >= 0).length;
fs.writeFileSync(`public/reel${N}/words.json`, JSON.stringify(out, null, 1));
console.log(`matched ${matched}/${out.length}, whisper words ${hw.length}, duration ${j.duration}s`);
console.log(out.map((w, i) => `${i}:${w.text}@${w.start.toFixed(2)}${w.interp ? "*" : w.pass2 ? "+" : ""}`).join("  "));
