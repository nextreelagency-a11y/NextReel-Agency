#!/usr/bin/env bash
# Render del Reel "Installazione Calolzio" + pacchetto a livelli per CapCut.
set -euo pipefail
cd "$(dirname "$0")/../.."
B=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
BF=${B:+--browser-executable=$B}
OUT=output/installazione_calolzio
mkdir -p "$OUT/capcut" build
FPS=30
fr() { python3 -c "import json;p=[x for x in json.load(open('projects/wallbox/reel.json'))['popups'] if x['type']=='$1'][0];print(round(p['start']*$FPS), round(p['end']*$FPS)-1, p['start'])"; }

# 1) video finale
npx remotion render src/index.ts Wallbox build/wallbox_noaudio.mp4 --muted --codec=h264 --crf=16 --image-format=jpeg --jpeg-quality=95 $BF
ffmpeg -v error -y -i build/wallbox_noaudio.mp4 -i projects/wallbox/voice.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT/reel_finale.mp4"

# 2) livelli CapCut
ffmpeg -v error -y -i public/wallbox/source.mp4 -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart "$OUT/capcut/1_video_base.mp4"
npx remotion render src/index.ts WallboxOverlay build/wb_overlay.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le $BF
ffmpeg -v error -y -i build/wb_overlay.mov -c:v png -pix_fmt rgba "$OUT/capcut/2_grafiche_trasparenti.mov"
read A1 A2 AS < <(fr aerial)
read M1 M2 MS < <(fr map)
npx remotion render src/index.ts WallboxInserts "build/wb_aerial.mp4" --frames=$A1-$A2 --muted --codec=h264 --crf=16 $BF
npx remotion render src/index.ts WallboxInserts "build/wb_map.mp4" --frames=$M1-$M2 --muted --codec=h264 --crf=16 $BF
ffmpeg -v error -y -i build/wb_aerial.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "$OUT/capcut/3_inserto_vista_dallalto_da_${AS}s.mp4"
ffmpeg -v error -y -i build/wb_map.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "$OUT/capcut/4_inserto_cartina_da_${MS}s.mp4"
cp projects/wallbox/voice.wav "$OUT/capcut/5_voce.wav"
echo "Pronto: $OUT"
