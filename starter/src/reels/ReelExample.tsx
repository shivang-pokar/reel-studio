import { MessageCircle, Send, TriangleAlert } from "lucide-react";
import { siFirebase } from "simple-icons";
import { C, ReelProps } from "../theme";
import { Brand, HandNote, Marker, roughEllipse } from "../kit";
import { BigNumber, Card, CollageReel, Pop, useWords } from "../collage";

// TEMPLATE — copy to src/reels/Reel<N>.tsx, rename the export, and register it in src/reels/index.ts.
// Shape that tested best: hook (one big line + one strong visual) → tool + number → catch → comment question.
// Beats start on caption word indices: idx("word") finds one by its caption text (robust to re-voicing).
// Written for the sample script in templates/example-script.json; swap the words for your own script.
// A new hero every 1–2 s: 10–20 beats in a 35 s reel. Heroes sit in a 900×720 band (y 470–1190).

const LogoRow: React.FC<{ icon: { path: string; hex: string }; name: string; size?: number }> = ({ icon, name, size = 64 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Brand icon={icon} size={size} /><div style={{ fontSize: size * 0.85, fontWeight: 900 }}>{name}</div></div>
);

export const ReelExample: React.FC<ReelProps> = ({ reel, words, loudness }) => {
  const { f, idx } = useWords(words);
  const [tool, num, catchAt, otp, ask, comment] = [idx("Firebase"), idx("50,000"), idx("Catch:"), idx("phone"), idx("Tum"), idx("Comment")];

  return (
    <CollageReel
      reel={reel} words={words} loudness={loudness}
      chapters={[[0, "01 · hook"], [tool, "02 · tool"], [catchAt, "03 · the catch"], [ask, "04 · your pick"]]}
      keys={[idx("Login"), num, idx("free."), idx("paisa")]}
      red={[catchAt]}
      wipeAt={catchAt}
      beats={[
        // first frame: one strong visual (the headline above it is the hook line)
        { at: 0, el: <Pop at={0}><div style={{ fontSize: 300, fontWeight: 900, color: C.primary, lineHeight: 1 }}>FREE</div></Pop> },
        { at: tool, el: <Card style={{ padding: "60px 70px" }}><LogoRow icon={siFirebase} name="Firebase" size={150} /></Card> },
        { at: num, source: "firebase.google.com/pricing", el: (
          <div style={{ position: "relative" }}>
            <BigNumber logo={<LogoRow icon={siFirebase} name="Firebase Auth" />} num="50,000" unit="monthly users" stampAt={f(num) + 6} />
            <Marker w={800} h={260} at={f(num) + 2} d={roughEllipse(395, 130, 410, 115, 2)} style={{ left: 0, top: 70 }} />
          </div>
        ) },
        { at: catchAt, el: <Pop at={f(catchAt)}><TriangleAlert size={360} strokeWidth={1.6} color={C.danger} /></Pop> },
        { at: otp, el: (
          <Card style={{ width: 860 }}>
            <div style={{ fontSize: 56, fontWeight: 900 }}>Phone OTP</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: C.mute, marginTop: 8 }}>har SMS ka paisa</div>
            <HandNote at={f(idx("paisa"))} style={{ right: 20, bottom: -80 }}>pehle email login</HandNote>
          </Card>
        ) },
        { at: ask, el: (
          <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.ink, color: "#fff", borderRadius: 99, padding: "20px 44px", fontSize: 56, fontWeight: 900 }}><MessageCircle size={60} strokeWidth={2.6} /> comment karo</div>
        ) },
        { at: comment, el: (
          <div style={{ width: 300, height: 300, borderRadius: 99, background: C.ink, display: "grid", placeItems: "center" }}><Send size={150} color="#fff" strokeWidth={2.4} /></div>
        ) },
      ]}
      cues={[["marker", f(num) + 2, 0.2], ["pop", f(num) + 6, 0.2], ["ding", f(comment), 0.14]]}
    />
  );
};
