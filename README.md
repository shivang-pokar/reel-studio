# Reel Studio: a Claude Code skill

Makes Instagram reels with an AI voice, a talking avatar of your character, a big word-by-word headline and a new animated visual every 1–2 seconds (the "Collage" look: paper, taped cards, marker highlights, stamps). It also keeps your reel folders organised and learns from your analytics.

It now includes everything from [instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill) by Jake Schincariol (MIT): 26 hook formulas, a hook scorer, a beat-sheet timer, a caption linter, a humanizer, a viral swipe-file ranker, plus guides for carousels, stories, profile, weekly plan, comments, replies, DMs, repurposing and content audits. One skill, one install. It never posts for you.

## Install
1. Clone it into your Claude Code skills folder:
   ```bash
   git clone https://github.com/shivang-pokar/reel-studio ~/.claude/skills/reel-studio
   ```
   (Or use `<your project>/.claude/skills/reel-studio` to install it for one project only. No git? Click **Code → Download ZIP** and unzip it there as `reel-studio/`.)
2. Open Claude Code in an empty folder and say: **"set up reel studio"**.

To update later: `git -C ~/.claude/skills/reel-studio pull`.

## You need
- Node 20+, ffmpeg, python3 (Claude checks and asks before installing).
- Your own **OpenAI API key**. You paste it into `.env` yourself; never share it in chat.
- Your avatar: a half-body PNG with a transparent background.

## Then just say
- "new reel about <topic>": research, then a script for you to approve
- "build reel 3": voice, captions, scenes, then a preview for you to approve, then the final video, cover and caption
- "reel status": every reel and where it's at
- "check analytics": Instagram Insights → lessons for the next reel
- "find viral reels in my niche", "audit my content", "write the caption", "carousel about X", "plan my week", "reply to these comments", "humanize this"

## What's inside
- `SKILL.md`: the full workflow Claude follows, with 🛑 approval gates (topic, script, preview, final listen).
- `scripts/`: setup, new reel, script check, AI voice (3 takes, auto-scored), word-timed captions, loudness for the avatar's mouth, QA frames, status.
- `starter/`: the Remotion project the setup copies (Collage look in `src/collage.tsx`, template reel in `src/reels/ReelExample.tsx`).
- `references/`: script rules, hooks, design + QA checklist, posting, caption, analytics, audit, viral research, carousel, story, profile, plan, comment, reply, DM, repurpose, humanizer.
- `tools/`: offline Python tools (hook scorer, beat sheet, caption lint, humanizer, detector, swipe ranker) and their data files.

Where the two skills disagreed, the merged rule is the one backed by real reel data: 30–38 s (not 15–45), our Hinglish-aware hook rubric decides (the English hook scorer only filters out weak hooks), and max 5 hashtags.
- `templates/`: `channel.json` (your handle, voice, avatar, colours, hashtags), learnings file, example script.

Costs: you pay OpenAI for the voice and transcription on your own key. Everything else runs on your machine.
