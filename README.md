# Reel Studio: a Claude Code skill

Makes Instagram reels with an AI voice, a talking avatar of your character, a big word-by-word headline and a new animated visual every 1–2 seconds (the "Collage" look: paper, taped cards, marker highlights, stamps). It also keeps your reel folders organised and learns from your analytics.

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

## What's inside
- `SKILL.md`: the full workflow Claude follows, with 🛑 approval gates (topic, script, preview, final listen).
- `scripts/`: setup, new reel, script check, AI voice (3 takes, auto-scored), word-timed captions, loudness for the avatar's mouth, QA frames, status.
- `starter/`: the Remotion project the setup copies (Collage look in `src/collage.tsx`, template reel in `src/reels/ReelExample.tsx`).
- `references/`: script rules, design + QA checklist, posting, analytics.
- `templates/`: `channel.json` (your handle, voice, avatar, colours, hashtags), learnings file, example script.

Costs: you pay OpenAI for the voice and transcription on your own key. Everything else runs on your machine.
