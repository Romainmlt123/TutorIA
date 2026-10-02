"""
Carte d'une région (X2b) : la région de l'île des Maths, agrandie. On reprend la scène de
island_maths.py (mêmes accessoires, mêmes matières), on n'en garde que ce qui tombe dans le contour
de la région (regions.json), agrandi `SCALE` fois, sur un terrain neuf qui suit ce contour. Les repères
(boulier, cubes, pyramides, arbres à signes…) deviennent de grands monuments du paysage ; l'herbe, les
buissons et les fleurs gardent leur taille réelle. L'eau (π, rivière) est animée par l'app.

Usage : EXPLORER_REGION=maths-nombres blender -b -P tools/explorer-3d/region_map.py
        EXPLORER_PREVIEW=/chemin/apercu.png ... (sans cuisson, vue de haut quadrillée pour poser les villes)
Sortie : assets/explorer/models/region-<id>.glb
Les villes de la région (src/features/explorer/stylized3d/regionSites.json, en mètres de la carte)
gardent leur clairière libre de buissons, de fleurs et d'herbe haute.
"""
import itertools
import json
import math
import os
import random
import sys
import time

import bmesh
import bpy
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

REGION_ID = os.environ.get("EXPLORER_REGION", "maths-nombres")
SCALE = float(os.environ.get("EXPLORER_REGION_SCALE", "3"))
STYLIZED = os.path.join(HERE, "..", "..", "src", "features", "explorer", "stylized3d")
REGIONS = {r["id"]: r for r in json.load(open(os.path.join(STYLIZED, "regions.json")))["regions"]}
REGION = REGIONS[REGION_ID]
SITES_PATH = os.path.join(STYLIZED, "regionSites.json")
SITES = json.load(open(SITES_PATH)).get(REGION_ID, {}) if os.path.exists(SITES_PATH) else {}
CLEARING = 2.0  # rayon libre autour du centre d'une ville, en mètres de la carte
CITY_SITES = {k: tuple(v["center"]) for k, v in SITES.get("cities", {}).items()}
CITY_CENTERS = list(CITY_SITES.values())

# --- La scène de l'île, sans ses cuissons -------------------------------------------------------
ISLAND = os.path.join(HERE, "island_maths.py")
MARKER = "# --- fin de la construction des accessoires"
ns = {"__file__": ISLAND, "__name__": "island_maths"}
exec(compile(open(ISLAND).read().split(MARKER)[0], ISLAND, "exec"), ns)
geo, M, bake, app, edge = ns["geo"], ns["M"], ns["bake"], ns["app"], ns["edge"]
near_water, water_mask = ns["near_water"], ns["water_mask"]
occupied, claim_names = ns["occupied"], ns["claim_names"]
# Repères de l'île laissés de côté sur la carte, pour faire de la place aux villes (noms de claim()).
DROP = set(filter(None, os.environ.get("EXPLORER_DROP", "").split(",")))


# --- Contour de la région, dans l'île -----------------------------------------------------------
def in_polygon(poly, x, z):
    result = False
    for (x1, z1), (x2, z2) in zip(poly, poly[1:] + poly[:1]):
        if (z1 > z) != (z2 > z) and x < x1 + (z - z1) * (x2 - x1) / (z2 - z1):
            result = not result
    return result


def in_region(x, z):
    return in_polygon(REGION["polygon"], x, z) and math.hypot(x, z) <= edge(math.atan2(z, x)) * 0.985


FOCUS = REGION["focus"]
RAYS = 360
ts = []
for i in range(RAYS):
    a = i / RAYS * math.tau
    t = 0.0
    while in_region(FOCUS[0] + math.cos(a) * (t + 0.02), FOCUS[1] + math.sin(a) * (t + 0.02)) and t < 12:
        t += 0.02
    ts.append(t)
# Contour adouci : moyenne glissante sur quelques rayons, sans toucher aux grandes lignes.
smooth = [sum(ts[(i + k) % RAYS] for k in range(-4, 5)) / 9 for i in range(RAYS)]
OUTLINE = [(FOCUS[0] + math.cos(i / RAYS * math.tau) * smooth[i],
            FOCUS[1] + math.sin(i / RAYS * math.tau) * smooth[i]) for i in range(RAYS)]
FOCUS_S = (FOCUS[0] * SCALE, FOCUS[1] * SCALE)
OUTLINE_S = [(x * SCALE, z * SCALE) for x, z in OUTLINE]


def inside_outline(x, z, inset=0.0):
    """Point de l'île (mètres de l'île) dans le contour adouci, à `inset` mètres de l'île du bord."""
    a = math.atan2(z - FOCUS[1], x - FOCUS[0])
    r = smooth[int(((a % math.tau) / math.tau) * RAYS) % RAYS]
    return math.hypot(x - FOCUS[0], z - FOCUS[1]) <= r - inset


# --- Tri des objets de l'île : on garde les repères de la région, on retire le reste -----------------
def bbox(obj):
    corners = [obj.matrix_world @ __import__("mathutils").Vector(c) for c in obj.bound_box]
    xs, ys, zs = [c.x for c in corners], [c.y for c in corners], [c.z for c in corners]
    return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))


def material_name(obj):
    return obj.data.materials[0].name if obj.type == "MESH" and obj.data.materials else ""


bpy.context.view_layer.update()
kept, dropped = [], 0
for obj in list(bpy.context.scene.objects):
    if obj.type not in {"MESH", "CURVE", "FONT"}:
        continue
    x0, x1, y0, y1, z0, z1 = bbox(obj)
    cx, cz = (x0 + x1) / 2, -(y0 + y1) / 2
    size = max(x1 - x0, y1 - y0, z1 - z0)
    small_decor = material_name(obj).startswith("aplat-flower") or (
        material_name(obj).startswith("feuillage-moss") and size < 0.5)
    under = z1 < 0.02  # accessoires sous l'île (pierres, cristaux, racines)
    in_dropped = any(name in DROP and math.hypot(cx - ox, cz - oz) <= orad + 0.1
                     for (ox, oz, orad), name in zip(occupied, claim_names))
    body = obj.name.split(".")[0] in {"Plateau", "Bordure", "Motte"}
    if body or under or small_decor or in_dropped or not inside_outline(cx, cz):
        bpy.data.objects.remove(obj, do_unlink=True)
        dropped += 1
    else:
        kept.append(obj)
print("REGION", REGION_ID, "objets gardés", len(kept), "retirés", dropped, flush=True)

# Les repères gardés, agrandis autour du centre de l'île.
for obj in kept:
    obj.location = obj.location * SCALE
    obj.scale = obj.scale * SCALE
bpy.context.view_layer.update()

LANDMARKS = [(x * SCALE, z * SCALE, r * SCALE) for (x, z, r), name in zip(occupied, claim_names)
             if inside_outline(x, z) and name not in DROP]
for name, (x, z) in CITY_SITES.items():
    for lx, lz, lr in LANDMARKS:
        if math.hypot(lx - x, lz - z) < lr + 1.4:
            print(f"ATTENTION la ville {name} touche un repère à ({lx:.1f}, {lz:.1f})", flush=True)


def blocked(x, z, margin=0.0):
    """Vrai si le point (mètres de la carte) est dans une clairière de ville ou sur un repère."""
    if any(math.hypot(x - cx, z - cz) < CLEARING + margin for cx, cz in CITY_CENTERS):
        return True
    return any(math.hypot(x - lx, z - lz) < lr + margin for lx, lz, lr in LANDMARKS)


# --- Terrain neuf : dessus d'herbe, bord d'herbe qui déborde, motte de terre -----------------------
mask = water_mask(size=2048, extent=3.6)
grass = M.grass(mask, extent=3.6 * SCALE)
N = len(OUTLINE_S)
rng = random.Random(3)


def to_bl(x, z, y):
    return app(x, z, y)


def top_surface():
    rings = 28
    bm = bmesh.new()
    grid = []
    for k in range(1, rings + 1):
        ring = []
        for (ox, oz) in OUTLINE_S:
            x = FOCUS_S[0] + (ox - FOCUS_S[0]) * k / rings
            z = FOCUS_S[1] + (oz - FOCUS_S[1]) * k / rings
            u, v = x / SCALE, z / SCALE
            bump = 0.036 * math.sin(u * 2.3 + 1) * math.sin(v * 1.9) + rng.uniform(-0.006, 0.006)
            ring.append(bm.verts.new(to_bl(x, z, bump if k < rings else 0.0)))
        grid.append(ring)
    # Le centre est un seul polygone : un éventail de centaines de triangles pointus étirerait la texture.
    bm.faces.new(list(reversed(grid[0])))
    for k in range(rings - 1):
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((grid[k][i], grid[k][j], grid[k + 1][j], grid[k + 1][i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    if max(bm.faces, key=lambda f: f.calc_center_median().z).normal.z < 0:
        for f in bm.faces:
            f.normal_flip()
    return geo.smooth(M.assign(geo.link("Plateau", bm), grass))


def outward(i):
    """Direction du contour vers l'extérieur au point i (le contour est étoilé autour du centre)."""
    px, pz = OUTLINE_S[(i - 2) % N]
    nx, nz = OUTLINE_S[(i + 2) % N]
    tx, tz = nx - px, nz - pz
    length = math.hypot(tx, tz) or 1
    return (tz / length, -tx / length)


def edge_band(name, rows, material, hem=(0, 0.0), seed=1):
    """Bande verticale le long du contour : (écart vers l'extérieur, hauteur) par rangée."""
    r = random.Random(seed)
    count, depth = hem
    lobes = [r.uniform(0.55, 1.3) for _ in range(max(count, 1))]
    bm = bmesh.new()
    verts = []
    for k, (out, h) in enumerate(rows):
        row = []
        for i, (ox, oz) in enumerate(OUTLINE_S):
            nx, nz = outward(i)
            hh = h
            if count and k == len(rows) - 1:
                lobe = lobes[int(i / N * count) % count]
                hh -= depth * lobe * abs(math.sin(i / N * math.pi * count)) ** 0.6
            row.append(bm.verts.new(to_bl(ox + nx * out, oz + nz * out, hh)))
        verts.append(row)
    for k in range(len(rows) - 1):
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((verts[k][i], verts[k][j], verts[k + 1][j], verts[k + 1][i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return geo.smooth(M.assign(geo.link(name, bm), material))


DEPTH = 6.5


def underside():
    rings = 30
    r = random.Random(4)
    phases = [r.uniform(0, math.tau) for _ in range(3)]
    bm = bmesh.new()
    verts = []
    for k in range(rings + 1):
        t = k / rings
        shrink = max(math.cos(t * math.pi / 2), 0.0) ** 1.05
        row = []
        for i, (ox, oz) in enumerate(OUTLINE_S):
            a = i / N * math.tau
            lumps = (0.05 * math.sin(a * 3 + t * 4.1 + phases[0]) + 0.035 * math.sin(a * 7 - t * 6.3 + phases[1])
                     + 0.02 * math.sin(a * 13 + t * 11 + phases[2]))
            tuck = 1 - 0.02 * max(0.0, 1 - t / 0.1)
            s = shrink * tuck * (1 + lumps * (0.2 + t))
            row.append(bm.verts.new(to_bl(FOCUS_S[0] + (ox - FOCUS_S[0]) * s, FOCUS_S[1] + (oz - FOCUS_S[1]) * s,
                                          -0.05 - t * DEPTH)))
        verts.append(row)
    for k in range(rings):
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((verts[k][i], verts[k][j], verts[k + 1][j], verts[k + 1][i]))
    bmesh.ops.remove_doubles(bm, verts=verts[-1], dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    obj = geo.link("Motte", bm)
    geo.displace(obj, "Motte bosses", 0.7 * SCALE, 0.22 * SCALE)
    geo.displace(obj, "Motte mottes", 0.32 * SCALE, 0.09 * SCALE)
    geo.displace(obj, "Motte grain", 0.14, 0.05)
    return geo.smooth(M.assign(obj, M.soil(geo.TOP, geo.TOP - geo.DEPTH)))


top_surface()
edge_band("Bordure", [(0.0, 0.0), (0.12, -0.12), (0.1, -0.3)], M.grass(), hem=(int(N / 6), 0.22), seed=6)
underside()

# --- Herbe et emplacements des décors ----------------------------------------------------------------
rng = random.Random(9)
xs_i = [p[0] for p in OUTLINE]
zs_i = [p[1] for p in OUTLINE]
AREA = 0.0
for i in range(N):
    (x1, z1), (x2, z2) = OUTLINE_S[i], OUTLINE_S[(i + 1) % N]
    AREA += (x1 * z2 - x2 * z1) / 2
AREA = abs(AREA)


def sample():
    """Point au hasard dans la région (mètres de la carte), loin du bord."""
    while True:
        u = rng.uniform(min(xs_i), max(xs_i))
        v = rng.uniform(min(zs_i), max(zs_i))
        if inside_outline(u, v, 0.05):
            return u * SCALE, v * SCALE


def wet(x, z, margin):
    return near_water(x / SCALE, z / SCALE, margin / SCALE)


# Tracé approximatif du chemin (centres des villes et détours) : rien de gros n'y est semé.
ROUTE = []
for site in SITES.get("cities", {}).values():
    ROUTE += [tuple(v) for v in site.get("via", [])] + [tuple(site["center"])]


def near_route(x, z, margin):
    for (ax, az), (bx, bz) in zip(ROUTE, ROUTE[1:]):
        dx, dz = bx - ax, bz - az
        t = max(0.0, min(1.0, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz or 1)))
        if math.hypot(x - ax - dx * t, z - az - dz * t) < margin:
            return True
    return False


def free_spot(margin, route_margin=0.0, water_margin=0.1):
    """Point libre : hors clairière, repère, eau et (si demandé) chemin."""
    while True:
        x, z = sample()
        if blocked(x, z, margin) or wet(x, z, water_margin):
            continue
        if route_margin and near_route(x, z, route_margin):
            continue
        return x, z


# Décors posés par l'app (kit strip-kit.glb, une pièce texturée par sorte) : leurs emplacements sont
# choisis ici, où l'on connaît l'eau, les repères et les clairières des villes. [sorte, x, z, angle, échelle]
DECOR_PATH = os.path.join(STYLIZED, "regionDecor.json")
DECOR_KINDS = (
    # sortes, nombre pour 100 m², échelle, rayon au sol à l'échelle 1, marges (clairière, chemin, eau)
    # Pas d'arbre ni de buisson : il n'y en a pas sur l'île. Quelques rochers, des galets, des fleurs.
    (("rocher-a", "rocher-b"), 2.2, (1.4, 2.2), 0.3, (0.4, 0.9, 0.3)),
    (("cailloux",), 5, (1.3, 1.9), 0.2, (0.2, 0.6, 0.2)),
    (("fleurs", "fleurs-b"), 12, (1.2, 1.7), 0.14, (0.2, 0.6, 0.15)),
)


def plan_decor():
    placed, decor = [], []
    for kinds, per100, (lo, hi), radius, (margin, route_margin, water_margin) in DECOR_KINDS:
        wanted = int(AREA / 100 * per100)
        done = tries = 0
        while done < wanted and tries < wanted * 200:
            tries += 1
            x, z = free_spot(margin, route_margin, water_margin)
            scale = rng.uniform(lo, hi)
            r = radius * scale
            if any(math.hypot(x - lx, z - lz) < lr + r + 0.3 for lx, lz, lr in LANDMARKS):
                continue
            if any(math.hypot(x - px, z - pz) < pr + r for px, pz, pr in placed):
                continue
            placed.append((x, z, r))
            decor.append([rng.choice(kinds), round(x, 2), round(z, 2), round(rng.uniform(0, math.tau), 2),
                          round(scale, 2)])
            done += 1
    return decor


def write_decor():
    decor = plan_decor()
    out = json.load(open(DECOR_PATH)) if os.path.exists(DECOR_PATH) else {}
    out[REGION_ID] = decor
    with open(DECOR_PATH, "w") as f:
        f.write("{\n" + ",\n".join(
            f'  "{k}": [\n' + ",\n".join("    " + json.dumps(d, ensure_ascii=False) for d in v) + "\n  ]"
            for k, v in out.items()) + "\n}\n")
    counts = {}
    for d in decor:
        counts[d[0]] = counts.get(d[0], 0) + 1
    print("DECORS", counts, flush=True)


if os.environ.get("EXPLORER_DECOR"):
    write_decor()
    raise SystemExit(0)


def tuft(bm, uv, x, z, r, tall=False):
    for _ in range(r.randint(5, 9) if tall else r.randint(4, 8)):
        bx, bz = x + r.uniform(-0.03, 0.03), z + r.uniform(-0.03, 0.03)
        yaw, lean = r.uniform(0, math.tau), r.uniform(0.1, 0.4) if tall else r.uniform(0.15, 0.55)
        h, w = r.uniform(0.11, 0.2) if tall else r.uniform(0.07, 0.15), r.uniform(0.008, 0.014)
        dx, dz = math.cos(yaw), math.sin(yaw)
        base = [bm.verts.new(app(bx - dz * w * s, bz + dx * w * s, -0.005)) for s in (1, -1)]
        tip = bm.verts.new(app(bx + dx * math.sin(lean) * h, bz + dz * math.sin(lean) * h, math.cos(lean) * h))
        face = bm.faces.new((*base, tip))
        for loop, co in zip(face.loops, ((0, 0), (1, 0), (0.5, 1))):
            loop[uv].uv = co


def build_blades():
    r = random.Random(31)
    bm = bmesh.new()
    uv = bm.loops.layers.uv.new("UVMap")
    count = tries = 0
    wanted = int(AREA * 16)
    while count < wanted and tries < wanted * 30:
        tries += 1
        x, z = sample()
        # Le long de l'eau, les touffes sont plus hautes, comme des herbes de rive.
        shore = wet(x, z, 0.55)
        if wet(x, z, 0.05) or blocked(x, z, 0.0) and not shore:
            continue
        if blocked(x, z, -0.3):
            continue
        if shore or r.random() < 0.85:
            tuft(bm, uv, x, z, r, tall=shore)
            count += 1
    obj = geo.link("brins", bm)
    M.assign(obj, bpy.data.materials.new("brins"))
    print("BRINS", count, "touffes", flush=True)
    return obj


# --- Plan : pose les villes dans les espaces libres de la région ------------------------------------------
# Villes de la région dans l'ordre du programme (identifiants du contenu), séparées par des virgules.
CITY_IDS = [c for c in os.environ.get("EXPLORER_CITIES", "").split(",") if c]


def route(a, b, centers):
    """Chemin libre (A* sur une grille de 0,5 m) de la ville a à la ville b, sans eau ni repère ni autre ville."""
    import heapq
    step = 0.5

    def free(x, z):
        if math.hypot(x - a[0], z - a[1]) < 1.3 or math.hypot(x - b[0], z - b[1]) < 1.3:
            return inside_outline(x / SCALE, z / SCALE, 0.4 / SCALE)
        if not inside_outline(x / SCALE, z / SCALE, 0.9 / SCALE) or wet(x, z, 0.7):
            return False
        if any(math.hypot(x - lx, z - lz) < lr + 0.7 for lx, lz, lr in LANDMARKS):
            return False
        return all(math.hypot(x - c[0], z - c[1]) > 1.6 for c in centers if c != a and c != b)

    start = (round(a[0] / step), round(a[1] / step))
    goal = (round(b[0] / step), round(b[1] / step))
    frontier = [(0.0, start)]
    came, cost = {start: None}, {start: 0.0}
    while frontier:
        _, cur = heapq.heappop(frontier)
        if cur == goal:
            break
        for dx, dz in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (1, -1), (-1, 1), (-1, -1)):
            nxt = (cur[0] + dx, cur[1] + dz)
            if not free(nxt[0] * step, nxt[1] * step):
                continue
            c = cost[cur] + math.hypot(dx, dz)
            if nxt not in cost or c < cost[nxt]:
                cost[nxt], came[nxt] = c, cur
                heapq.heappush(frontier, (c + math.hypot(goal[0] - nxt[0], goal[1] - nxt[1]), nxt))
    if goal not in came:
        return None, 1e3
    cells, cur = [], goal
    while cur:
        cells.append((cur[0] * step, cur[1] * step))
        cur = came[cur]
    cells.reverse()
    length = cost[goal] * step
    # Simplification (Douglas-Peucker) : on ne garde que les virages utiles.
    def simplify(points, tolerance=0.5):
        if len(points) < 3:
            return points
        (x1, z1), (x2, z2) = points[0], points[-1]
        length = math.hypot(x2 - x1, z2 - z1) or 1
        far, index = 0.0, 0
        for i, (x, z) in enumerate(points[1:-1], 1):
            d = abs((x2 - x1) * (z1 - z) - (x1 - x) * (z2 - z1)) / length
            if d > far:
                far, index = d, i
        if far < tolerance:
            return [points[0], points[-1]]
        return simplify(points[:index + 1], tolerance)[:-1] + simplify(points[index:], tolerance)

    return simplify(cells), length


def free_for_city(x, z, clearance):
    if not inside_outline(x / SCALE, z / SCALE, clearance / SCALE) or wet(x, z, clearance):
        return False
    return all(math.hypot(x - lx, z - lz) >= lr + clearance for lx, lz, lr in LANDMARKS)


def crosses_water(a, b):
    steps = 24
    return any(wet(a[0] + (b[0] - a[0]) * k / steps, a[1] + (b[1] - a[1]) * k / steps, 0.4) for k in range(steps + 1))


def plan_sites(count, clearance=float(os.environ.get("EXPLORER_CLEARANCE", "1.85")),
               apart=float(os.environ.get("EXPLORER_APART", "3.9"))):
    box_x = [p[0] for p in OUTLINE_S]
    box_z = [p[1] for p in OUTLINE_S]
    cands = [(x / 2, z / 2) for x in range(int(min(box_x)) * 2, int(max(box_x)) * 2)
             for z in range(int(min(box_z)) * 2, int(max(box_z)) * 2) if free_for_city(x / 2, z / 2, clearance)]
    print("CANDIDATS", len(cands), flush=True)
    r = random.Random(5)
    edge_cost = {}

    def cost(a, b):
        # Longueur du vrai chemin libre (A*), ou très grande s'il n'y en a pas.
        key = (a, b) if a < b else (b, a)
        if key not in edge_cost:
            edge_cost[key] = route(a, b, [])[1]
        return edge_cost[key]

    found = []
    for _ in range(int(os.environ.get("EXPLORER_TRIALS", "800"))):
        picks = r.sample(cands, count)
        if any(math.hypot(a[0] - b[0], a[1] - b[1]) < apart for i, a in enumerate(picks) for b in picks[:i]):
            continue
        # Plus court chemin qui passe par toutes les villes, sans traverser l'eau.
        order = min(itertools.permutations(range(count)),
                    key=lambda o: sum(cost(picks[o[i]], picks[o[i + 1]]) for i in range(count - 1)))
        score = -sum(cost(picks[order[i]], picks[order[i + 1]]) for i in range(count - 1))
        found.append((score, [picks[i] for i in order]))
    # Les meilleures dispositions d'abord ; la première dont tous les chemins existent est retenue.
    return [sites for _, sites in sorted(found, key=lambda f: -f[0])[:25]]


def lay_out(sites):
    """Chaîne de villes (nord-ouest d'abord) et chemins libres entre elles, ou None si l'un manque."""
    if sites[0][0] + sites[0][1] > sites[-1][0] + sites[-1][1]:
        sites = sites[::-1]
    cities = {}
    for i, (cid, centre) in enumerate(zip(CITY_IDS, sites)):
        via = []
        if i > 0:
            way, _ = route(sites[i - 1], centre, sites)
            if way is None:
                return None
            via = [[round(x, 1), round(z, 1)] for x, z in way[1:-1]]
        cities[cid] = {"center": [round(centre[0], 1), round(centre[1], 1)], "via": via}
    return cities


if os.environ.get("EXPLORER_PLAN"):
    cities = next((c for c in map(lay_out, plan_sites(len(CITY_IDS))) if c), None)
    if not cities:
        raise SystemExit("Aucune disposition possible : agrandir la carte ou réduire la clairière")
    out = json.load(open(SITES_PATH)) if os.path.exists(SITES_PATH) else {}
    out[REGION_ID] = {"scale": SCALE, "cities": cities}
    json.dump(out, open(SITES_PATH, "w"), indent=2, ensure_ascii=False)
    print("SITES", out[REGION_ID], flush=True)
    raise SystemExit(0)

# --- Aperçu : vue de haut quadrillée, pour poser les villes ------------------------------------------
if os.environ.get("EXPLORER_PREVIEW"):
    ns["water_surfaces"]()
    for o in [o for o in bpy.context.scene.objects if o.name.split(".")[0] in {"Eau", "Cascade"}]:
        o.location = o.location * SCALE
        o.scale = o.scale * SCALE
    ink = M.flat("ink")
    minx, maxx = min(p[0] for p in OUTLINE_S), max(p[0] for p in OUTLINE_S)
    minz, maxz = min(p[1] for p in OUTLINE_S), max(p[1] for p in OUTLINE_S)
    for gx in range(int(math.floor(minx / 2) * 2), int(maxx) + 1, 2):
        for gz in range(int(math.floor(minz / 2) * 2), int(maxz) + 1, 2):
            if in_polygon(OUTLINE_S, gx, gz):
                geo.cylinder(app(gx, gz, 0.04), 0.07, 0.02, ink, 8)
                geo.text(f"{gx},{gz}", app(gx + 0.12, gz - 0.12, 0.05), 0.3, 0.01, ink, rotation=(0, 0, 0),
                         bevel_depth=0.002)
    for name, (cx, cz) in CITY_SITES.items():
        geo.cylinder(app(cx, cz, 0.05), CLEARING, 0.02, M.flat("yellow"), 40)
        geo.text(name[6:], app(cx, cz, 0.08), 0.35, 0.01, ink, rotation=(0, 0, 0), bevel_depth=0.002)
    bake.lights()
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.cycles.glossy_bounces = 0
    scene.render.resolution_x, scene.render.resolution_y = 1400, int(1400 * (maxz - minz + 4) / (maxx - minx + 4))
    scene.view_settings.view_transform = "Standard"
    for mat in bpy.data.materials:
        for node in mat.node_tree.nodes if mat.node_tree else []:
            if node.bl_idname == "ShaderNodeBsdfPrincipled":
                node.inputs["Specular IOR Level"].default_value = 0.0
    camera_data = bpy.data.cameras.new("Camera")
    camera_data.type = "ORTHO"
    camera_data.ortho_scale = max(maxx - minx + 4, maxz - minz + 4)
    camera = bpy.data.objects.new("Camera", camera_data)
    scene.collection.objects.link(camera)
    camera.location = ((minx + maxx) / 2, -(minz + maxz) / 2, 60)
    camera.rotation_euler = (0, 0, 0)
    scene.camera = camera
    scene.render.filepath = os.environ["EXPLORER_PREVIEW"]
    bpy.ops.render.render(write_still=True)
    print("LANDMARKS", [(round(x, 1), round(z, 1), round(r, 1)) for x, z, r in LANDMARKS])
    print("OUTLINE", round(minx, 1), round(maxx, 1), round(minz, 1), round(maxz, 1))
    raise SystemExit(0)

# --- Cuisson et export -------------------------------------------------------------------------------
write_decor()
blades = build_blades()
bake.apply_all()
fixed = [o for o in bpy.context.scene.objects if o.type == "MESH" and o is not blades]
# Chaque pièce garde ses sommets à leur place dans la carte, origine à zéro : la pièce fusionnée a ainsi
# l'origine de la scène, et les matières calculées sur la position (rive de l'eau) tombent au bon endroit.
bpy.ops.object.select_all(action="DESELECT")
for o in fixed:
    o.select_set(True)
bpy.context.view_layer.objects.active = fixed[0]
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
body = [o for o in fixed if o.name.split(".")[0] in {"Plateau", "Bordure", "Motte"}]
props = [o for o in fixed if o not in body]
region = geo.join(body, "region")
# Les repères (pyramides, cubes…) ont leur propre texture : bien plus nette que s'ils partageaient celle du sol.
reperes = geo.join(props, "reperes") if props else None
print("TRIANGLES", sum(len(p.vertices) - 2 for p in region.data.polygons), flush=True)
started = time.time()
bake.lights()
size = int(os.environ.get("EXPLORER_REGION_SIZE", "3072"))
samples = int(os.environ.get("EXPLORER_BAKE_SAMPLES", "32"))
for obj, name, texture in ((region, "region", size), (reperes, "reperes", 2048)):
    if obj is None:
        continue
    bake.unwrap(obj)
    bake.bake(obj, f"{name}-{REGION_ID}", size=texture, samples=samples)
    print("CUIT", name, round(time.time() - started), "s", flush=True)
path = bake.export(f"region-{REGION_ID}.glb", jpeg_quality=80)
print("GLB", path, os.path.getsize(path), "octets")
