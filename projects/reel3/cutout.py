"""Scontorna le foto prodotto (sfondo bianco o trasparente) -> public/reel3/*.png"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

U = sys.argv[1]  # cartella con le foto originali
S = sys.argv[2]  # cartella per l'anteprima
FILES = (("4ed8f7e7-image.jpg", "pannelli"), ("8ce51384-image.png", "inverter"), ("8aa9cf62-image.jpg", "accumulo"))

prevs = []
for src, name in FILES:
    im = Image.open(U + src).convert("RGBA")
    a = np.array(im).astype(int)
    h, w, _ = a.shape
    light = (a[..., :3].min(axis=2) >= 238) | (a[..., 3] < 20)
    bg = np.zeros((h, w), bool)
    q = deque([(y, x) for x in range(w) for y in (0, h - 1)] + [(y, x) for y in range(h) for x in (0, w - 1)])
    while q:
        y, x = q.popleft()
        if bg[y, x] or not light[y, x]:
            continue
        bg[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                q.append((ny, nx))
    alpha = Image.fromarray(((~bg) * 255).astype("uint8")).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1))
    out = im.copy()
    out.putalpha(alpha)
    bb = alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    out = out.crop(bb)
    out.save(f"public/reel3/{name}.png")
    print(name, im.size, "->", out.size)
    p = Image.new("RGBA", out.size, (40, 120, 200, 255))
    p.alpha_composite(out)
    p = p.convert("RGB").resize((int(out.width * 300 / out.height), 300))
    prevs.append(p)

sh = Image.new("RGB", (sum(p.width for p in prevs) + 40, 300), (255, 255, 255))
x = 0
for p in prevs:
    sh.paste(p, (x, 0))
    x += p.width + 20
sh.save(S + "cuts.jpg")
