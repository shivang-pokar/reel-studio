# Reel Studio

**One Claude Code skill for a faceless Instagram channel, from idea to analytics.**

You say "new reel about free hosting". Claude finds proof the topic works, writes 3 hooks for you to pick from, writes and fact-checks the script, makes the AI voice, word-timed captions and a talking avatar, animates the scenes in Remotion, checks the design, and hands you the MP4, cover and caption. Three days after you post, it reads your Insights and tells you why the reel did what it did.

It also writes the rest of your Instagram: captions, carousels, stories, profile fixes, a weekly plan, comment replies and DMs.

**It never posts for you.** Every step ends with something you approve and post yourself.

Built on [@techonomics.in](https://www.instagram.com/techonomics.in/) (Hinglish startup-tools reels, one 34k-view breakout), combined with [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill) by Jake Schincariol (MIT).

---

## Install

```bash
git clone https://github.com/shivang-pokar/reel-studio ~/.claude/skills/reel-studio
```

For one project only, clone it into `<your project>/.claude/skills/reel-studio` instead. No git? **Code → Download ZIP** and unzip it there as `reel-studio/`.

Then open Claude Code in an empty folder and say **"set up reel studio"**.

Update later with `git -C ~/.claude/skills/reel-studio pull`.

### You need
- Node 20+, ffmpeg, python3 (Claude checks and asks before installing anything)
- Your own **OpenAI API key** for the voice and transcription. You paste it into `.env` yourself; never paste it in chat.
- Your avatar: a half-body PNG with a transparent background

---

## What you say

| You say | What happens |
|---|---|
| **"set up reel studio"** | Creates the project, `channel.json` (handle, voice, avatar, colours, hashtags), `docs/voice.md` and the learnings file |
| **"next reel ideas"** | Finds outlier reels on 5–8 peer accounts, scores 3 topics with evidence, you pick |
| **"new reel about X"** | Research from official pages → 3 scored hooks → script → 🛑 you approve |
| **"build reel 3"** | Voice (3 takes, auto-scored) → captions → avatar → scenes → 🛑 preview → MP4, cover, caption |
| **"reel status"** | Every reel and the step it's at |
| **"check analytics"** / **"day 3 check"** | Reads your Instagram Insights, diagnoses hook vs topic vs length, updates the learnings |
| **"audit my content"** | Ranks every reel by how far it beat your own median, and finds what separates top from bottom |
| **"find viral reels in my niche"** | Swipe file of peer outliers with the hook formula each one used |
| **"write the caption"** | Caption with the first 125 characters checked, search phrases, max 5 hashtags |
| **"carousel about X"** · **"stories for today"** | Slide copy and 1080×1350 files · a story sequence with stickers |
| **"fix my bio"** | Profile scored out of 100, rewritten fix-first |
| **"plan my week"** | What to post, when, and who to engage with |
| **"reply to these comments"** · **"DM this person"** | Sorted replies · first message and two follow-ups |
| **"repurpose this video"** | One long video or podcast into a week of reels and carousels |
| **"humanize this"** | Strips em dashes, stock phrases and invisible characters, then scores the text |

---

## How a reel gets made

```
idea ──► topic gate ──► research ──► hook gate ──► script ──► 🛑 approve
          (peer outliers,   (official      (3 hooks,       (30–38 s,
           score ≥ 8/10)     pages only)    score ≥ 9/10)   ≤ 4 scenes)

voice ──► captions ──► avatar ──► scenes ──► 🛑 preview ──► render ──► QA ──► post files
(3 takes,   (word-timed)  (mouth moves   (collage or          (one still     (frame sheet,
 best wins)               with loudness)  canvas look)         per scene)     full-size frames)

posted ──► day 3: Insights ──► diagnosis ──► learnings.md ──► next idea
```

Every 🛑 is a stop: nothing is generated until you say yes.

---

## The rules it follows (learned from real reels)

| Rule | Why |
|---|---|
| **30–38 s, at most 4 scenes** | The 34k reel was 35 s. Reels at 46–53 s stalled at 1–2k. |
| **Hook about the viewer** ("Tumhara app…"), never about you | "Meri reel pe 32k views" got 63% skip. |
| **Payoff in the first 2 s**: free, a number, or a tool | "App bana liya? Ab live kahan karoge?" had none and got 76% skip and 207 views. |
| **≤ 5 words on screen in the first 3 s**, one big visual | A busy first frame loses people before the voice lands. |
| **Every number from an official page, source on screen** | Viewers check, and comments punish "half gyan". |
| **Topic a pre-launch builder needs today** | Day-1 topics (login) broke out; post-launch ones (support, onboarding) didn't. |
| **Comment question + share line at the end** | Reels without a question got 0 comments. |
| **One change per reel** (topic, look, hook style or CTA) | Change three at once and you can't tell what worked. |
| **Max 5 hashtags**, plus 1–2 search phrases in the caption | Instagram capped hashtags at 5 in Dec 2025; search terms matter more now. |

How to read your numbers:

| You see | It means |
|---|---|
| Skip rate above 50% | The hook or first frame. **Above 60% the reel dies** before the topic is tested. |
| Skip fine, low saves and shares | The topic isn't useful enough to this audience. |
| Good saves and shares, low views | Topic too narrow, or too long. |
| Every reel stuck at the same 1–2k | That's the first test pool. Only saves and shares from non-followers get you out. |
| Views fine, few follows | The profile, not the reel. |

---

## What's inside

```
reel-studio/
├── SKILL.md                 the workflow Claude follows, with the 🛑 gates
├── scripts/  (node)         setup, new reel, script check, AI voice, captions,
│                            avatar loudness, QA frames, status
├── tools/    (python3)      offline, no network, no dependencies
│   ├── hookscore.py         filters weak hooks (greetings, preambles, nothing concrete)
│   ├── beats.py             times the script: hook > 3 s, beats > 4 s, no loop
│   ├── caption.py           what the feed shows before "... more", hashtags, search terms
│   ├── humanize.py          strips AI tells from captions, replies and DMs
│   ├── detect.py            scores how human a text reads
│   ├── swipe.py             ranks peer reels by multiple over their own median
│   └── hooks.json · slop.json · rubric.json
├── references/              one guide per job
│   ├── script.md · hooks.md · design.md · posting.md · caption.md
│   ├── analytics.md · audit.md · viral.md
│   └── carousel.md · story.md · profile.md · plan.md · comment.md
│       reply.md · dm.md · repurpose.md · humanizer.md
├── starter/                 Remotion project: collage look, canvas look, avatar, example reel
└── templates/               channel.json, voice.md, learnings.md, script, post, research
```

Your project after setup:

```
channel.json                      who you are: handle, voice persona, avatar, colours, hashtags, look
docs/voice.md                     how you talk; every caption, reply and DM reads it
docs/reel-learnings/learnings.md  scoreboard, lessons, checklist (read before every script)
reels/<N>/script.json             the voice line + on-screen line, word for word
out/reel-NN-topic/                reelN.mp4, cover, preview, frame sheet, post.md
```

### Two looks
Set `"look"` in `channel.json`:
- **canvas**: dotted canvas, white cards with a navy outline and hard shadow, camera glides between them, avatar bottom-left with a speech bubble. The look of the 34k reel.
- **collage**: paper and dot grid, big word-by-word headline with marker swipes, taped cards, a new visual every 1–2 s, avatar as a sticker.

Both got the same reach in testing. Fix the hook and topic before changing the look.

---

## Where the two skills disagreed

Reel Studio and instagram-agent-skill overlapped. Where they disagreed, the rule backed by real reel data won:

| Topic | Kept | Instead of |
|---|---|---|
| Length | 30–38 s | 15–45 s |
| Picking a hook | Our rubric (viewer-first, concrete, instant, tight, visual proof), which reads Hinglish | `hookscore.py`'s ranking, which is English-tuned and picked winners at coin-flip level in its own test. It still runs as a weak-hook filter. |
| Script voice | AI voice, persona in `channel.json`, pace ~160 wpm | A script you shoot on camera |
| Hashtags | Max 5 | Three |
| Analytics | Reads Insights for you, plus hold at 3 s and outlier multiple | Paste your numbers in |
| Humanizer | Captions, replies, DMs only | Also scripts (it would break the Devanagari voice line) |

---

## Costs and privacy
- You pay OpenAI on your own key for the voice (`gpt-audio`, 3 takes) and transcription (`gpt-4o-transcribe`, `whisper-1`). One reel is a few short audio calls. Cut takes from 3 to 1–2 to spend less.
- Everything else runs on your machine. The Python tools make no network calls.
- Analytics are read from your own logged-in browser. Claude never types your password and never posts, comments, follows or DMs.

## License
MIT. `tools/`, the adapted guides and `templates/voice.md` come from [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill), © 2026 Jake Schincariol, MIT. See `LICENSE`.
