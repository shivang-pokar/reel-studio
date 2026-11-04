# Deliverables, caption, title, hashtags

Everything for reel N goes in `out/reel-NN-slug/` (from `reels/index.json` → `out`):

| File | How |
|---|---|
| `reel<N>.mp4` | `npx remotion render src/index.ts Reel<N> out/reel-NN-slug/reel<N>.mp4` |
| `reel<N>-framesheet.png` | `node <skill>/scripts/qa.mjs <N> <sec> <sec> …` (also writes full-size QA frames to `qa/`) |
| `reel<N>-cover.png` | `npx remotion still src/index.ts Reel<N> out/…/reel<N>-cover.png --frame=<f>`. Pick the frame with the boldest number or hook line, fully revealed and not mid-glide |
| `reel<N>-preview.png` | The scene sheet from the preview gate |
| `reel<N>-post.md` | From `templates/post.md` |

Experiments (other voices, styles) go in `out/samples/<name>/`, never in a reel folder.

## Title (registry + cover)
- `reels/index.json` → `title`: a short working title, e.g. "Error tracking: Sentry vs PostHog".
- The on-screen hook *is* the title viewers see. Don't add a separate title card.

## Caption (`reel<N>-post.md`)
- **Line 1 = the same promise as the first frame** (it shows under the video before "more").
- Then: tool → free limit, one per line · the catch · **the comment question** · the share line · `Sources: domain/path · …`.
- The series name (e.g. "Startup Stack · Part 6") is fine in the caption, not on screen.
- Use the `language.style` from channel.json (Roman Hinglish for Hinglish channels). A few functional emoji as bullets are OK in the caption, but not in the video.
- Every number in the caption must match the research doc.

## Caption lint (before delivering)
```bash
python3 <skill>/tools/caption.py out/reel-NN-slug/caption.txt --keywords "<2 phrases people would search>"
```
Fix every FAIL: the first line must fit whole before "... more", and the caption should contain 1–2 phrases people actually type into search (e.g. "free hosting"), which matter more than hashtags now. Links in a caption aren't clickable, so sources are written as plain `domain/path` text (that's fine; it's for trust, not clicks). Then run `tools/humanize.py --report` and keep only the changes that don't touch numbers or brand names. Full guide: `references/caption.md`.

## Hashtags
Exactly `hashtags.count` (default 5; Instagram's cap is 5 per post since 18 Dec 2025): everything in `hashtags.always`, 1–2 broad tags from `pool` (#ai, #aitools), and the rest topic-specific (#customersupport, #saas…).

## After posting
`node <skill>/scripts/status.mjs <N> status=posted posted=<YYYY-MM-DD> url=<reel url>`. Remind the user that the day-3 analytics check is due on posted + 3 days.
