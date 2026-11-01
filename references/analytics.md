# Analytics (day 3 after posting, or whenever asked)

Everything lands in `docs/reel-learnings/learnings.md`. The next script is checked against it.

## 1 · Collect (built-in browser, the user logged in)
1. Open `https://www.instagram.com/<handle without @>/reels/` (handle from channel.json). If a "Log in" button shows, ask the user to log in in the browser pane. **Never type credentials.**
   Logged out, the grid still shows view counts, and hovering a tile shows likes and comments.
2. Reel links, newest first:
   ```js
   [...document.querySelectorAll('a[href*="/reel/"]')].map(a => a.getAttribute('href'))
   ```
3. For each reel, navigate to it, then run:
   ```js
   await new Promise(r => setTimeout(r, 2500));
   [...document.querySelectorAll('[role=button],button,a')].find(e => e.innerText.trim() === 'View Insights')?.click();
   await new Promise(r => setTimeout(r, 4000));
   location.href + ' || ' + document.body.innerText.replace(/\n+/g, ' | ').slice(0, 900)
   ```
   This gives you `/insights/media/<id>/` plus Views, Followers %, Non-followers %, Viewers, Likes, Comments, Saves, Shares, Follows. If the text shows the caption instead, navigate straight to the `/insights/media/<id>/` URL and read again.
4. Comments: on the reel page, read `document.querySelector('main').innerText` after the hashtags. Note topic requests, complaints and possible leads.
5. Age: the reel page shows "9 h" / "5 d". **Don't judge a reel under 3 days old as final.**
6. **App-only numbers** (web doesn't show them): ask the user for **skip rate**, **average watch time** and where the retention graph drops (Instagram app → reel → Insights).

## 2 · Compute
Save % = saves ÷ views × 100 · Share % = shares ÷ views × 100. Add length (`ffprobe`), hook (first sentence of the caption) and the topic's founder stage.

## 3 · Diagnose with this table, not guesses
| Signal | Problem |
|---|---|
| Skip rate above 50% | Hook / first frame |
| Skip fine, views low, Save % + Share % low | Topic not useful to this audience |
| Save % + Share % good, views low | Topic breadth or length (too few full watches) |
| Retention drops at one point | That scene: cut it |
| 0 comments | No question at the end |

Compare against the reel named in the learnings file's Experiments table.
**When new data contradicts an earlier conclusion, rewrite the earlier text.** The file must never contradict itself (this happened once: "the hook failed" was disproved by equal skip rates).

## 4 · Update the learnings file
Scoreboard row (`_pending_` for unknowns), "Last updated" + follower count, new evidence-backed points in sections 2–3, the Experiments result, a per-reel note (newest first), and any newly proven rule in the checklist. Never invent posting dates.
Then `node <skill>/scripts/status.mjs <N> status=analysed`.

## 5 · Report
A short table (views, Save %, Share %, follows, skip rate), 3–5 plain findings, what changes for the next reel, and what's still pending.
