// node <skill>/scripts/voice.mjs <N> [takes=3]
// Generates voice takes with OpenAI gpt-audio, checks each with gpt-4o-transcribe,
// scores against the script and copies the best complete take to public/reel<N>/voice.wav.
// Voice persona, model and voice name come from channel.json.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { loadEnv, loadChannel, score } from "./lib.mjs";

loadEnv();
const ch = loadChannel();
const N = process.argv[2];
if (!N) { console.error("usage: voice.mjs <N> [takes]"); process.exit(1); }
const TAKES = Number(process.argv[3] ?? 3);
const dir = `reels/${N}`;
const script = JSON.parse(fs.readFileSync(`${dir}/script.json`, "utf8"));
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error("OPENAI_API_KEY missing in .env"); process.exit(1); }
fs.mkdirSync(`${dir}/takes`, { recursive: true });

// VOICE_SYSTEM env overrides the persona for one-off samples (e.g. a different accent)
const SYSTEM = process.env.VOICE_SYSTEM ?? ch.voice.persona;

async function makeTake(i) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ch.voice.model ?? "gpt-audio",
      modalities: ["text", "audio"],
      audio: { voice: ch.voice.voice ?? "cedar", format: "wav" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Read this script aloud now, exactly as written, nothing before or after:\n\n${script.voice}` },
      ],
    }),
  });
  if (!res.ok) throw new Error(`take ${i}: ${res.status} ${await res.text()}`);
  const j = await res.json();
  const file = `${dir}/takes/take-${i}.wav`;
  fs.writeFileSync(file, Buffer.from(j.choices[0].message.audio.data, "base64"));
  return file;
}

async function transcribe(file) {
  const fd = new FormData();
  fd.append("file", new Blob([fs.readFileSync(file)]), path.basename(file));
  fd.append("model", "gpt-4o-transcribe");
  if (script.hint) fd.append("prompt", script.hint);
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST", headers: { Authorization: `Bearer ${KEY}` }, body: fd,
  });
  if (!res.ok) throw new Error(`transcribe: ${res.status} ${await res.text()}`);
  return (await res.json()).text;
}

function wavSeconds(file) {
  const b = fs.readFileSync(file);
  return (b.length - 44) / b.readUInt32LE(28);
}

const results = await Promise.all(
  Array.from({ length: TAKES }, async (_, k) => {
    const i = k + 1;
    const file = await makeTake(i);
    const text = await transcribe(file);
    const s = score(text, script);
    fs.writeFileSync(`${dir}/takes/take-${i}.txt`, text);
    return { take: i, file, seconds: +wavSeconds(file).toFixed(2), ...s, text };
  }),
);

results.sort((a, b) => b.score - a.score || b.tail - a.tail);
fs.writeFileSync(`${dir}/takes/scores.json`, JSON.stringify(results, null, 2));
for (const r of results)
  console.log(`take ${r.take}: score ${r.score.toFixed(3)} tail ${r.tail} ${r.seconds}s | ${r.text}`);

const best = results[0];
if (best.score < 0.85 || !best.tail) {
  console.error("No complete take passed (score >= 0.85 with the ending present). Re-run.");
  process.exit(2);
}
fs.mkdirSync(`public/reel${N}`, { recursive: true });
// loudness-normalise to ~-14 LUFS and rewrite a clean WAV header (gpt-audio streams a placeholder size)
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", best.file, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "pcm_s16le", `public/reel${N}/voice.wav`]);
console.log(`\nPicked take ${best.take} -> public/reel${N}/voice.wav`);
