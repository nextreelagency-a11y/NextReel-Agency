#!/usr/bin/env bash
# Materiale per il reel "Stessa marca" (Origgio): clip da sovrapporre in CapCut.
set -euo pipefail
cd "$(dirname "$0")/../.."
B=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
BF=${B:+--browser-executable=$B}
OUT=output/reel_stessa_marca/clip
mkdir -p "$OUT" build
# cartina a schermo intero
npx remotion render src/index.ts MappaOriggio build/r3_mappa.mp4 --muted --codec=h264 --crf=16 $BF
ffmpeg -v error -y -i build/r3_mappa.mp4 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "$OUT/01_cartina_origgio.mp4"
# animazioni con sfondo trasparente (+ versione green screen)
n=2
for C in ChecklistSunPower PianoPagamenti LogoDomus; do
  name=$(printf "%02d" $n)_$(echo $C | sed 's/\([a-z]\)\([A-Z]\)/\1_\2/g' | tr 'A-Z' 'a-z')
  npx remotion render src/index.ts $C build/r3_$C.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le $BF
  ffmpeg -v error -y -i build/r3_$C.mov -c:v png -pix_fmt rgba "$OUT/${name}_trasparente.mov"
  ffmpeg -v error -y -f lavfi -i color=c=0x00FF00:s=1080x1920:r=30 -i build/r3_$C.mov -filter_complex "[0:v][1:v]overlay=shortest=1,format=yuv420p" -c:v libx264 -crf 18 -preset slow -movflags +faststart "$OUT/${name}_greenscreen.mp4"
  n=$((n+1))
done
echo "Pronto: $OUT"
