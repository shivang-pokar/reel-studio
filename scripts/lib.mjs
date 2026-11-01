import fs from "node:fs";

export function loadEnv() {
  if (!fs.existsSync(".env")) return;
  for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const DEV = {
  "अ":"a","आ":"a","इ":"i","ई":"i","उ":"u","ऊ":"u","ए":"e","ऐ":"e","ओ":"o","औ":"o","ऑ":"o","ऋ":"ri",
  "क":"k","ख":"k","ग":"g","घ":"g","ङ":"n","च":"c","छ":"c","ज":"j","झ":"j","ञ":"n",
  "ट":"t","ठ":"t","ड":"d","ढ":"d","ड़":"r","ढ़":"r","ण":"n","त":"t","थ":"t","द":"d","ध":"d","न":"n",
  "प":"p","फ":"f","फ़":"f","ब":"b","भ":"b","म":"m","य":"y","र":"r","ल":"l","व":"v","श":"s","ष":"s","स":"s","ह":"h",
  "क़":"k","ख़":"k","ग़":"g","ज़":"j","ा":"a","ि":"i","ी":"i","ु":"u","ू":"u","े":"e","ै":"e","ो":"o","ौ":"o","ॉ":"o",
  "ं":"n","ँ":"n","ः":"","्":"","़":"","0":"0","1":"1","2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9",
};

// Phonetic key for a word, so Devanagari and Roman spellings of the same sound compare equal-ish.
export function norm(w) {
  let s = w.normalize("NFC").toLowerCase().replace(/[।.,:;!?"'“”‘’()\-–—]/g, "");
  s = [...s].map((ch) => (ch in DEV ? DEV[ch] : ch)).join("");
  s = s
    .replace(/tch/g, "ch").replace(/ph/g, "f").replace(/(kh|gh|th|dh|bh|ch|jh)/g, (m) => m[0])
    .replace(/sh/g, "s").replace(/w/g, "v").replace(/z/g, "j").replace(/q/g, "k").replace(/x/g, "ks")
    .replace(/c(?=[eiy])/g, "s").replace(/ck/g, "k").replace(/c/g, "k").replace(/y/g, "i")
    .replace(/[^a-z0-9]/g, "");
  // consonant skeleton keeps the first letter, drops vowels, collapses repeats
  const first = s[0] ?? "";
  return (first + s.slice(1).replace(/[aeiou]/g, "")).replace(/(.)\1+/g, "$1");
}

export function tokens(text) {
  return text.replace(/(\d),(\d)/g, "$1$2").split(/\s+/).map(norm).filter(Boolean);
}

// Levenshtein similarity 0..1
export function sim(a, b) {
  if (a === b) return 1;
  const m = a.length, n = b.length;
  if (!m || !n) return 0;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

// Monotonic DP alignment of ref tokens to hyp tokens. Returns map refIndex -> hypIndex (or -1).
// Whisper often splits one word in two ("फायर बेस" for Firebase), so a ref token may also match two
// hyp tokens joined: map[i] is then the first of them and map.end[i] the second.
export function align(ref, hyp, thresh = 0.5) {
  const R = ref.length, H = hyp.length, GAP = -0.4;
  const S = Array.from({ length: R + 1 }, () => new Float64Array(H + 1));
  const B = Array.from({ length: R + 1 }, () => new Int8Array(H + 1));
  for (let i = 1; i <= R; i++) { S[i][0] = i * GAP; B[i][0] = 1; }
  for (let j = 1; j <= H; j++) { S[0][j] = j * GAP; B[0][j] = 2; }
  for (let i = 1; i <= R; i++)
    for (let j = 1; j <= H; j++) {
      const s = sim(ref[i - 1], hyp[j - 1]);
      const diag = S[i - 1][j - 1] + (s >= thresh ? s : -0.6);
      const up = S[i - 1][j] + GAP, left = S[i][j - 1] + GAP;
      // merge: two hyp tokens make up one ref token; must beat matching just the second one
      const s2 = j > 1 ? sim(ref[i - 1], hyp[j - 2] + hyp[j - 1]) : 0;
      const merge = j > 1 && s2 >= thresh && s2 > s ? S[i - 1][j - 2] + s2 : -Infinity;
      if (merge >= diag && merge >= up && merge >= left) { S[i][j] = merge; B[i][j] = 3; }
      else if (diag >= up && diag >= left) { S[i][j] = diag; B[i][j] = 0; }
      else if (up >= left) { S[i][j] = up; B[i][j] = 1; }
      else { S[i][j] = left; B[i][j] = 2; }
    }
  const map = new Array(R).fill(-1);
  map.end = new Array(R).fill(-1);
  let i = R, j = H;
  while (i > 0 || j > 0) {
    const b = i > 0 && j > 0 ? B[i][j] : i > 0 ? 1 : 2;
    if (b === 3) { map[i - 1] = j - 2; map.end[i - 1] = j - 1; i--; j -= 2; }
    else if (b === 0) { if (sim(ref[i - 1], hyp[j - 1]) >= thresh) map[i - 1] = map.end[i - 1] = j - 1; i--; j--; }
    else if (b === 1) i--;
    else j--;
  }
  return map;
}

// Score a transcript against the script: fraction of script words found (best of Devanagari / Roman),
// plus whether the last 4 words are present (complete take).
export function score(text, script) {
  const hyp = tokens(text);
  let best = { score: 0, tail: false };
  for (const refText of [script.voice, script.caption]) {
    const ref = tokens(refText);
    const map = align(ref, hyp);
    const hit = map.filter((x) => x >= 0).length;
    const tail = map.slice(-4).filter((x) => x >= 0).length >= 2;
    const extra = Math.max(0, hyp.length - ref.length) / ref.length;
    const sc = hit / ref.length - extra * 0.5;
    if (sc > best.score) best = { score: sc, tail, ref: refText === script.voice ? "devanagari" : "roman" };
  }
  return best;
}

// channel.json in the project root holds everything that differs per creator (voice, language, avatar, colours…)
export function loadChannel() {
  if (!fs.existsSync("channel.json")) {
    console.error("channel.json not found. Run the reel-studio setup first (node <skill>/scripts/init.mjs).");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync("channel.json", "utf8"));
}

export const pad = (n) => String(n).padStart(2, "0");

// reels/index.json is the registry: one entry per reel with its folders, title and status
export function loadIndex() {
  return fs.existsSync("reels/index.json") ? JSON.parse(fs.readFileSync("reels/index.json", "utf8")) : [];
}
export function saveIndex(list) {
  fs.mkdirSync("reels", { recursive: true });
  fs.writeFileSync("reels/index.json", JSON.stringify(list, null, 2) + "\n");
}
