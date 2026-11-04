---
name: reel-studio
description: End-to-end Instagram studio for a faceless "avatar + facts" channel. Sets up the project, finds outlier reels in the niche, picks and researches topics, writes 3 scored hooks and the script, makes the AI voice (OpenAI gpt-audio), word-timed captions and a talking avatar, animates scenes in Remotion, runs design QA, writes and lints the caption and hashtags, checks Instagram analytics and audits what worked. Also carousels, stories, profile score, weekly plan, comments, replies, DMs, repurposing and a humanizer. Never posts. Use for "set up reel studio", "new reel about X", "build reel N", "reel status", "check analytics" / "day 3 check", "find viral reels", "audit my content", "write the caption", "carousel", "stories", "fix my bio", "plan my week", "reply to these comments", "DM this person", "repurpose this", "humanize this".
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
| "audit my content" / "what's working" | `references/analytics.md` to collect, then `references/audit.md` |
| "find viral reels" / "what's working in my niche" | `references/viral.md` (feeds the §1 topic gate) |
| "write / check the caption" | `references/caption.md` + `tools/caption.py` |
| "carousel" · "stories" · "fix my bio" · "plan my week" | `references/carousel.md` · `story.md` · `profile.md` · `plan.md` |
| "reply to these comments" · "comment on this post" · "DM this person" | `references/reply.md` · `comment.md` · `dm.md` |
| "repurpose this video / podcast" | `references/repurpose.md` |
| "humanize this" / "does this sound like AI" | `references/humanizer.md` + `tools/humanize.py`, `tools/detect.py` |

## Offline tools (`<skill>/tools/`, python3, no network, no dependencies)
| Tool | Use it for |
|---|---|
| `hookscore.py hooks.txt` | Weak-hook filter: catches greetings, preambles and hooks with nothing concrete. It can't pick winners and doesn't understand Hinglish "tum", so our rubric in `references/script.md` decides. |
| `beats.py script.txt --target 34` | Times the script before voicing: hook past 3 s, beats over 4 s, runs with no number or name, no loop back to the hook. Feed it the Roman `caption` line, one sentence per line. |
| `caption.py caption.txt --keywords "a,b"` | What the feed shows before "... more", hashtag cap, one ask, search terms, links that can't be clicked. |
| `humanize.py` / `detect.py` | Strip em dashes, stock phrases and invisible characters from captions, replies and DMs; score before/after. |
| `swipe.py captured.tsv` | Rank peer reels by multiple over each account's own median and name the hook formula. |
Data: `hooks.json` (26 hook formulas), `slop.json` (stock-phrase lexicon), `rubric.json` (profile score).

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
- **Topic gate (mandatory):** find outside proof before offering anything. Pick 5–8 peer accounts in the channel's niche, list their recent reels with views, and flag outliers (≥ 2× that account's median): follow `references/viral.md` and rank them with `tools/swipe.py`. Score each candidate 0–2 on day-1 need, outside proof, audience match, our angle and our own data; show the top 3 (≥ 8/10, no 0) with the evidence next to each score. The user picks.
- Comments on the channel's own reels are a tiebreaker (+1 at most), never the reason. Two comments asking for "how I make reels" produced a 61% skip reel.
- Once picked: `node <skill>/scripts/new-reel.mjs <slug> "<working title>" <pre-launch|launch|post-launch>`. This creates every folder and the registry entry.

## §2 · Research + script → 🛑 gate
**Hook gate (mandatory):** write 3 hooks with different formulas (ours in `references/script.md` + the 26 in `tools/hooks.json`), run `tools/hookscore.py` to throw out any with a dealbreaker, score the rest 0–10 with the rubric in `references/script.md`, show all 3 to the user, and let them pick (≥ 9/10, no hard-rule break). No voice before that.
Follow `references/script.md`: official sources only, re-verify every number, then write `reels/<N>/script.json` in the story shape (30–38 s, ≤ 4 scenes, hook ≤ 8–10 words with a number/tool/money, comment question at the end).
Run `node <skill>/scripts/check-script.mjs <N>` and fix FAILs, then `python3 <skill>/tools/beats.py` on the caption (one sentence per line) and fix its flags. Show the user the script + checklist result, and say which numbers you re-checked. `status.mjs <N> status=script`.
**🛑 Stop. Generate nothing until the user approves.** Then `status=approved`.

## §3 · Voice, captions, scenes → 🛑 preview gate
1. `node <skill>/scripts/voice.mjs <N>`: 3 takes, each transcribed and scored; the best take (≥ 0.85 with the ending present) → `public/reel<N>/voice.wav`. Re-run if none passes. Look at the transcripts for garbled brand names or numbers and tell the user which take you picked.
2. `node <skill>/scripts/captions.mjs <N>`, then `python3 <skill>/scripts/loudness.py <N>`. `status=voiced`.
3. Build `src/reels/Reel<N>.tsx` in the look set in `channel.json` → `look` (`canvas` or `collage`) per `references/design.md` (copy `ReelExample.tsx`, which is written for `templates/example-script.json`; place beats with `idx("word")`; register it in `src/reels/index.ts`).
4. Render one still per scene, then do design QA and fix. Tile the stills into `reel<N>-preview.png` and send it to the user. `status=preview`.
**🛑 Wait for approval** (and for any missing logos).

## §4 · Render, QA, post files
1. Render the MP4 + `node <skill>/scripts/qa.mjs <N> <one second per scene…>`. Check the frame sheet and every QA frame (`references/design.md`). Fix and re-render until clean.
2. Cover + `reel<N>-post.md` (caption, sources, hashtags) per `references/posting.md`; lint the caption with `tools/caption.py` and clean it with `tools/humanize.py`. `status=rendered`.
3. Send the user the MP4, cover and post file. List what you checked and fixed, and what they should listen for (brand names, numbers).
4. When they've posted: `status.mjs <N> status=posted posted=<date> url=<url>`, and note that analytics are due on day 3.

## §5 · Analytics → learnings
Follow `references/analytics.md` on day 3. Update `docs/reel-learnings/learnings.md`, `status=analysed`, and report what changes for the next reel.

## Rules
- Never show, log or commit the API key. Never type a password; the user logs in themselves.
- **Never post, comment, follow or DM for the user.** Everything ends as a copy-ready block; the user posts it. Reading the user's own Insights in a browser they logged into is fine; automated posting or scraping at volume breaks Instagram's terms.
- Never invent a metric, client or result. If a number is missing, write `{{your number}}` and flag it.
- No number without an official source. When in doubt, make the line vaguer instead of guessing.
- Stop at the 🛑 gates. Show the user every deliverable (send files to them, don't just name paths).
- One reel = one folder set from `new-reel.mjs`. Don't scatter files; experiments go in `out/samples/`.
- Before calling anything done, do the design QA. "Rendered without errors" is not done.
