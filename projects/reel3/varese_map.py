"""Scarica i confini delle province e crea projects/reel3/varese.json
(provincia di Varese evidenziata + province vicine + città di riferimento)."""
import json
import math
import urllib.request

URL = "https://raw.githubusercontent.com/openpolis/geojson-italy/master/geojson/limits_IT_provinces.geojson"
NEAR = ["Varese", "Como", "Milano", "Monza e della Brianza", "Novara", "Verbano-Cusio-Ossola", "Lecco"]
CITIES = {
    "Origgio": (9.017, 45.597),
    "Varese": (8.825, 45.818),
    "Busto Arsizio": (8.851, 45.611),
    "Gallarate": (8.791, 45.660),
    "Saronno": (9.037, 45.626),
    "Luino": (8.744, 46.000),
}

data = json.load(urllib.request.urlopen(URL))
def pname(f):
    p = f["properties"]
    return p.get("prov_name") or p.get("DEN_PROV") or p.get("DEN_UTS") or p.get("name")

K = math.cos(math.radians(45.7))
proj = lambda lon, lat: (lon * K, -lat)
def rings(g):
    return [g["coordinates"][0]] if g["type"] == "Polygon" else [p[0] for p in g["coordinates"]]

feats = {pname(f): f for f in data["features"] if pname(f) in NEAR}
missing = [n for n in NEAR if n not in feats]
print("province trovate:", sorted(feats), "mancanti:", missing)
var = feats["Varese"]
vp = [proj(*c) for r in rings(var["geometry"]) for c in r]
x0, x1 = min(p[0] for p in vp), max(p[0] for p in vp)
y0, y1 = min(p[1] for p in vp), max(p[1] for p in vp)
# la provincia occupa ~1000 unità di altezza
S = 1000 / (y1 - y0)
tf = lambda p: ((p[0] - x0) * S, (p[1] - y0) * S)

def dp(pts, eps):
    if len(pts) < 3:
        return pts
    (ax, ay), (bx, by) = pts[0], pts[-1]
    dx, dy = bx - ax, by - ay
    L = math.hypot(dx, dy) or 1e-12
    dmax, idx = 0, 0
    for i in range(1, len(pts) - 1):
        x, y = pts[i]
        d = abs(dy * x - dx * y + bx * ay - by * ax) / L
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return dp(pts[: idx + 1], eps)[:-1] + dp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def path(g, eps=0.8):
    out = []
    for r in rings(g):
        pts = [tf(proj(*c)) for c in r]
        m = len(pts) // 2
        s = dp(pts[: m + 1], eps)[:-1] + dp(pts[m:], eps)
        if len(s) >= 3:
            out.append("M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in s) + " Z")
    return " ".join(out)

out = {
    "width": round((x1 - x0) * S, 1),
    "height": 1000,
    "varese": path(var["geometry"]),
    "near": [{"name": n, "d": path(f["geometry"], 1.5)} for n, f in feats.items() if n != "Varese"],
    "cities": [{"name": n, "x": round(tf(proj(*c))[0], 1), "y": round(tf(proj(*c))[1], 1)} for n, c in CITIES.items()],
}
json.dump(out, open("projects/reel3/varese.json", "w"))
print("ok", out["width"], [c for c in out["cities"]])
