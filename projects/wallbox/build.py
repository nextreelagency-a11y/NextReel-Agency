"""Taglia le pause, normalizza la voce a -14 LUFS e scrive reel.json per Remotion."""
import json, subprocess, re

plan = json.load(open("plan.json"))
src = "input/source.mov"
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]))
cuts = plan["cuts"]
keep, t0 = [], 0.0
for a, b in cuts:
    keep.append((t0, a)); t0 = b
keep.append((t0, dur))

def remap(t):
    out = 0.0
    for a, b in keep:
        if t <= a: return out
        if t <= b: return out + t - a
        out += b - a
    return out

n = len(keep)
f = "".join(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}];[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS[a{i}];" for i, (a, b) in enumerate(keep))
f += "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", f, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "build_cut.mov"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build_cut.mov", "-an", "-c:v", "copy", "../../public/wallbox/source.mp4"], check=True)

# voce a -14 LUFS (loudnorm a due passaggi)
m = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", "build_cut.mov", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                   capture_output=True, text=True).stderr
d = json.loads(re.findall(r"\{[^{}]*\}", m, re.S)[-1])
lin = f"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build_cut.mov", "-af", f"loudnorm=I=-14:TP=-1.5:LRA=11:{lin}:linear=true", "-ar", "48000", "-ac", "2", "voice.wav"], check=True)

newdur = sum(b - a for a, b in keep)
pops = []
for p in plan["popups"]:
    q = dict(p); q["start"] = round(remap(p["start"]), 3); q["end"] = round(min(remap(p["end"]), newdur), 3)
    pops.append(q)
json.dump({"fps": 30, "width": 1080, "height": 1920, "duration": round(newdur, 3), "popups": pops}, open("reel.json", "w"), indent=1)
print("durata", round(newdur, 2), "segmenti", keep)
