---
name: reel-studio
description: End-to-end Instagram reel studio for a faceless "avatar + facts" channel. Sets up the project, picks and researches topics, writes and checks the script, makes the AI voice (OpenAI gpt-audio), word-timed captions and a talking avatar, animates scenes in Remotion, runs design QA, writes the caption, title and hashtags, keeps every reel's folders and status organised, and checks Instagram analytics to improve the next reel. Use for "set up reel studio", "new reel about X", "build reel N", "reel status", "check analytics" / "day 3 check".
---

# Reel studio

One skill for the whole loop: **setup → idea → research → script → voice → captions → scenes → preview → render → post → analytics → learnings → next idea.**
The human decides (topic, script, preview, final listen, posting). You do everything else and stop at each 🛑 gate.

`<skill>` below = this skill's folder. Run every script from the **project root** (the folder with `channel.json`).

## Commands the user will say
| User says | Do |
|---|---|
| "set up reel studio" | §0 Setup |
| "next reel ideas" / "what should we make" | §1 Idea |
| "new reel about X" | §1 → §2 → 🛑 script gate |
| "build reel N" (script approved) | §3 → 🛑 preview gate → §4 |
| "reel status" | `node <skill>/scripts/status.mjs` |
| "check analytics" / "day 3 check" | `references/analytics.md` |

## Project layout (created by the scripts; keep to it)
```
channel.json                       # who the creator is: handle, voice, avatar, colours, hashtags, targets
.env                               # OPENAI_API_KEY (the user pastes it; never read it aloud, print or commit it)
reels/index.json                   # registry: n, slug, title, stage, status, paths, posted, url
reels/<N>/script.json              # hint + voice + caption (1:1 tokens)
reels/<N>/takes/                   # voice takes, transcripts, scores.json
public/avatar.png · logos/ · sfx/  # creator assets
public/reel<N>/                    # voice.wav, words.json, loudness.json
src/reels/Reel<N>.tsx              # the reel's scenes (registered in src/reels/index.ts)
docs/reel-NN-slug-research/        # research.md with official sources
docs/reel-learnings/learnings.md   # scoreboard, lessons, topic test, checklist (read before every script)
out/reel-NN-slug/                  # reel<N>.mp4, -cover.png, -preview.png, -framesheet.png, -post.md, qa/
out/samples/<name>/                # experiments only
```
Status flow in the registry: `research → script → approved → voiced → preview → rendered → posted → analysed`. Update it with `status.mjs` at each step.

## §0 · Setup (once per creator)
1. Check: Node 20+, `ffmpeg`, `python3`. Ask before installing anything.
2. `node <skill>/scripts/init.mjs`, then `npm install`. It copies the Remotion starter, `channel.json`, the learnings file, `.gitignore`, and an empty `.env`. It never overwrites existing files.
3. Ask the user to paste their OpenAI key into `.env` **themselves**.
4. Fill `channel.json` with the user: handle, about, audience, language (`whisper`: "hi" for Hinglish, "en" for English), a **voice persona** (city/region + vibe; keep the "read exactly, word for word" sentence), brand colours (taken from the avatar), hashtags, and target length.
5. **Avatar:** a half-body PNG with a transparent background → `public/avatar.png`. Open it, set `avatar.width/height` in pixels, find the mouth centre and width, and pick skin, lip and inside colours. Render one still with the avatar and check that the mouth overlay sits on the mouth; adjust until it does.
6. Logos the reels will need → `public/logos/` (ask the user; don't download brand assets without asking).

## §1 · Idea
- Read `docs/reel-learnings/learnings.md` first: the topic test and the experiments.
- **Topic gate (mandatory):** find outside proof before offering anything. Pick 5–8 peer accounts in the channel's niche, list their recent reels with views, and flag outliers (≥ 2× that account's median). Score each candidate 0–2 on day-1 need, outside proof, audience match, our angle and our own data; show the top 3 (≥ 8/10, no 0) with the evidence next to each score. The user picks.
- Comments on the channel's own reels are a tiebreaker (+1 at most), never the reason. Two comments asking for "how I make reels" produced a 61% skip reel.
- Once picked: `node <skill>/scripts/new-reel.mjs <slug> "<working title>" <pre-launch|launch|post-launch>`. This creates every folder and the registry entry.

## §2 · Research + script → 🛑 gate
**Hook gate (mandatory):** write 3 hooks with different formulas, score each 0–10 with the rubric in `references/script.md`, show all 3 to the user, and let them pick (≥ 9/10, no hard-rule break). No voice before that.
Follow `references/script.md`: official sources only, re-verify every number, then write `reels/<N>/script.json` in the story shape (30–38 s, ≤ 4 scenes, hook ≤ 8–10 words with a number/tool/money, comment question at the end).
Run `node <skill>/scripts/check-script.mjs <N>` and fix FAILs. Show the user the script + checklist result, and say which numbers you re-checked. `status.mjs <N> status=script`.
**🛑 Stop. Generate nothing until the user approves.** Then `status=approved`.

## §3 · Voice, captions, scenes → 🛑 preview gate
1. `node <skill>/scripts/voice.mjs <N>`: 3 takes, each transcribed and scored; the best take (≥ 0.85 with the ending present) → `public/reel<N>/voice.wav`. Re-run if none passes. Look at the transcripts for garbled brand names or numbers and tell the user which take you picked.
2. `node <skill>/scripts/captions.mjs <N>`, then `python3 <skill>/scripts/loudness.py <N>`. `status=voiced`.
3. Build `src/reels/Reel<N>.tsx` in the Collage look per `references/design.md` (copy `ReelExample.tsx`, which is written for `templates/example-script.json`; place beats with `idx("word")`; register it in `src/reels/index.ts`).
4. Render one still per scene, then do design QA and fix. Tile the stills into `reel<N>-preview.png` and send it to the user. `status=preview`.
**🛑 Wait for approval** (and for any missing logos).

## §4 · Render, QA, post files
1. Render the MP4 + `node <skill>/scripts/qa.mjs <N> <one second per scene…>`. Check the frame sheet and every QA frame (`references/design.md`). Fix and re-render until clean.
2. Cover + `reel<N>-post.md` (caption, sources, hashtags) per `references/posting.md`. `status=rendered`.
3. Send the user the MP4, cover and post file. List what you checked and fixed, and what they should listen for (brand names, numbers).
4. When they've posted: `status.mjs <N> status=posted posted=<date> url=<url>`, and note that analytics are due on day 3.

## §5 · Analytics → learnings
Follow `references/analytics.md` on day 3. Update `docs/reel-learnings/learnings.md`, `status=analysed`, and report what changes for the next reel.

## Rules
- Never show, log or commit the API key. Never type a password; the user logs in themselves.
- No number without an official source. When in doubt, make the line vaguer instead of guessing.
- Stop at the 🛑 gates. Show the user every deliverable (send files to them, don't just name paths).
- One reel = one folder set from `new-reel.mjs`. Don't scatter files; experiments go in `out/samples/`.
- Before calling anything done, do the design QA. "Rendered without errors" is not done.
