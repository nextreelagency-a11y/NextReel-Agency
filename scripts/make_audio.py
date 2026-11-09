"""Genera build/music.wav e build/sfx.wav sincronizzati con data/reel.json.

- SFX sintetici: whoosh (transizioni e numeri), pop e click (icone)
- Musica: loop a 120 BPM che riparte con un "drop" (cassa + piatto)
  su ogni cambio di capitolo, così è a tempo con i tagli principali.
Se in input/ c'è un file music.* viene usato quello al posto della base sintetica
(lo gestisce scripts/mix.sh).
"""
import json
import wave

import numpy as np

SR = 48000
rng = np.random.default_rng(7)
reel = json.load(open("data/reel.json"))
DUR = reel["duration"]
N = int(DUR * SR)


def save(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def db(v):
    return 10 ** (v / 20)


def lowpass(x, cutoff):
    # filtro passa-basso a un polo (sufficiente per suoni d'atmosfera)
    a = np.exp(-2 * np.pi * np.asarray(cutoff, dtype=float) / SR)
    y = np.zeros_like(x)
    acc = 0.0
    if np.ndim(a) == 0:
        a = np.full(len(x), a)
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def norm(x, peak_db):
    return x / (np.max(np.abs(x)) + 1e-9) * db(peak_db)


# ---------- effetti sonori ----------
def whoosh(d=0.38):
    n = int(d * SR)
    t = np.linspace(0, 1, n)
    noise = rng.standard_normal(n)
    sweep = 300 + 5000 * np.sin(np.pi * t) ** 2  # il filtro si apre e si richiude
    hp = noise - lowpass(noise, 250)
    x = lowpass(hp, sweep)
    env = np.sin(np.pi * t ** 0.7) ** 2
    return norm(x * env, -12)


def pop(d=0.12):
    n = int(d * SR)
    t = np.arange(n) / SR
    f = 950 * np.exp(-t * 28) + 260
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t * 38)
    x[: int(0.002 * SR)] += rng.standard_normal(int(0.002 * SR)) * 0.4
    return norm(x, -10)


def click(d=0.03):
    n = int(d * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 300) + rng.standard_normal(n) * np.exp(-t * 900) * 0.5
    return norm(x, -16)


SFX = {"whoosh": whoosh(), "pop": pop(), "click": click()}
sfx = np.zeros(N + SR)
for e in reel["sfx"]:
    s = SFX[e["type"]]
    i = max(0, int(e["time"] * SR))
    sfx[i : i + len(s)] += s
save("build/sfx.wav", sfx[:N])

# ---------- musica ----------
BPM = 120
BEAT = 60 / BPM
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 120 * np.exp(-t * 30) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    return (x - lowpass(x, 7000)) * np.exp(-t * 90) * 0.35


def crash():
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    return (x - lowpass(x, 4000)) * np.exp(-t * 2.5) * 0.4


K, H, C = kick(), hat(), crash()
music = np.zeros(N + 2 * SR)
pad = np.zeros_like(music)


def add(buf, s, t0):
    i = int(t0 * SR)
    if 0 <= i < len(buf):
        buf[i : i + len(s)] += s[: len(buf) - i]


bounds = [0.0] + [c["time"] for c in reel["chapters"]] + [DUR]
for ci in range(len(bounds) - 1):
    a, b = bounds[ci], bounds[ci + 1]
    intro = ci == 0  # nel gancio iniziale solo pad + hi-hat, il beat entra al primo drop
    if ci > 0:
        add(music, C, a)  # drop sul taglio
    beat = 0
    t0 = a
    while t0 < b:
        bar, pos = divmod(beat, 4)
        chord = CHORDS[bar % 4]
        if pos == 0:
            n = int(min(4 * BEAT, b - t0 + 0.3) * SR)
            tt = np.arange(n) / SR
            env = np.minimum(1, tt / 0.15) * np.exp(-tt * 0.4)
            chord_wave = np.zeros(n)
            for m in chord:
                for det in (-0.12, 0.12):  # due oscillatori a dente di sega leggermente stonati
                    chord_wave += 2 * ((mtof(m + det) * tt) % 1) - 1
            add(pad, chord_wave * env * 0.05, t0)
        if not intro:
            add(music, K * 0.9, t0)
            nb = int(BEAT * 0.9 * SR)
            tb = np.arange(nb) / SR
            bass = np.sin(2 * np.pi * mtof(chord[0] - 24) * tb) * np.exp(-tb * 3) * 0.45
            add(music, bass, t0 + BEAT / 2)
        add(music, H, t0 + BEAT / 2)
        if not intro:
            add(music, H * 0.6, t0)
        beat += 1
        t0 += BEAT
music += lowpass(pad, 1400)
music = music[:N]
fade = int(1.0 * SR)
music[-fade:] *= np.linspace(1, 0, fade)
save("build/music.wav", norm(music, -3))
print("ok: build/sfx.wav, build/music.wav", f"({len(reel['sfx'])} effetti)")
