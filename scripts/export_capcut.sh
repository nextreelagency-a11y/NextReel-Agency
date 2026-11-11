#!/usr/bin/env bash
# Esporta il Reel come pacchetto a livelli modificabile in CapCut Pro -> output/capcut/
#   1_video_base.mp4            video con zoom e transizioni, senza scritte (muto)
#   2_grafiche_trasparenti.mov  icone e numeri su sfondo trasparente (PNG con alpha)
#   3_voce.wav                  voce normalizzata a -14 LUFS
#   4_musica.wav                musica a -25 LUFS
#   5_effetti_sonori.wav        whoosh / pop / click già a tempo
#   sottotitoli.srt             gruppi di max 3 parole (testo modificabile in CapCut)
#   sottotitoli_parola_per_parola.srt
# Richiede di aver già eseguito scripts/render.sh (timeline, musica e SFX in build/).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=$(ls input/source.* | head -1)
OUT=output/capcut
mkdir -p "$OUT" build/capcut
BROWSER=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
BFLAG=${BROWSER:+--browser-executable=$BROWSER}

# Video base e grafiche trasparenti (SKIP_RENDER=1 riusa i render già presenti in build/capcut)
[ -n "${SKIP_RENDER:-}" ] || npx remotion render src/index.ts Base build/capcut/base_raw.mp4 --muted --codec=h264 --crf=16 --image-format=jpeg --jpeg-quality=95 $BFLAG
ffmpeg -v error -y -i build/capcut/base_raw.mp4 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT/1_video_base.mp4"
[ -n "${SKIP_RENDER:-}" ] || npx remotion render src/index.ts Overlay build/capcut/overlay.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le $BFLAG
ffmpeg -v error -y -i build/capcut/overlay.mov -c:v png -pix_fmt rgba "$OUT/2_grafiche_trasparenti.mov"

# Tracce audio separate, già ai livelli del mix finale
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/1_video_base.mp4")
measure() {
  ffmpeg -hide_banner -nostats -i "$1" -af "loudnorm=I=$2:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 \
    | python3 -c "import sys,json,re; d=json.loads(re.findall(r'\{[^{}]*\}', sys.stdin.read(), re.S)[-1]); print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")"
}
MUSIC=$(ls input/music.* 2>/dev/null | head -1 || true)
MUSIC=${MUSIC:-build/music.wav}
ffmpeg -v error -y -stream_loop -1 -i "$MUSIC" -t "$DUR" build/music_loop.wav
VM=$(measure "$SRC" -14)
MM=$(measure build/music_loop.wav -25)
ffmpeg -v error -y -i "$SRC" -t "$DUR" -af "loudnorm=I=-14:TP=-1.5:LRA=11:$VM:linear=true" -ar 48000 -ac 2 "$OUT/3_voce.wav"
ffmpeg -v error -y -i build/music_loop.wav -af "loudnorm=I=-25:TP=-1.5:LRA=11:$MM:linear=true" -ar 48000 -ac 2 "$OUT/4_musica.wav"
ffmpeg -v error -y -i build/sfx.wav -t "$DUR" -ar 48000 -ac 2 "$OUT/5_effetti_sonori.wav"

# Sottotitoli .srt
python3 - "$OUT" <<'EOF'
import json, sys
out = sys.argv[1]
reel = json.load(open("data/reel.json"))
def ts(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
def write(path, cues):
    with open(path, "w", encoding="utf-8") as f:
        for i, (a, b, txt) in enumerate(cues, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
write(f"{out}/sottotitoli.srt", [(g["start"], g["end"], " ".join(w["text"] for w in g["words"])) for g in reel["captions"]])
write(f"{out}/sottotitoli_parola_per_parola.srt", [(w["s"], w["e"], w["text"]) for g in reel["captions"] for w in g["words"]])
EOF
cp docs/CAPCUT.md "$OUT/LEGGIMI.md"
echo "Pacchetto CapCut pronto in $OUT"
