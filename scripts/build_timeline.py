"""Costruisce data/reel.json (usato da Remotion e dal mix audio)
partendo da data/transcript.json + data/edit_plan.json."""
import json, re, sys

FPS = 30
MIN_PAUSE = 0.30   # pause più lunghe di così vanno tagliate
ZOOM = 1.10        # punch-in del 10% sui cambi di frase

t = json.load(open("data/transcript.json"))
plan = json.load(open("data/edit_plan.json"))
duration = float(sys.argv[1]) if len(sys.argv) > 1 else t[-1]["end"]

# 1) parole: unisce i token attaccati (l + 'ombra, 30 + %, 20 + .000)
words = []
for seg_i, seg in enumerate(t):
    for w in seg["words"]:
        txt = w["w"]
        if words and not txt.startswith(" ") and words[-1]["seg"] == seg_i:
            words[-1]["raw"] += txt
            words[-1]["e"] = w["e"]
        else:
            words.append({"raw": txt.strip(), "s": w["s"], "e": w["e"], "seg": seg_i})
for w in words:
    core = re.sub(r"[.,!?;:]+$", "", w["raw"])
    core = plan["corrections"].get(core, core)
    w["key"] = core.lower()
    w["text"] = (core + ("?" if w["raw"].endswith("?") else "")).upper()

pauses = [round(b["s"] - a["e"], 3) for a, b in zip(words, words[1:]) if b["s"] - a["e"] > MIN_PAUSE]

def find_word(key, at):
    norm = lambda k: re.sub(r"[^\w]", "", k.lower().split("'")[-1])
    cands = [w for w in words if norm(w["key"]) == norm(key)]
    if not cands:
        raise SystemExit(f"parola non trovata: {key}")
    return min(cands, key=lambda w: abs(w["s"] - at))

# 2) gruppi di sottotitoli (max 3 parole, si spezza sulla punteggiatura)
groups, cur = [], []
for i, w in enumerate(words):
    cur.append(i)
    nxt = words[i + 1] if i + 1 < len(words) else None
    brk = len(cur) == 3 or re.search(r"[.,!?]$", w["raw"]) or nxt is None or nxt["s"] - w["e"] > 0.25
    if brk:
        groups.append(cur); cur = []
cap = []
for gi, g in enumerate(groups):
    start = words[g[0]]["s"]
    end = words[groups[gi + 1][0]]["s"] if gi + 1 < len(groups) else duration
    cap.append({"start": start, "end": end,
                "words": [{"text": words[i]["text"], "s": words[i]["s"],
                           "e": words[i + 1]["s"] if i + 1 < len(words) and i + 1 in g else end}
                          for i in g]})

# 3) capitoli + transizioni
chapters = []
for c in plan["chapters"]:
    w = find_word(c["word"], c["at"])
    prev_end = max(x["e"] for x in words if x["s"] < w["s"])
    chapters.append({"title": c["title"], "time": round((prev_end + w["s"]) / 2, 3), "transition": c["transition"]})
bounds = [0] + [c["time"] for c in chapters] + [duration]

# 4) zoom: punch-in del 10% alternato (1.0 / 1.1) a ogni cambio di frase
#    e sulle virgole delle frasi lunghe; ogni capitolo riparte da 1.0
cuts = [seg["words"][0]["s"] for seg in t]
for i, c in enumerate(cuts):
    end = cuts[i + 1] if i + 1 < len(cuts) else duration
    if end - c > 4.5:
        commas = [j for j, w in enumerate(words[:-1]) if c + 1.5 < w["s"] < end - 1.5 and w["raw"].endswith(",")]
        if commas:
            cuts.append(words[commas[0] + 1]["s"])
cuts = sorted(set([0.0] + cuts[1:]))
zooms, k = [], 0
for i, c in enumerate(cuts):
    if any(abs(c - b) < 0.3 for b in bounds[1:-1]):
        k = 0
    end = cuts[i + 1] if i + 1 < len(cuts) else duration
    zooms.append({"start": c, "end": end, "scale": ZOOM if k % 2 else 1.0})
    k += 1

# 5) pop-up (icone e numeri)
pops = []
for p in plan["popups"]:
    w = find_word(p["word"], p["at"])
    pops.append({**{k: v for k, v in p.items() if k not in ("word", "at")}, "start": w["s"]})
pops.sort(key=lambda x: x["start"])
for i, p in enumerate(pops):
    limit = p["start"] + (2.4 if p["type"] == "stat" else 1.8)
    if i + 1 < len(pops):
        limit = min(limit, pops[i + 1]["start"] - 0.02)
    nb = [b for b in bounds if b > p["start"] + 0.2]
    if nb:
        limit = min(limit, nb[0] - 0.05)
    p["end"] = round(limit, 3)

# 6) effetti sonori
sfx = []
for c in chapters:
    sfx.append({"type": "whoosh", "time": c["time"] - 0.15})
for p in pops:
    sfx.append({"type": "whoosh" if p["type"] == "stat" else "pop", "time": p["start"]})
    if p["type"] == "stat":
        sfx.append({"type": "click", "time": p["start"] + 0.12})

out = {"fps": FPS, "width": 1080, "height": 1920, "duration": duration,
       "pausesOver300ms": pauses, "captions": cap, "chapters": chapters,
       "zooms": zooms, "popups": pops, "sfx": sorted(sfx, key=lambda s: s["time"])}
json.dump(out, open("data/reel.json", "w"), ensure_ascii=False, indent=1)
print(f"parole={len(words)} gruppi={len(cap)} capitoli={len(chapters)} zoom={len(zooms)} popup={len(pops)} sfx={len(sfx)} pause>0.3s={pauses}")
