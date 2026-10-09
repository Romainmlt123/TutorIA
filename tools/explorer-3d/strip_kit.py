"""
Kit de décor des cartes de région (X2b) : rochers, cailloux, touffes de fleurs, barrière, dans le
même style de maquette réaliste que l'île des Maths. Chaque pièce a sa propre texture cuite (Cycles),
assez fine pour être vue de près ; l'app les pose en nombre (un seul appel de dessin par sorte).
Les maillages sont allégés après coup : leur relief fin est déjà peint dans la texture.

Usage : blender -b -P tools/explorer-3d/strip_kit.py
        EXPLORER_PREVIEW=/chemin/apercu.png blender -b -P tools/explorer-3d/strip_kit.py   (sans cuisson)
Sortie : assets/explorer/models/strip-kit.glb
"""
import math
import os
import random
import sys
import time

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import bake, geo  # noqa: E402
from lib import materials as M  # noqa: E402
from lib.geo import app  # noqa: E402

geo.reset()


# ---------------------------------------------------------------------------
# Décors, posés au centre de leur pied (origine au sol)
# ---------------------------------------------------------------------------
plank = M.wood()


def rocks(name, spec, seed):
    stone = M.rock("rock")
    parts = [geo.rock(app(x, z, r * 0.4), r, stone, seed + i, stretch) for i, (x, z, r, stretch) in enumerate(spec)]
    return geo.join(parts, name)


def flowers(name, seed, colors):
    """Touffe de fleurs des champs : un coussin de feuilles, des tiges, et des fleurs à cinq pétales
    autour d'un cœur, de deux ou trois couleurs."""
    rng = random.Random(seed)
    leaf = M.leaves("grass")
    heart = M.flat("flower-yellow")
    tones = [M.flat(c) for c in colors]
    parts = []
    for k in range(4):
        a = k / 4 * math.tau + 0.3
        pad = geo.sphere(app(math.cos(a) * 0.06, math.sin(a) * 0.05, 0.035), 0.06, leaf, 12)
        pad.scale = (1.2, 1.0, 0.55)
        parts.append(pad)
    for k in range(8):
        a, r = rng.uniform(0, math.tau), rng.uniform(0.02, 0.12)
        x, z, h = math.cos(a) * r, math.sin(a) * r, rng.uniform(0.08, 0.15)
        tx, tz = x * 1.15, z * 1.15
        parts.append(geo.tube([app(x, z, 0.02), app(tx, tz, h)], 0.004, leaf, "Tige"))
        petal = rng.choice(tones)
        size = rng.uniform(0.018, 0.026)
        for p in range(5):
            b = p / 5 * math.tau
            leaf_piece = geo.sphere(app(tx + math.cos(b) * size, tz + math.sin(b) * size, h + 0.006), size * 0.75,
                                    petal, 8)
            leaf_piece.scale = (1.0, 1.0, 0.4)
            parts.append(leaf_piece)
        parts.append(geo.sphere(app(tx, tz, h + 0.012), size * 0.55, heart, 8))
    return geo.join(parts, name)


def pebbles(name, seed):
    """Poignée de galets clairs, de tailles différentes, à moitié enfoncés dans l'herbe."""
    rng = random.Random(seed)
    stone = M.rock("rock-light")
    parts = []
    for k in range(6):
        a, r = rng.uniform(0, math.tau), rng.uniform(0.0, 0.16)
        size = rng.uniform(0.035, 0.075)
        parts.append(geo.rock(app(math.cos(a) * r, math.sin(a) * r, size * 0.25), size, stone, seed + k,
                              (1.3, 1.0, 0.6)))
    return geo.join(parts, name)


def fence(name):
    parts = []
    for x in (-0.42, 0.0, 0.42):
        parts.append(geo.box(app(x, 0, 0.17), (0.055, 0.055, 0.34), plank, bevel_width=0.008))
    for y in (0.12, 0.26):
        parts.append(geo.box(app(0, 0.0, y), (0.95, 0.03, 0.045), plank, bevel_width=0.008))
    return geo.join(parts, name)


DECOR = {
    "rocher-a": lambda: rocks("rocher-a", ((0, 0, 0.2, (1.25, 1.0, 0.8)), (0.27, 0.1, 0.12, (1.1, 1.0, 0.85)),
                                          (-0.2, 0.2, 0.09, (1.0, 1.0, 0.8))), 30),
    "rocher-b": lambda: rocks("rocher-b", ((0, 0, 0.26, (1.5, 1.0, 0.65)), (0.36, -0.08, 0.1, (1.2, 1.0, 0.8))), 40),
    "cailloux": lambda: pebbles("cailloux", 50),
    "fleurs": lambda: flowers("fleurs", 7, ("flower-white", "flower-violet", "pink-light")),
    "fleurs-b": lambda: flowers("fleurs-b", 13, ("flower-yellow", "flower-white", "flower-red")),
    "barriere": lambda: fence("barriere"),
}

# Taille de la texture de chaque pièce, et nombre de triangles visé après allègement.
TEXTURE = {"rocher-a": 512, "rocher-b": 512, "fleurs": 512, "fleurs-b": 512}
TRIANGLES = {"rocher-a": 500, "rocher-b": 400, "cailloux": 400}
SPACING = 3.0


def lighten(obj, target):
    """Allège un maillage jusqu'à environ `target` triangles (décimation), s'il en a plus."""
    count = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    if count <= target:
        return count
    mod = obj.modifiers.new("Allegement", "DECIMATE")
    mod.ratio = target / count
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


# Les pièces sont cuites côte à côte, posées sur un sol d'herbe qui leur donne ombre de contact et rebond vert.
catcher = geo.box(app(0, 0, -0.05), (SPACING * len(DECOR) + 2, 3.0, 0.1), M.meadow(), bevel_width=0)
pieces = []
for k, (name, build) in enumerate(DECOR.items()):
    obj = build()
    obj.location = app((k - (len(DECOR) - 1) / 2) * SPACING, 0, 0)
    pieces.append((obj, name))
bake.apply_all()
for obj, name in pieces:
    print("TRIANGLES", name, lighten(obj, TRIANGLES.get(name, 10 ** 9)), flush=True)

if os.environ.get("EXPLORER_PREVIEW"):
    bake.lights()
    bake.preview(os.environ["EXPLORER_PREVIEW"], width=1600, height=600)
    raise SystemExit(0)

SAMPLES = int(os.environ.get("EXPLORER_BAKE_SAMPLES", "32"))
bake.lights()
started = time.time()
for obj, name in pieces:
    bake.unwrap(obj)
    bake.bake(obj, name, size=TEXTURE.get(name, 512), samples=SAMPLES)
    print("CUIT", name, round(time.time() - started), "s", flush=True)
bpy.data.objects.remove(catcher, do_unlink=True)
for obj, _ in pieces:
    obj.location = (0, 0, 0)
path = bake.export("strip-kit.glb")
print("GLB", path, os.path.getsize(path), "octets")
