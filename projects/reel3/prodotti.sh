#!/usr/bin/env bash
# Grafiche "pannelli / inverter / accumulo" sulla stessa riga:
# PNG della riga intera, PNG dei singoli prodotti e clip animata (trasparente + green screen).
set -euo pipefail
cd "$(dirname "$0")/../.."
UP=${1:?cartella con le foto originali}
SC=${2:?cartella anteprime}
mkdir -p public/reel3 build/r3prod output/reel_stessa_marca/grafiche_png output/reel_stessa_marca/clip
python3 projects/reel3/cutout.py "$UP" "$SC"
npx tsc -p .
B=${REMOTION_BROWSER:-$(ls /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | head -1)}
BF=${B:+--browser-executable=$B}

# PNG: riga intera + singoli prodotti
npx remotion still src/index.ts ProdottiRiga build/r3prod/riga.png --frame=60 --image-format=png $BF
for i in 0 1 2; do
  npx remotion still src/index.ts ProdottiRiga build/r3prod/p$i.png --frame=40 --image-format=png --props="{\"only\":$i}" $BF
done
python3 - "$SC" <<'EOF'
import sys
from PIL import Image
D = "output/reel_stessa_marca/grafiche_png"
names = {"riga": "14_riga_pannelli_inverter_accumulo", "p0": "15_pannelli", "p1": "16_inverter", "p2": "17_accumulo"}
outs = []
for k, n in names.items():
    im = Image.open(f"build/r3prod/{k}.png").convert("RGBA")
    bb = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    bb = (max(0, bb[0] - 20), max(0, bb[1] - 20), min(im.width, bb[2] + 20), min(im.height, bb[3] + 20))
    out = im.crop(bb)
    out.save(f"{D}/{n}.png")
    outs.append(out)
    print(n, out.size)
r = outs[0]
bg = Image.new("RGBA", r.size, (106, 127, 149, 255))
bg.alpha_composite(r)
bg.convert("RGB").save(sys.argv[1] + "riga_preview.jpg")
EOF

# clip animata
npx remotion render src/index.ts ProdottiRiga build/r3_prodotti.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le $BF
ffmpeg -v error -y -i build/r3_prodotti.mov -c:v png -pix_fmt rgba output/reel_stessa_marca/clip/05_riga_prodotti_trasparente.mov
ffmpeg -v error -y -f lavfi -i color=c=0x00FF00:s=1080x1920:r=30 -i build/r3_prodotti.mov \
  -filter_complex "[0:v][1:v]overlay=shortest=1,format=yuv420p" -c:v libx264 -crf 18 -preset slow -movflags +faststart \
  output/reel_stessa_marca/clip/05_riga_prodotti_greenscreen.mp4
echo "Pronto"
