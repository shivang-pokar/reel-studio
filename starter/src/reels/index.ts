import { ReelExample } from "./ReelExample";
import { ReelProps } from "../theme";

// composition name (as in reels/index.json → "composition") → component. Add one line per reel.
export const reels: Record<string, React.FC<ReelProps>> = {
  ReelExample,
};
