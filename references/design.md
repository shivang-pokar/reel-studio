# Scenes, preview, design QA

## Building a reel component
1. Copy `src/reels/ReelExample.tsx` → `src/reels/Reel<N>.tsx`, rename the export, and add it to `src/reels/index.ts`. The composition name must match `composition` in `reels/index.json` (`Reel<N>`).
2. Print the word list with indices to plan the timing:
   ```bash
   node -e 'const w=require("./public/reel<N>/words.json");console.log(w.map((x,i)=>i+":"+x.text+"@"+x.start.toFixed(2)).join("  "))'
   ```
3. `CollageReel` (src/collage.tsx) takes `beats`: `{ at: <word index>, el: <hero/>, source?: "domain/path" }`. Plan **a new hero visual every 1–2 s** (10–20 beats in a 35 s reel). `idx("Sentry")` finds a word index by text (robust to re-voicing; throws if missing), `f(i)` gives its frame for reveals inside a hero (`<Pop at={f(i)}>`, `Stamp`, `Marker`, `HandNote`).
4. Also pass `chapters` (label top-left + blob colour), `keys` (word indices that get the yellow marker swipe in the headline), `red` (e.g. "Catch"), `wipeAt` (dot wipe into the catch) and `cues` for pops/markers/dings (sounds in `public/sfx/`). The headline builds itself from the voice, one sentence at a time; override with `groups` if a line runs past 3 rows.
5. The older "canvas" look (`CanvasReel` in src/canvas.tsx: one dotted canvas with camera glides and a caption bubble) is still there if a creator prefers it.

## House style
- **Collage:** paper + dot grid; a 90 px headline that builds word by word (it is the caption, so keep sentences short: ≤ 3 lines); a yellow marker swipe under 1–2 key words per line; a soft colour blob behind the hero that changes per chapter; tilted white cards with tape and a 12 px hard shadow; red rubber `Stamp`s (FREE, FIXED); the avatar as a white-outlined sticker bottom-right that bounces on every beat. Nunito 800/900; Caveat for handwritten notes. Colours come from `channel.json`.
- **First frame: the hook line big plus ONE strong visual.** No small cards or small text in the first 2 s.
- Heroes are big and simple: one logo, one number, one phone, one alert. If it needs reading, it's too small.
- Hand-drawn emphasis: `Marker` (circle with `roughEllipse`, underline, cross-out) and `HandNote` on the exact word that's spoken.
- **Real logos** (simple-icons `Brand`, or `<Img src={staticFile("logos/x.png")}>`), and Lucide line icons for everything else. **No emoji** on screen.
- **Every fact shows its source** (`<Source text="domain/path" />`).
- Safe zone: headline y 160–470; hero band y 470–1190, ≤ 900 px wide; source line at y 1430. The avatar sticker covers the bottom-right from y 1200, and the Instagram UI covers the bottom and right edge.
- No "Part N" on screen (leave `series` off).
- End: the last beats are the comment question (a "comment karo" pill) and the share line (send icon).

## First-3-seconds check (before the preview)
Render stills at 0.0 s, 1.0 s, 2.0 s and 2.9 s. Each one must have: ≤ 5 words visible, one big visual, no labels or small text, motion from frame 0, and the headline unchanged before 3 s. Show these 4 frames to the user with the preview.

## Preview gate
Render one still per scene (frame = a moment when that scene is complete), tile them into a sheet, and show the user **before** the full render:
```bash
npx remotion still src/index.ts Reel<N> out/reel-NN-slug/qa/f<frame>.png --frame=<frame>
ffmpeg -i f1.png -i f2.png … -filter_complex "hstack=<k>,scale=3780:-1" out/reel-NN-slug/reel<N>-preview.png
```
(Add `--port=3417` if port 3000 is busy.)

## Design QA (on the preview AND after the full render)
Look at every scene at full size, like a designer:
- Nothing overlaps: handwritten notes clear of card edges and pills, markers centred on their target.
- Lines and connectors meet their shapes; rows use equal columns; chips in a row share a height.
- Text doesn't wrap awkwardly (no lone last word: use ` ` between the words that must stay together).
- Icons match their meaning (send icon for "bhejo", bookmark for "save").
- Card copy reads as complete phrases.
- **No empty box waiting > 1 s for its content.** Show a placeholder message or reveal the box with its first item.
- Nothing hidden behind the avatar or the Instagram UI.
- A frame grabbed mid-fade proves nothing; re-grab a few frames later.
Fix, re-render the affected stills, and re-check. Tell the user what you checked and what you fixed.
