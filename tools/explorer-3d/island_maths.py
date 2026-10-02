"""
Île des Maths en 3D stylisée (carrousel X1), d'après assets/inspirations/explorer/inspiration_ile_mathématique.png.
Géométrie et matériaux procéduraux dans Blender, lumière cuite dans une seule texture (Cycles).
L'eau (π, rivière, cascade), les chiffres qui tombent et les nuages sont animés par l'app ; leur tracé
vient de src/features/explorer/stylized3d/water.json, lu ici pour poser les berges.

Usage : blender -b -P tools/explorer-3d/island_maths.py
Sortie : assets/explorer/models/island-maths-3d.glb
"""
import json
import math
import os
import random
import sys
import time

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402
from lib.geo import app, edge  # noqa: E402

WATER = json.load(open(os.path.join(geo.ROOT, "src", "features", "explorer", "stylized3d", "water.json")))

# ---------------------------------------------------------------------------
# Eau : tracé du π et de la rivière (l'eau elle-même est dans l'app), et rive peinte dans l'herbe
# ---------------------------------------------------------------------------
o = WATER["pi"]["origin"]
pi_outline = [(o["x"] + x * o["sx"], o["z"] - y * o["sz"]) for x, y in WATER["pi"]["shape"]]
river = geo.catmull_rom([(x, z) for x, z in WATER["river"]["points"]], 40)
half = WATER["river"]["width"] / 2


def inside(poly, x, z):
    result = False
    for (x1, z1), (x2, z2) in zip(poly, poly[1:] + poly[:1]):
        if (z1 > z) != (z2 > z) and x < x1 + (z - z1) * (x2 - x1) / (z2 - z1):
            result = not result
    return result


def near_water(x, z, margin):
    if inside(pi_outline, x, z) or any(
        math.hypot(x - px, z - pz) < margin for px, pz in pi_outline
    ):
        return True
    return any(math.hypot(x - rx, z - rz) < half + margin for rx, rz in river)


def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def water_mask(size=512, extent=3.6):
    """Image vue du dessus (repère Blender, [-extent, extent]²) : rouge = rive humide autour de
    l'eau, vert = sous l'eau. Même distance signée que le shader de l'eau de l'app."""
    coords = (np.arange(size) + 0.5) / size * 2 * extent - extent
    bx, by = np.meshgrid(coords, coords)
    x, z = bx, -by
    poly = np.array(pi_outline)
    nearest = np.full(x.shape, 1e9)
    within = np.zeros(x.shape, dtype=bool)
    for (ax, az), (cx, cz) in zip(poly, np.roll(poly, -1, axis=0)):
        ex, ez = cx - ax, cz - az
        t = np.clip(((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez), 0.0, 1.0)
        nearest = np.minimum(nearest, (x - ax - ex * t) ** 2 + (z - az - ez * t) ** 2)
        if az != cz:
            within ^= ((az > z) != (cz > z)) & (x < ax + (z - az) * ex / ez)
    distance = np.sqrt(nearest) * np.where(within, -1.0, 1.0)
    for (ax, az), (cx, cz) in zip(river, river[1:]):
        ex, ez = cx - ax, cz - az
        t = np.clip(((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez), 0.0, 1.0)
        distance = np.minimum(distance, np.hypot(x - ax - ex * t, z - az - ez * t) - half)
    pixels = np.zeros((size, size, 4), dtype=np.float32)
    pixels[..., 0] = 1.0 - smoothstep(0.0, 0.16, distance)
    pixels[..., 1] = smoothstep(0.01, -0.03, distance)
    pixels[..., 3] = 1.0
    image = bpy.data.images.new("rive", size, size, float_buffer=True)
    image.colorspace_settings.name = "Non-Color"
    image.pixels.foreach_set(pixels.ravel())
    image.pack()
    return image


geo.reset()
geo.island_body(shore=water_mask())

# ---------------------------------------------------------------------------
# Placement : chaque objet réserve un disque, hors de l'eau et dans l'île
# ---------------------------------------------------------------------------
occupied = []
claim_names = []


def claim(x, z, radius, name):
    a = math.atan2(z, x)
    if math.hypot(x, z) + radius * 0.5 > edge(a) * 0.97:
        print(f"ATTENTION {name} déborde de l'île")
    if near_water(x, z, radius * 0.6):
        print(f"ATTENTION {name} touche l'eau")
    occupied.append((x, z, radius))
    claim_names.append(name)


def free(x, z, radius):
    if near_water(x, z, radius + 0.04):
        return False
    return all(math.hypot(x - ox, z - oz) > radius + orad for ox, oz, orad in occupied)


wood, ink, white = M.wood(), M.flat("ink"), M.flat("white")


def ruler(length, width, thickness, material=None):
    """Règle en bois posée à plat le long de x, graduations et chiffres sur la face avant (−y)."""
    parts = [geo.box((0, 0, 0), (length, thickness, width), material or wood, bevel_width=0.018)]
    count = int(length * 10)
    for k in range(1, count):
        big = k % 5 == 0
        x = -length / 2 + k * length / count
        tick = 0.12 if big else 0.07
        parts.append(geo.box((x, -thickness / 2 - 0.004, width / 2 - tick / 2 - 0.01), (0.014, 0.01, tick), ink,
                             bevel_width=0))
        if big and k < count - 1:
            parts.append(geo.text(str(k // 5), (x, -thickness / 2 - 0.006, width / 2 - 0.23), 0.1, 0.008, ink,
                                  bevel_depth=0))
    return geo.join(parts, "Regle")


# ---------------------------------------------------------------------------
# Grue en règles : mât vertical, flèche inclinée, crochet qui porte une équerre
# ---------------------------------------------------------------------------
cx, cz = 0.55, -2.15
claim(cx, cz, 0.35, "grue")
mast = ruler(2.6, 0.26, 0.12)
mast.rotation_euler = (0, math.radians(-90), 0)
mast.location = app(cx, cz, 1.3)
tilt = math.radians(-11)
boom_len = 3.3
pivot = app(cx, cz, 2.5)
boom = ruler(boom_len, 0.22, 0.1)
boom.rotation_euler = (0, tilt, 0)
boom_offset = 0.95
front = cz + 0.12  # la flèche passe devant le mât
boom.location = app(cx + boom_offset * math.cos(-tilt), front, pivot[2] + boom_offset * math.sin(-tilt))
metal = M.metal()
geo.box(app(cx, cz, 2.5), (0.34, 0.34, 0.3), M.paint("blue", "blue-light"), bevel_width=0.05)
geo.box(app(cx - 0.62, front, 2.28), (0.34, 0.2, 0.26), M.metal(), bevel_width=0.04)
top = app(cx, cz, 3.05)
geo.tube([app(cx, cz, 2.6), top], 0.025, metal, "Mat")
tip_x = cx + (boom_len / 2 + boom_offset - 0.12) * math.cos(-tilt)
tip_y = 2.5 + (boom_len / 2 + boom_offset - 0.12) * math.sin(-tilt)
geo.tube([top, app(tip_x, front, tip_y + 0.1)], 0.012, metal, "Hauban")
geo.tube([top, app(cx - 0.8, front, 2.3)], 0.012, metal, "Hauban arriere")
hook_y = 1.55
geo.tube([app(tip_x, front, tip_y), app(tip_x, front, hook_y + 0.08)], 0.012, metal, "Cable")
geo.box(app(tip_x, front, hook_y + 0.08), (0.12, 0.08, 0.1), M.paint("yellow"), bevel_width=0.025)
set_square = [(-0.32, -0.5), (0.34, -0.5), (0.0, 0.0)]
geo.extruded(set_square, 0.07, M.paint("cyan", "cyan-light"), app(tip_x, front, hook_y + 0.02),
             bevel_width=0.025, name="Equerre")

# ---------------------------------------------------------------------------
# Rapporteur debout, compas géant, grand M
# ---------------------------------------------------------------------------
px, pz = -0.75, -2.25
claim(px, pz, 0.75, "rapporteur")
arc = [(math.cos(i / 32 * math.pi) * 0.9, math.sin(i / 32 * math.pi) * 0.9) for i in range(33)]
arc += [(math.cos(math.pi - i / 20 * math.pi) * 0.42, math.sin(math.pi - i / 20 * math.pi) * 0.42) for i in range(21)]
geo.extruded(arc, 0.1, M.paint("violet", "violet-light"), app(px, pz, 0.0), bevel_width=0.022, name="Rapporteur")
for k in range(1, 18):
    a = k / 18 * math.pi
    big = k % 3 == 0
    r = 0.9 - (0.08 if big else 0.05)
    geo.box(app(px + math.cos(a) * r, pz + 0.065, math.sin(a) * r), (0.016, 0.01, 0.13 if big else 0.07), white,
            rotation=(0, math.pi / 2 - a, 0), bevel_width=0)

kx, kz = 2.35, -0.05
claim(kx, kz, 0.45, "compas")
spread = math.radians(20)
height = 1.75
for side in (-1, 1):
    foot_x = kx + side * math.tan(spread) * height
    geo.tube([app(kx, kz, height), app(foot_x, kz, 0.16)], 0.045, metal, "Jambe")
geo.sphere(app(kx, kz, height + 0.05), 0.13, M.paint("violet"))
geo.cylinder(app(kx, kz, height + 0.28), 0.04, 0.34, metal)
geo.cylinder(app(kx - math.tan(spread) * height, kz, 0.1), 0.035, 0.2, metal, radius2=0.004)
geo.cylinder(app(kx + math.tan(spread) * height, kz, 0.12), 0.055, 0.22, M.paint("yellow"), radius2=0.012)

mx, mz = 1.65, -0.55
claim(mx, mz, 0.6, "M")
geo.text("M", app(mx, mz, 0.0), 1.3, 0.38, M.paint("pink", "pink-light"), bevel_depth=0.035)
geo.text("MATHS", app(mx - 0.4, mz + 0.235, 0.12), 0.17, 0.02, white, rotation=(math.pi / 2, -math.pi / 2, 0),
         bevel_depth=0.004)

# ---------------------------------------------------------------------------
# Pyramides, polyèdres, dé, cubes numérotés, boulier, balle
# ---------------------------------------------------------------------------
for x, z, size, color in ((-0.25, 1.95, 0.9, "orange"), (-0.95, 2.45, 0.62, "blue-light"),
                          (2.05, 1.15, 0.62, "violet-light")):
    claim(x, z, size * 0.6, "pyramide")
    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=size * 0.7, depth=size, location=app(x, z, size / 2),
                                    rotation=(0, 0, 0.5))
    geo.bevel(M.assign(bpy.context.active_object, M.paint(color)), 0.03, 2)

ix, iz = 1.3, 0.2
claim(ix, iz, 0.3, "icosaedre")
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.3, location=app(ix, iz, 0.3))
geo.bevel(M.assign(bpy.context.active_object, M.paint("green-toy")), 0.02, 2)

ox, oz = -2.6, 1.3
claim(ox, oz, 0.25, "octaedre")
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.26, depth=0.26, location=app(ox, oz, 0.39))
upper = bpy.context.active_object
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.26, depth=0.26, location=app(ox, oz, 0.13),
                                rotation=(math.pi, 0, 0))
octa = geo.join([upper, bpy.context.active_object], "Octaedre")
geo.bevel(M.assign(octa, M.paint("yellow")), 0.015, 2)

dx, dz, turn = 2.0, 1.95, 0.5
claim(dx, dz, 0.35, "de")
geo.box(app(dx, dz, 0.24), (0.46, 0.46, 0.46), M.paint("white"), rotation=(0, 0, turn), bevel_width=0.07)
pip = M.flat("graphite")
for ox_, oz_ in ((0, 0), (-0.12, -0.12), (0.12, 0.12)):
    geo.sphere(app(dx + ox_, dz + oz_, 0.475), 0.045, pip, 10)
face = (math.sin(turn) * 0.235, -math.cos(turn) * 0.235)
along = (math.cos(turn), math.sin(turn))
for s, h in ((-0.1, 0.34), (0.1, 0.14)):
    geo.sphere((dx + face[0] + along[0] * s, -dz + face[1] + along[1] * s, h), 0.045, pip, 10)

bx, bz = -1.9, 2.05
claim(bx, bz, 0.45, "cubes")
for (ox_, oy_, number, color) in ((-0.21, 0.19, "1", "blue"), (0.21, 0.19, "2", "yellow"), (0.0, 0.57, "3", "violet")):
    geo.box(app(bx + ox_, bz, oy_), (0.38, 0.38, 0.38), M.paint(color), bevel_width=0.05)
    geo.text(number, app(bx + ox_, bz + 0.2, oy_ - 0.1), 0.26, 0.02, white, bevel_depth=0.005)

ax, az = -2.55, 0.1
claim(ax, az, 0.55, "boulier")
for size, offset in (((1.15, 0.1, 0.1), (0, 1.0)), ((1.15, 0.1, 0.1), (0, 0.12)), ((0.1, 0.1, 1.0), (-0.53, 0.55)),
                     ((0.1, 0.1, 1.0), (0.53, 0.55))):
    geo.box(app(ax + offset[0], az, offset[1]), size, wood, bevel_width=0.02)
for row, color in enumerate(("blue", "violet", "cyan", "orange")):
    y = 0.32 + row * 0.18
    geo.cylinder(app(ax, az, y), 0.012, 1.0, metal, 8, rotation=(0, math.pi / 2, 0))
    for k in range(5):
        geo.sphere(app(ax - 0.36 + k * 0.12 + (row % 2) * 0.1, az, y), 0.055, M.paint(color), 10)

claim(0.85, -1.05, 0.2, "balle")
geo.sphere(app(0.85, -1.05, 0.16), 0.16, M.paint("blue"))


# ---------------------------------------------------------------------------
# Arbres-signes et arbres ronds
# ---------------------------------------------------------------------------
def trunk(x, z, height):
    return geo.cylinder(app(x, z, height / 2), 0.07, height, wood, 10, radius2=0.05)


PLUS = [(-0.14, 0.42), (0.14, 0.42), (0.14, 0.14), (0.42, 0.14), (0.42, -0.14), (0.14, -0.14), (0.14, -0.42),
        (-0.14, -0.42), (-0.14, -0.14), (-0.42, -0.14), (-0.42, 0.14), (-0.14, 0.14)]


def sign_tree(x, z, sign, color):
    claim(x, z, 0.45, f"arbre {sign}")
    trunk(x, z, 0.8)
    mat = M.paint(color)
    center = app(x, z, 1.22)
    if sign == "+":
        geo.extruded(PLUS, 0.2, mat, center, bevel_width=0.05, name="Signe +")
    elif sign == "×":
        cross = [((u - v) * 0.7071, (u + v) * 0.7071) for u, v in PLUS]
        geo.extruded(cross, 0.2, mat, center, bevel_width=0.05, name="Signe x")
    else:
        geo.box(center, (0.8, 0.2, 0.18), mat, bevel_width=0.06)
        geo.sphere(app(x, z, 1.52), 0.13, mat)
        geo.sphere(app(x, z, 0.93), 0.13, mat)


def round_tree(x, z, height, seed):
    claim(x, z, 0.45, "arbre rond")
    rng = random.Random(seed)
    trunk(x, z, height * 0.55)
    centers = [(app(x, z, height * 0.78), height * 0.3)]
    for k in range(6):
        a = k / 6 * math.tau + rng.uniform(-0.3, 0.3)
        centers.append((app(x + math.cos(a) * height * 0.22, z + math.sin(a) * height * 0.15,
                            height * (0.74 + rng.uniform(-0.08, 0.12))), height * rng.uniform(0.17, 0.23)))
    centers.append((app(x, z, height * 1.0), height * 0.2))
    geo.blob(centers, M.leaves("grass"))


sign_tree(-2.3, -0.95, "+", "green-toy")
sign_tree(2.35, -1.1, "×", "violet")
sign_tree(1.4, 2.3, "÷", "cyan")
for i, (x, z, h) in enumerate(((-2.1, -1.85, 1.0), (-1.55, -2.35, 1.1), (1.45, -2.45, 1.05))):
    round_tree(x, z, h, i + 1)

# ---------------------------------------------------------------------------
# Buissons et fleurs, semés là où il reste de la place
# ---------------------------------------------------------------------------
rng = random.Random(9)
bush = M.leaves("moss")
flowers = [M.flat("flower-white"), M.flat("flower-yellow"), M.flat("flower-violet"), M.flat("flower-white")]
bushes = flowers_placed = tries = 0
while (bushes < 16 or flowers_placed < 70) and tries < 20000:
    tries += 1
    a = rng.uniform(0, math.tau)
    rim = rng.random() < 0.6
    r = edge(a) * (rng.uniform(0.8, 0.92) if rim else math.sqrt(rng.random()) * 0.9)
    x, z = math.cos(a) * r, math.sin(a) * r
    if bushes < 16 and rim:
        size = rng.uniform(0.1, 0.17)
        if not free(x, z, size):
            continue
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=size, location=app(x, z, size * 0.45))
        obj = bpy.context.active_object
        obj.scale = (1, 1, 0.75)
        geo.displace(obj, "Buisson", 0.05, 0.035)
        geo.smooth(M.assign(obj, bush))
        occupied.append((x, z, size))
        bushes += 1
    elif flowers_placed < 70 and free(x, z, 0.03):
        geo.sphere(app(x, z, 0.03), 0.032, rng.choice(flowers), 6)
        flowers_placed += 1

# ---------------------------------------------------------------------------
# Sous l'île : quelques pierres prises dans la terre, cristaux discrets, racines qui pendent
# ---------------------------------------------------------------------------
stone = M.rock("rock")
for i, (angle, t, size) in enumerate(((1.1, 0.22, 0.34), (2.3, 0.45, 0.28), (0.3, 0.52, 0.24), (1.7, 0.7, 0.22),
                                      (2.9, 0.3, 0.26))):
    geo.rock(geo.underside_point(angle, t, 0.02), size, stone, i)

for angle, t, size, color in ((0.75, 0.3, 0.3, "crystal-cyan"), (2.05, 0.55, 0.26, "crystal-violet")):
    base = geo.underside_point(angle, t, 0.05)
    mat = M.crystal(color)
    for k in range(3):
        s = size * (1 if k == 0 else 0.6)
        bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=s * 0.35, depth=s * 1.6,
                                        location=(base[0] + (k - 1) * s * 0.4, base[1] - 0.05 * k, base[2] - s * 0.3),
                                        rotation=((k - 1) * 0.4, 0.3, 0))
        M.assign(bpy.context.active_object, mat)

rng = random.Random(12)
root = M.wood()
for k in range(11):
    angle = k / 11 * math.tau + rng.uniform(-0.2, 0.2)
    t = rng.uniform(0.45, 0.9)
    x, y, z = geo.underside_point(angle, t, 0.08)
    length = rng.uniform(0.45, 1.0) * (1.4 - t)
    # La racine sort de la terre vers l'extérieur, puis retombe en ondulant.
    out = (math.cos(angle), -math.sin(angle))
    side = (-out[1], out[0])
    wiggle = rng.uniform(0.6, 1.4)
    points = []
    for i in range(7):
        f = i / 6
        push = 0.18 * math.sin(f * math.pi * 0.8) * (1 - t)
        bend = 0.08 * math.sin(f * math.tau * wiggle + k)
        points.append((x + out[0] * push + side[0] * bend, y + out[1] * push + side[1] * bend,
                       z - length * f ** 1.3))
    geo.tube(points, rng.uniform(0.022, 0.04), root, "Racine", taper=[1.0, 0.9, 0.75, 0.6, 0.45, 0.3, 0.1])

def water_surfaces():
    """Eau immobile du π, de la rivière et de la cascade, pour l'image de repli seulement."""
    still = M.water()
    bm = bmesh.new()
    bm.faces.new([bm.verts.new(app(x, z, 0.022)) for x, z in pi_outline])
    for (ax, az), (bx, bz) in zip(river, river[1:]):
        tx, tz = bx - ax, bz - az
        n = math.hypot(tx, tz)
        sx, sz = -tz / n * (half + 0.01), tx / n * (half + 0.01)
        bm.faces.new([bm.verts.new(app(x, z, 0.026)) for x, z in
                      ((ax + sx, az + sz), (ax - sx, az - sz), (bx - sx, bz - sz), (bx + sx, bz + sz))])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    M.assign(geo.link("Eau", bm), still)
    # Cascade : un ruban qui s'évase en tombant, de plus en plus transparent.
    ex, ez = river[-1]
    length = math.hypot(ex, ez)
    ox, oz = ex / length, ez / length
    fall = WATER["fall"]
    bm = bmesh.new()
    rows = []
    for k, (d, y) in enumerate(fall):
        w = WATER["river"]["width"] * (1 + k / (len(fall) - 1) * 1.1) / 2
        cx, cz = ex + ox * d, ez + oz * d
        rows.append([bm.verts.new(app(cx - oz * w * s, cz + ox * w * s, y)) for s in (1, -1)])
    for (a1, b1), (a2, b2) in zip(rows, rows[1:]):
        bm.faces.new((a1, b1, b2, a2))
    M.assign(geo.link("Cascade", bm), M.waterfall(fall[-1][1]))


# --- fin de la construction des accessoires (region_map.py reprend la scène jusqu'ici) ---
if os.environ.get("EXPLORER_FALLBACK"):
    water_surfaces()
    bake.lights()
    bake.fallback(os.environ["EXPLORER_FALLBACK"])
    raise SystemExit(0)

if os.environ.get("EXPLORER_PREVIEW"):
    bake.lights()
    crop = os.environ.get("EXPLORER_PREVIEW_CROP")
    scale = float(os.environ.get("EXPLORER_PREVIEW_SCALE", "1"))
    bake.preview(os.environ["EXPLORER_PREVIEW"], width=int(520 * scale), height=int(1126 * scale),
                 crop=tuple(map(float, crop.split(","))) if crop else None)
    raise SystemExit(0)

# ---------------------------------------------------------------------------
# Cuisson et export
# ---------------------------------------------------------------------------
bake.apply_all()
fixed = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
if os.environ.get("EXPLORER_STATS"):
    counts = {}
    for obj in fixed:
        key = obj.name.split(".")[0]
        counts[key] = counts.get(key, 0) + sum(len(p.vertices) - 2 for p in obj.data.polygons)
    for key, count in sorted(counts.items(), key=lambda kv: -kv[1])[:15]:
        print("TRI", key, count)
    print("TRIANGLES", sum(counts.values()))
    if os.environ["EXPLORER_STATS"] == "seulement":
        raise SystemExit(0)
island = geo.join(fixed, "ile")
print("TRIANGLES", sum(len(p.vertices) - 2 for p in island.data.polygons))
started = time.time()
bake.unwrap(island)
print("UV", round(time.time() - started), "s")
bake.lights()
bake.bake(island, "ile-maths", size=2048, samples=int(os.environ.get("EXPLORER_BAKE_SAMPLES", "128")))
print("CUISSON", round(time.time() - started), "s")

# Chiffres de la cascade : non cuits, l'app les fait tomber et briller.
digit = bpy.data.materials.new("chiffre")
digit.use_nodes = True
digit.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (1, 1, 1, 1)
for d in range(10):
    geo.text(str(d), (0, 0, 0), 0.3, 0.05, digit, bevel_depth=0.006, align_y="CENTER").name = f"chiffre_{d}"
# Brins d'herbe : touffes non cuites, que l'app fait onduler au vent (v de la texture = hauteur du
# brin, de 0 au pied à 1 à la pointe). Au bord de l'île, le long de l'eau, et çà et là.
def tuft(bm, uv, x, z, rng, tall=False):
    for _ in range(rng.randint(5, 9) if tall else rng.randint(4, 8)):
        bx, bz = x + rng.uniform(-0.03, 0.03), z + rng.uniform(-0.03, 0.03)
        yaw, lean = rng.uniform(0, math.tau), rng.uniform(0.1, 0.4) if tall else rng.uniform(0.15, 0.55)
        h, w = rng.uniform(0.11, 0.2) if tall else rng.uniform(0.07, 0.15), rng.uniform(0.008, 0.014)
        dx, dz = math.cos(yaw), math.sin(yaw)
        base = [bm.verts.new(app(bx - dz * w * s, bz + dx * w * s, -0.005)) for s in (1, -1)]
        tip = bm.verts.new(app(bx + dx * math.sin(lean) * h, bz + dz * math.sin(lean) * h, math.cos(lean) * h))
        face = bm.faces.new((*base, tip))
        for loop, co in zip(face.loops, ((0, 0), (1, 0), (0.5, 1))):
            loop[uv].uv = co


blades_rng = random.Random(31)
bm = bmesh.new()
uv = bm.loops.layers.uv.new("UVMap")
tufts = tries = 0
while tufts < 380 and tries < 40000:
    tries += 1
    kind = blades_rng.random()
    a = blades_rng.uniform(0, math.tau)
    reach = blades_rng.uniform(0.84, 0.97) if kind < 0.4 else math.sqrt(blades_rng.random()) * 0.95
    x, z = math.cos(a) * edge(a) * reach, math.sin(a) * edge(a) * reach
    # Le long de l'eau, les touffes sont plus hautes et plus fournies, comme des herbes de rive.
    shore = 0.4 <= kind < 0.7
    if shore and not near_water(x, z, 0.18):
        continue
    if free(x, z, 0.03):
        tuft(bm, uv, x, z, blades_rng, tall=shore)
        tufts += 1
blades = geo.link("brins", bm)
blade_material = bpy.data.materials.new("brins")
M.assign(blades, blade_material)
print("BRINS", tufts, "touffes,", len(blades.data.polygons), "brins")

path = bake.export("island-maths-3d.glb")
print("GLB", path, os.path.getsize(path), "octets")
