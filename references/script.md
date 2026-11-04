# Research + script

## Research (before writing a word)
- Fill `docs/reel-NN-slug-research/research.md` (created by `new-reel.mjs`).
- **Every number comes from an official page** (pricing page, docs, GitHub). Keep the URL; it goes on screen as `source: domain/path` and into the post caption.
- After writing the script, **fetch every official page again** and check each number and claim, word for word. Watch for wording traps (e.g. "per outcome" ≠ "per solved chat"; a quota with no "/month" on the page). If the page is unclear, make the line vaguer instead of guessing.
- Find the honest **catch**: what the free option doesn't give you.
- Note which logos exist in `simple-icons` (`ls node_modules/simple-icons/icons/<name>.svg`). Ask the user for the missing ones; they go in `public/logos/`.

## Topic test (from docs/reel-learnings/learnings.md)
"Would someone who hasn't launched yet need this today?" Post-launch topics get reframed around a builder's problem, or dropped. One idea per reel.

## Audience match
The topic must be for the audience Instagram already shows the channel to (see channel.json → audience). A topic for a *different* audience gets tested on your usual viewers first, and they skip it. A "how I make reels" reel on a founder channel got 61% skip. Comment requests are signals, not proof: two comments ≠ demand.

## Hook (the first 3 s decide reach)
- **About the viewer, never about you.** "Tumhara app kal kitni baar crash hua?" ✅ · "Meri reel pe 32k views" ❌ (61% skip). `check-script` fails a hook with "main/meri/my" and no "tum/you".
- ≤ 8–10 words, with a number, a tool name, money or "free". No jargon.
- **On screen in the first 3 s: ≤ 5 words** and no extra labels. Don't replace the headline before 3 s.
- Write **3 hook options** with different formulas, score each with the rubric below, and show all 3 to the user. They pick; it needs 9+ and no rule broken.

| Score 0–2 each | 0 | 1 | 2 |
|---|---|---|---|
| Viewer-first | about us | neutral | "tum / you" + their stake |
| Concrete | vague | a tool *or* a number | a number / money **and** a known tool or situation |
| Instant | needs the 2nd sentence | clear by ~2 s | clear from the first 3–4 words |
| Tight | > 10 words or jargon | 9–10 words | ≤ 8 plain words |
| Visual proof | text / small card | a generic visual | one big visual that *is* the hook, moving at frame 0 |

**Tools:** run `python3 <skill>/tools/hookscore.py hooks.txt` first and drop any hook with a dealbreaker (greeting, preamble, "stop scrolling", nothing concrete). Ignore its 0–100 ranking between decent hooks: it is English-tuned and in its author's own test it picked winners at coin-flip level. Our rubric decides.
- **The payoff is visible in the first 2 s**, in the voice AND on screen: free, a number, or a tool logo. A bare question ("App bana liya? Ab live kahan karoge?") had no payoff and got 76% skip.
- Speak to the whole audience, not one stage of it ("App bana liya?" shuts out everyone who hasn't).

More formulas with examples and how each gets ruined: `<skill>/tools/hooks.json` (The Statistic, Cost Confession, Head To Head, Cold Open Demo, The Receipt…). Our own: their pain + a number ("Tumhara app kal kitni baar crash hua?") · money saved ("$299 wala tool, free mein") · stop doing X ("Login khud mat banao") · time saved ("2 hafte ka kaam, 10 minute mein") · hidden cost ("Free hai… jab tak ye bill nahi aata") · before you choose ("Razorpay lene se pehle ye dekho").

## One change at a time
Change only one of topic type · look · hook style · CTA per reel, and write in the learnings file's Experiments table which one you changed. Change three at once and you can't learn which one hurt.

## Story shape (30–38 s, at most 4 scenes)
1. **Hook**: see above.
2. **Tool + free limit** within the first 5 s. Then the second option or the big number.
3. **The catch**, one line.
4. **End:** a comment question, then a share line ("Us dost ko bhejo jo…").

**Loop:** end on a word from the hook if it fits naturally; `beats.py` checks it. A replay is free reach.

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
