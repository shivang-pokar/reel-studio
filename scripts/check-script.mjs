// node <skill>/scripts/check-script.mjs <N>
// Mechanical checks on reels/<N>/script.json before the user sees it.
// Judgement checks (topic test, first frame, facts) stay with Claude — see references/script.md.
import fs from "node:fs";
import { loadChannel } from "./lib.mjs";

const N = process.argv[2];
if (!N) { console.error("usage: check-script.mjs <N>"); process.exit(1); }
const ch = loadChannel();
const s = JSON.parse(fs.readFileSync(`reels/${N}/script.json`, "utf8"));
const [minS, maxS] = ch.reel?.targetSeconds ?? [30, 38];
const wps = ch.reel?.wordsPerSecond ?? 3.0; // measured: ~3 words/s for fast Hinglish
const out = [];
const ok = (m) => out.push(`PASS  ${m}`), warn = (m) => out.push(`WARN  ${m}`), fail = (m) => out.push(`FAIL  ${m}`);

const v = (s.voice ?? "").split(/\s+/).filter(Boolean);
const c = (s.caption ?? "").split(/\s+/).filter(Boolean);
if (!c.length) fail("caption is empty");
v.length === c.length ? ok(`voice/caption tokens match (${c.length})`) : fail(`voice has ${v.length} tokens, caption has ${c.length}; they must match 1:1`);

const secs = c.length / wps;
if (secs > maxS) fail(`~${secs.toFixed(0)} s estimated; target ${minS}–${maxS} s. Cut ${Math.ceil((secs - maxS) * wps)} words`);
else if (secs < minS - 8) warn(`~${secs.toFixed(0)} s estimated, quite short`);
else ok(`~${secs.toFixed(0)} s estimated (target ${minS}–${maxS} s)`);

const hook = (s.caption.match(/^[^.?!]+[.?!]?/) ?? [""])[0].trim();
const hw = hook.split(/\s+/).filter(Boolean).length;
hw <= 10 ? ok(`hook ${hw} words: "${hook}"`) : warn(`hook is ${hw} words, aim for ≤ 8–10: "${hook}"`);
// the opening = first two sentences (~2–3 s spoken): Reel 1 said "Free" in its second sentence
const opening = (s.caption.match(/^[^.?!]+[.?!]?\s*[^.?!]*[.?!]?/) ?? [""])[0].trim();
const payoff = /\d|free|₹|\$|lakh|crore|%|rupa/i.test(opening);
payoff ? ok("opening has a number / money / 'free'") : warn("first two sentences have no number, money or 'free'; add one, or make sure a tool name is in it");
// the hook must be about the viewer: "Meri reel pe 32k views" passed every other check and got 61% skip
const self = /\b(main|mai|meri|mera|mere|maine|mujhe|hum|humne|hamara|i|i'm|my|me|we|our)\b/i.test(hook);
const viewer = /\b(tum|tumhara|tumhari|tumhare|tumhe|tumhein|aap|aapka|aapki|apna|apni|you|your)\b/i.test(opening);
if (self && !viewer) fail(`hook is about us, not the viewer ("${hook}"). Rewrite around "tum / tumhara" + their problem or gain`);
// no payoff and not about the viewer: "App bana liya? Ab live kahan karoge?" got 76% skip
else if (!viewer && !payoff) fail(`hook has no payoff (number, money, 'free') and doesn't speak to the viewer ("${opening}"). Say what they get in the first 2 s`);
else viewer ? ok("hook speaks to the viewer") : warn("hook doesn't address the viewer; make sure it names their problem or gain");

const sentences = s.caption.split(/(?<=[.?!])\s+/);
const tail = sentences.slice(-3).join(" ");
/\?/.test(tail) || /comment/i.test(tail) ? ok("ends with a comment question") : warn("no comment question in the last lines (e.g. 'Tum kaunsa use karte ho? Comment karo.')");
/\bpart\s*\d/i.test(s.caption) ? warn("mentions 'Part N'; keep the series in the post caption only") : ok("no 'Part N' in the voice-over");
s.hint ? ok("hint set (brand names for transcription)") : warn("hint is empty; list the brand names so transcription spells them right");

console.log(out.join("\n"));
process.exit(out.some((l) => l.startsWith("FAIL")) ? 1 : 0);
