import { Composition, staticFile } from "remotion";
import { ch, ReelProps, Word } from "./theme";
import { reels } from "./reels";
import index from "../reels/index.json";

// One composition per reel in reels/index.json that has a component in src/reels/index.ts.
// Voice timings + loudness are loaded from public/reel<N>/ at render time, so nothing is hard-coded here.
const entries = (index as { n: number; composition: string }[]).filter((r) => reels[r.composition]);

export const Root: React.FC = () => (
  <>
    {entries.map((r) => (
      <Composition
        key={r.composition}
        id={r.composition}
        component={reels[r.composition]}
        width={ch.reel.width}
        height={ch.reel.height}
        fps={ch.reel.fps}
        durationInFrames={30}
        defaultProps={{ reel: r.n, words: [] as Word[], loudness: [] as number[] } satisfies ReelProps}
        calculateMetadata={async ({ props }) => {
          const words: Word[] = await (await fetch(staticFile(`reel${props.reel}/words.json`))).json();
          const loudness: number[] = await (await fetch(staticFile(`reel${props.reel}/loudness.json`))).json();
          return { props: { ...props, words, loudness }, durationInFrames: Math.ceil((words[words.length - 1].end + 1.2) * ch.reel.fps) };
        }}
      />
    ))}
  </>
);
