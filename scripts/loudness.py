# python3 <skill>/scripts/loudness.py <N>  -> public/reel<N>/loudness.json (0..1 per video frame @30fps)
import array, json, math, sys, wave

N = sys.argv[1]
FPS = 30
w = wave.open(f"public/reel{N}/voice.wav", "rb")
rate, n = w.getframerate(), w.getnframes()
samples = array.array("h", w.readframes(n))
step = rate // FPS
rms = []
for i in range(0, len(samples), step):
    chunk = samples[i : i + step]
    rms.append(math.sqrt(sum(s * s for s in chunk) / max(1, len(chunk))) if chunk else 0)
peak = sorted(rms)[int(len(rms) * 0.97)] or 1
vals = [min(1.0, r / peak) for r in rms]
# gate quiet frames, light smoothing
vals = [0 if v < 0.08 else v for v in vals]
sm = [round((vals[max(0, i - 1)] + 2 * vals[i] + vals[min(len(vals) - 1, i + 1)]) / 4, 3) for i in range(len(vals))]
json.dump(sm, open(f"public/reel{N}/loudness.json", "w"))
print(f"{len(sm)} frames, {n / rate:.2f}s")
