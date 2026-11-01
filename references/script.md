# Research + script

## Research (before writing a word)
- Fill `docs/reel-NN-slug-research/research.md` (created by `new-reel.mjs`).
- **Every number comes from an official page** (pricing page, docs, GitHub). Keep the URL; it goes on screen as `source: domain/path` and into the post caption.
- After writing the script, **fetch every official page again** and check each number and claim, word for word. Watch for wording traps (e.g. "per outcome" ≠ "per solved chat"; a quota with no "/month" on the page). If the page is unclear, make the line vaguer instead of guessing.
- Find the honest **catch**: what the free option doesn't give you.
- Note which logos exist in `simple-icons` (`ls node_modules/simple-icons/icons/<name>.svg`). Ask the user for the missing ones; they go in `public/logos/`.

## Topic test (from docs/reel-learnings/learnings.md)
"Would someone who hasn't launched yet need this today?" Post-launch topics get reframed around a builder's problem, or dropped. One idea per reel.

## Story shape (30–38 s, at most 4 scenes)
1. **Hook** (≤ 8–10 words): a number, a tool name, money or "free", in the viewer's own words. No jargon.
2. **Tool + free limit** within the first 5 s. Then the second option or the big number.
3. **The catch**, one line.
4. **End:** a comment question, then a share line ("Us dost ko bhejo jo…").

No "Part N" in the voice-over. No warm-up sentences: commenters punish "ghuma kar gyan".

## script.json
```json
{
  "hint":    "Brand names for transcription: Sentry, PostHog, Firebase Crashlytics…",
  "voice":   "तुम्हारा app कल कितनी बार crash हुआ? …",
  "caption": "Tumhara app kal kitni baar crash hua? …"
}
```
- `voice` is what the AI reads. For Hinglish: Hindi words in **Devanagari**, English words in **English**, so pronunciation comes out right. For an English-only channel, `voice` = `caption`.
- `caption` is what shows on screen (Roman Hinglish, or plain English).
- **Same words, 1:1, token for token.** `check-script.mjs` fails if the counts differ.
- Keep business and tech terms in English (customer, gateway, International, subscription), not translated.
- Numbers: write them the way they should be *said* in `voice` (e.g. "5,000", "1 लाख"), and the same way in `caption`.

## Gate
Run `node <skill>/scripts/check-script.mjs <N>`. Fix every FAIL. Fix WARNs unless there's a reason not to, and tell the user the reason. Then show the user the script **and** the checklist result. Generate no audio until they approve.
