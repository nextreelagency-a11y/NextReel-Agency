#!/usr/bin/env bash
# Pipeline completa: video in input/source.* -> output/reel_final.mp4
#  1. converte la sorgente in H.264 per Remotion
#  2. trascrive parola per parola (se data/transcript.json manca)
#  3. costruisce la timeline (sottotitoli, zoom, pop-up, transizioni, SFX)
#  4. genera SFX e musica, renderizza la grafica con Remotion, fa il mix audio
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=$(ls input/source.* | head -1)
mkdir -p build output public

ffmpeg -v error -y -i "$SRC" -an -c:v libx264 -preset veryfast -crf 16 -pix_fmt yuv420p \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920" public/source.mp4

if [ ! -f data/transcript.json ]; then
  ffmpeg -v error -y -i "$SRC" -ac 1 -ar 16000 build/audio16k.wav
  HF_HUB_DISABLE_XET=1 python3 scripts/transcribe.py build/audio16k.wav data/transcript.json
fi

DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 public/source.mp4)
python3 scripts/build_timeline.py "$DUR"
python3 scripts/make_audio.py

BROWSER=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
npx remotion render src/index.ts Reel build/video_noaudio.mp4 --muted --codec=h264 --crf=16 --image-format=jpeg --jpeg-quality=95 ${BROWSER:+--browser-executable="$BROWSER"}

bash scripts/mix.sh build/video_noaudio.mp4 "$SRC" build/mixed.mp4
# compressione finale (file < 100 MB, pronto per l'upload sui social)
ffmpeg -v error -y -i build/mixed.mp4 -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -c:a copy -movflags +faststart output/reel_final.mp4
echo "Pronto: output/reel_final.mp4"
